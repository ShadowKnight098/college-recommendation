const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', feedbackController.submitFeedback);

// Admin-only managed routes
router.get('/', authMiddleware, feedbackController.getAllFeedback);
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;
