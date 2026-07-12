const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/college/:collegeId', reviewController.getApprovedReviewsForCollege);

// Student protected route (to submit reviews)
router.post('/', authMiddleware.verifyStudentToken, reviewController.submitReview);

// Admin protected routes (to moderate reviews)
router.get('/pending', authMiddleware, reviewController.getPendingReviews);
router.put('/:id/approve', authMiddleware, reviewController.approveReview);
router.delete('/:id', authMiddleware, reviewController.rejectReview);

module.exports = router;
