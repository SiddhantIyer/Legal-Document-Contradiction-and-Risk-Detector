const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Organization = require('../models/Organization');

// @desc    Mock Stripe Checkout (Upgrades account to PRO instantly for demo)
// @route   POST /api/billing/upgrade
// @access  Private
router.post('/upgrade', protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    organization.subscriptionStatus = 'PRO';
    await organization.save();

    res.json({ message: 'Successfully upgraded to PRO!', subscriptionStatus: 'PRO' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during upgrade' });
  }
});

// @desc    Get current billing status
// @route   GET /api/billing/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    res.json({ subscriptionStatus: organization.subscriptionStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching billing status' });
  }
});

module.exports = router;
