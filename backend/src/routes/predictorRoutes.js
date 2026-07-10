const express = require('express');
const router = express.Router();
const predictorController = require('../controllers/predictorController');

router.post('/predict', predictorController.predictColleges);

module.exports = router;
