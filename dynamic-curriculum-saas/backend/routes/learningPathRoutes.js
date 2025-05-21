const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');
const { protect } = require('../middleware/authMiddleware'); // Auth for all these routes


// L&D Manager generates/regenerates path for an employee
router.post('/employee/:employeeId/generate', protect, learningPathController.generateOrUpdatePath);

// Get a path for a specific employee (viewed by L&D Manager or assigned Employee)
router.get('/employee/:employeeId', protect, learningPathController.getLearningPathForEmployee);

// L&D Manager curates/updates the path properties
router.put('/:pathId', protect, learningPathController.curateLearningPath);

// Employee (or L&D) updates a specific step's completion status
router.patch('/:pathId/step/:stepIndex', protect, learningPathController.updateStepStatus);

module.exports = router;