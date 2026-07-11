const express = require('express');
const router = express.Router();
const multer = require('multer');
const collegeController = require('../controllers/collegeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Configure temporary file storage configuration for CSV files
const upload = multer({ dest: 'uploads/' });

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
