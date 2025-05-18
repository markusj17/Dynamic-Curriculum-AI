const { generateLearningPath } = require('../services/geminiService');
const { LearningPath, Employee } = require('../models');

exports.generateOrUpdatePath = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const ldManagerUserId = req.user.id;

        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: req.user.company_id }
        });

        if (!employee) {
            const err = new Error("Employee not found or not in your company.");
            err.statusCode = 404;
            throw err;
        }

        const { current_skills, desired_skills_goal } = employee;
        if (!current_skills || !desired_skills_goal) {
            const err = new Error("Employee current skills and desired goal must be set first.");
            err.statusCode = 400;
            throw err;
        }

        const learningPathSteps = await generateLearningPath(current_skills, desired_skills_goal);
        const pathDataWithStatus = learningPathSteps.map(step => ({ ...step, completed: false }));

        let learningPath = await LearningPath.findOne({ where: { employee_id: employeeId } });
        if (learningPath) {
            learningPath.path_data = pathDataWithStatus;
            learningPath.generated_by_user_id = ldManagerUserId;
            learningPath.status = 'draft';
            await learningPath.save();
        } else {
            learningPath = await LearningPath.create({
                employee_id: employeeId,
                generated_by_user_id: ldManagerUserId,
                path_data: pathDataWithStatus,
                status: 'draft'
            });
        }
        
        const updatedEmployeeWithPath = await Employee.findByPk(employeeId, {
            include: [{ model: LearningPath, as: 'learningPath' }]
        });

        res.status(200).json(updatedEmployeeWithPath.learningPath);

    } catch (error) {
        console.error("Controller Error in generateOrUpdatePath:", error.message);
        next(error); 
    }
};

exports.getLearningPathForEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: req.user.company_id }
        });

        if (!employee) {
             const err = new Error("Employee not found or not in your company.");
             err.statusCode = 404;
             throw err;
        }

        const learningPath = await LearningPath.findOne({ where: { employee_id: employeeId } });
        if (!learningPath) {
            // It's not necessarily an error if a path doesn't exist yet,
            // could return empty or a specific status. For now, 404 if specifically requested.
            return res.status(404).json({ message: "Learning path not found for this employee." });
        }
        res.json(learningPath);
    } catch (error) {
        console.error("Controller Error in getLearningPathForEmployee:", error.message);
        next(error);
    }
};

exports.curateLearningPath = async (req, res, next) => {
    try {
        const { pathId } = req.params;
        const { path_data, status } = req.body;

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['company_id'] }]
        });

        if (!learningPath) {
            const err = new Error("Learning path not found.");
            err.statusCode = 404;
            throw err;
        }

        if (learningPath.employee.company_id !== req.user.company_id) {
            const err = new Error("Not authorized to update this learning path.");
            err.statusCode = 403;
            throw err;
        }

        if (path_data) learningPath.path_data = path_data;
        if (status) learningPath.status = status;

        await learningPath.save();
        res.json(learningPath);
    } catch (error) {
        console.error("Controller Error in curateLearningPath:", error.message);
        next(error);
    }
};

exports.updateStepStatus = async (req, res, next) => {
    try {
        const { pathId, stepIndex } = req.params;
        const { completed } = req.body;

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'company_id'] }]
        });

        if (!learningPath) {
            const err = new Error("Learning path not found.");
            err.statusCode = 404;
            throw err;
        }

        const isLdManagerForThisPath = learningPath.employee.company_id === req.user.company_id && req.user.role === 'ld_manager';
        // const isAssignedEmployee = ...; // Add logic if employees can update their own status

        if (!isLdManagerForThisPath /* && !isAssignedEmployee */) {
             const err = new Error("Not authorized to update this step.");
             err.statusCode = 403;
             throw err;
        }

        if (!learningPath.path_data || typeof learningPath.path_data[stepIndex] === 'undefined') {
            const err = new Error("Step not found in learning path.");
            err.statusCode = 404;
            throw err;
        }

        learningPath.path_data[stepIndex].completed = completed;
        learningPath.changed('path_data', true);
        
        const allStepsCompleted = learningPath.path_data.every(step => step.completed);
        if (allStepsCompleted && learningPath.status !== 'completed') {
            learningPath.status = 'completed';
        } else if (!allStepsCompleted && learningPath.status === 'completed') {
             learningPath.status = 'in_progress';
        }
        // Only save if status or path_data changed
        if (learningPath.changed('path_data') || learningPath.changed('status')) {
            await learningPath.save();
        }
        
        res.json(learningPath);
    } catch (error) {
        console.error("Controller Error in updateStepStatus:", error.message);
        next(error);
    }
};