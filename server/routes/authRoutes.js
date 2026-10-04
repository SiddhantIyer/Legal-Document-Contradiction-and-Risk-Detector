const express = require('express');
const { register, login, getMe, enable2FA, verify2FA, disable2FA } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/verify', protect, verify2FA);
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
