const { generateLearningPath: callGemini } = require('../services/geminiService');
const { LearningPath, Employee, User } = require('../models');

// @desc    Generate or regenerate learning path for an employee
// @route   POST /api/learning-paths/employee/:employeeId/generate
// @access  Private (L&D Manager)
exports.generateOrUpdatePath = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const ldManagerUserId = req.user.id; // From auth middleware

        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: req.user.company_id }
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found or not in your company." });
        }

        const { current_skills, desired_skills_goal } = employee;
        if (!current_skills || !desired_skills_goal) {
            return res.status(400).json({ message: "Employee current skills and desired goal must be set first." });
        }

        const aiGeneratedSteps = await callGemini(current_skills, desired_skills_goal);

        if (aiGeneratedSteps.error) {
            return res.status(500).json({ message: "AI generation failed.", details: aiGeneratedSteps.raw || aiGeneratedSteps.error });
        }

        // Ensure path_data has completion status
        const pathDataWithStatus = aiGeneratedSteps.map(step => ({ ...step, completed: false }));

        let learningPath = await LearningPath.findOne({ where: { employee_id: employeeId } });
        if (learningPath) {
            learningPath.path_data = pathDataWithStatus;
            learningPath.generated_by_user_id = ldManagerUserId;
            learningPath.status = 'draft'; // Reset to draft when re-generating
            await learningPath.save();
        } else {
            learningPath = await LearningPath.create({
                employee_id: employeeId,
                generated_by_user_id: ldManagerUserId,
                path_data: pathDataWithStatus,
                status: 'draft'
            });
        }
        const updatedEmployee = await Employee.findByPk(employeeId, {
            include: [{ model: LearningPath, as: 'learningPath' }]
        });

        res.status(201).json(updatedEmployee.learningPath);
    } catch (error) {
        console.error("Error in generateOrUpdatePath:", error);
        res.status(500).json({ message: "Error creating/updating learning path", error: error.message });
    }
};

// @desc    Get learning path for a specific employee (viewed by L&D or Employee)
// @route   GET /api/learning-paths/employee/:employeeId
// @access  Private (L&D Manager or assigned Employee)
exports.getLearningPathForEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        let learningPath;

        // TODO: Add logic if an employee can view their own path
        // For now, only L&D manager of the company can view
        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: req.user.company_id }
        });

        if (!employee) {
             return res.status(404).json({ message: "Employee not found or not in your company." });
        }

        learningPath = await LearningPath.findOne({ where: { employee_id: employeeId } });

        if (!learningPath) {
            return res.status(404).json({ message: "Learning path not found for this employee." });
        }
        res.json(learningPath);
    } catch (error) {
        console.error("Error in getLearningPathForEmployee:", error);
        res.status(500).json({ message: "Error fetching learning path", error: error.message });
    }
};


// @desc    L&D Manager curates/updates the learning path (steps, status)
// @route   PUT /api/learning-paths/:pathId
// @access  Private (L&D Manager)
exports.curateLearningPath = async (req, res) => {
    try {
        const { pathId } = req.params;
        const { path_data, status } = req.body;

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['company_id'] }]
        });

        if (!learningPath) {
            return res.status(404).json({ message: "Learning path not found." });
        }

        // Authorization: Check if L&D manager belongs to the same company as the employee of the path
        if (learningPath.employee.company_id !== req.user.company_id) {
            return res.status(403).json({ message: "Not authorized to update this learning path." });
        }

        if (path_data) learningPath.path_data = path_data;
        if (status) learningPath.status = status; // 'assigned' by L&D

        await learningPath.save();
        res.json(learningPath);
    } catch (error) {
        console.error("Error in curateLearningPath:", error);
        res.status(500).json({ message: "Error updating learning path", error: error.message });
    }
};

// @desc    Employee updates a step's completion status
// @route   PATCH /api/learning-paths/:pathId/step/:stepIndex
// @access  Private (Assigned Employee or L&D Manager)
exports.updateStepStatus = async (req, res) => {
    try {
        const { pathId, stepIndex } = req.params;
        const { completed } = req.body; // boolean

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'company_id'] }]
        });

        if (!learningPath) {
            return res.status(404).json({ message: "Learning path not found." });
        }

        // Authorization:
        // For MVP, let's assume if req.user is the L&D manager of the company, they can update.
        // Later, you'd check if req.user.id matches employee.user_id if employees have direct logins
        // or if req.user.id is L&D and employee.company_id matches req.user.company_id.
        const isLdManagerForThisPath = learningPath.employee.company_id === req.user.company_id && req.user.role === 'ld_manager';
        // const isAssignedEmployee = req.user.role === 'employee' && learningPath.employee_id === req.user.employee_profile_id; // if employees log in

        if (!isLdManagerForThisPath /* && !isAssignedEmployee */) {
             return res.status(403).json({ message: "Not authorized to update this step." });
        }


        if (!learningPath.path_data || !learningPath.path_data[stepIndex]) {
            return res.status(404).json({ message: "Step not found in learning path." });
        }

        learningPath.path_data[stepIndex].completed = completed;
        learningPath.changed('path_data', true); 
        await learningPath.save();

        const allCompleted = learningPath.path_data.every(step => step.completed);
        if (allCompleted && learningPath.status !== 'completed') {
            learningPath.status = 'completed';
            await learningPath.save();
        } else if (!allCompleted && learningPath.status === 'completed') {
             learningPath.status = 'in_progress'; // Or back to 'assigned' if that makes sense
             await learningPath.save();
        }


        res.json(learningPath); // Return the whole path or just the step
    } catch (error) {
        console.error("Error in updateStepStatus:", error);
        res.status(500).json({ message: "Error updating step status", error: error.message });
    }
};