const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { logAction } = require('../utils/logger');


// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create user without org first to get user ID
    const user = await User.create({ name, email, password, role: 'OWNER' });

    // Create an organization for this user
    const organization = await Organization.create({
      name: `${name}'s Organization`,
      ownerId: user._id,
    });

    // Update user with organization
    user.organization = organization._id;
    await user.save();

    // Generate token and respond
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: organization._id,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token and respond
    const token = generateToken(user._id);

    // Audit Log
    req.user = user; // Attach for logger
    await logAction(req, 'LOGIN', 'User Login');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organization,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organization,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// @desc    Enable 2FA
// @route   POST /api/auth/2fa/enable
// @access  Private
const enable2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `AI Paralegal (${req.user.email})` });
    
    // Temporarily save secret
    const user = await User.findById(req.user._id);
    user.twoFactorSecret = secret.base32;
    await user.save();

    const dataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ secret: secret.base32, qrCode: dataUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error generating 2FA secret' });
  }
};

// @desc    Verify and activate 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      await logAction(req, '2FA_ENABLED', 'Enabled Two-Factor Authentication');
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error verifying 2FA token' });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();
    await logAction(req, '2FA_DISABLED', 'Disabled Two-Factor Authentication');

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
};

module.exports = { register, login, getMe, enable2FA, verify2FA, disable2FA };
