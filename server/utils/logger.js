const AuditLog = require('../models/AuditLog');

const logAction = async (req, action, resource, details = '') => {
  try {
    if (!req.user || !req.user.organization) return;

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    await AuditLog.create({
      organizationId: req.user.organization,
      userId: req.user._id,
      userName: req.user.name,
      action,
      resource,
      ipAddress,
      details
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = { logAction };
