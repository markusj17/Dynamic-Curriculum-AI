const express = require('express');
const router = express.Router();
const {
    generateOrUpdatePath,
    getLearningPathForEmployee,
    curateLearningPath,
    updateStepStatus
} = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware');

router.post('/employee/:employeeId/generate', protect, generateOrUpdatePath);

router.get('/employee/:employeeId', protect, getLearningPathForEmployee);

router.put('/:pathId', protect, curateLearningPath);

router.patch('/:pathId/step/:stepIndex', protect, updateStepStatus);


module.exports = router;