const Organization = require('../models/Organization');

const requirePro = async (req, res, next) => {
  try {
    // Super Admins bypass everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const organization = await Organization.findById(req.user.organization);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.subscriptionStatus !== 'PRO' && organization.subscriptionStatus !== 'ENTERPRISE') {
      return res.status(403).json({ 
        message: 'This feature requires a PRO or ENTERPRISE subscription. Please upgrade your plan.',
        requiresUpgrade: true 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription' });
  }
};

const checkUsageLimit = async (req, res, next) => {
  try {
    if (req.user.role === 'SUPER_ADMIN') return next();

    const organization = await Organization.findById(req.user.organization);
    
    // If PRO or Enterprise, no limits
    if (organization.subscriptionStatus === 'PRO' || organization.subscriptionStatus === 'ENTERPRISE') {
      return next();
    }

    // FREE tier logic - check contract count
    const Contract = require('../models/Contract');
    const contractCount = await Contract.countDocuments({ organizationId: req.user.organization });

    if (contractCount >= 3) {
      return res.status(403).json({ 
        message: 'Free tier limit reached (3 contracts). Please upgrade to PRO to upload more.',
        requiresUpgrade: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking usage limits' });
  }
};

module.exports = { requirePro, checkUsageLimit };
