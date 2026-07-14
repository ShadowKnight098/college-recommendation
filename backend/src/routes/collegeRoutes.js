const express = require('express');
const router = express.Router();
const multer = require('multer');
const collegeController = require('../controllers/collegeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Configure temporary file storage configuration for CSV files with strict limits
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file size to prevent disk exhaust DoS
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    if (isCsv) {
      cb(null, true);
    } else {
      cb(new Error('Access denied. Only CSV files are allowed.'));
    }
  }
});

router.get('/', collegeController.getAllColleges);
router.get('/filters', collegeController.getFilterOptions);
router.get('/:id', collegeController.getCollegeById);

// Admin-only managed routes
router.post('/', authMiddleware, collegeController.createCollege);
router.put('/:id', authMiddleware, collegeController.updateCollege);
router.delete('/:id', authMiddleware, collegeController.deleteCollege);
router.post('/import', authMiddleware, upload.single('file'), collegeController.importCSV);
router.post('/import-branches', authMiddleware, collegeController.importBranches);

module.exports = router;
