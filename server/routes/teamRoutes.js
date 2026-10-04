const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requirePro } = require('../middleware/billingMiddleware');
const User = require('../models/User');
const Organization = require('../models/Organization');

// @desc    Get organization and its members
// @route   GET /api/team
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    const members = await User.find({ organization: req.user.organization })
      .select('-password');
      
    res.json({ organization, members });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching team data' });
  }
});

// @desc    Invite member to organization
// @route   POST /api/team/invite
// @access  Private (OWNER only, PRO only)
router.post('/invite', protect, requirePro, async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only the OWNER can invite members' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password, // In a real app this should be an invite link, but for demo we just set a default password
      role: role || 'PARALEGAL',
      organization: req.user.organization
    });

    res.status(201).json({ message: 'User invited successfully', user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error inviting member' });
  }
});

module.exports = router;
