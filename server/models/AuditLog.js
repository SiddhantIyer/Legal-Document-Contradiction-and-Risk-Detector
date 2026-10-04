const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['LOGIN', 'LOGOUT', 'CONTRACT_UPLOAD', 'CONTRACT_DELETE', 'CLAUSE_REWRITE', 'INVITE_USER', '2FA_ENABLED', '2FA_DISABLED'],
    },
    resource: {
      type: String,
      default: 'System', // Could be Contract ID, User Email, etc.
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    details: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
