const express = require('express');
const multer = require('multer');
const {
  getContracts,
  getContract,
  createContract,
  uploadAndAnalyze,
  deleteContract,
  chatWithContract,
  rewriteClause,
  compareContract,
} = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { checkUsageLimit, requirePro } = require('../middleware/billingMiddleware');

const router = express.Router();

// Multer config — store files in memory (never on disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are supported'), false);
    }
  },
});

router.get('/', protect, getContracts);
router.get('/:id', protect, getContract);
router.post('/', protect, checkUsageLimit, createContract);
router.post('/upload', protect, checkUsageLimit, upload.single('file'), uploadAndAnalyze);
router.post('/:id/chat', protect, chatWithContract);
router.post('/:id/rewrite', protect, requirePro, rewriteClause);
router.post('/:id/compare', protect, upload.single('file'), compareContract);
router.delete('/:id', protect, deleteContract);

module.exports = router;

