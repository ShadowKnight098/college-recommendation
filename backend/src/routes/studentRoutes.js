const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', studentController.signup);
router.post('/login', studentController.login);
router.get('/me', authMiddleware.verifyStudentToken, studentController.getMe);

module.exports = router;
