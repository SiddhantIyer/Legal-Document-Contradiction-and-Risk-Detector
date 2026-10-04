const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs for the organization
// @route   GET /api/audit
// @access  Private (OWNER only)
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ message: 'Only the OWNER can view audit logs' });
    }

    const logs = await AuditLog.find({ organizationId: req.user.organization })
      .sort('-createdAt')
      .limit(100);
      
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching audit logs' });
  }
});

module.exports = router;
