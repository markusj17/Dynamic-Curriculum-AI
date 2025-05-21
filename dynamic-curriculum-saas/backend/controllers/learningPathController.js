const { generateLearningPath } = require('../services/geminiService');
const { LearningPath, Employee, sequelize } = require('../models'); // Added sequelize for transactions

exports.generateOrUpdatePath = async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a transaction for atomicity
    try {
        const { employeeId } = req.params;
        const ldManagerUserId = req.user.id;

        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: req.user.company_id }
            // transaction: t // Optional: if you want this read to be part of the transaction
        });

        if (!employee) {
            const err = new Error("Employee not found or not in your company.");
            err.statusCode = 404;
            throw err;
        }

        const { current_skills, desired_skills_goal } = employee;
        if (!current_skills || !desired_skills_goal) {
            const err = new Error("Employee current skills and desired goal must be set first for AI generation.");
            err.statusCode = 400;
            throw err;
        }

        console.log(`[Controller] Requesting learning path from Gemini for employee ${employeeId}`);
        // generateLearningPath now returns an array of structured step objects
        // e.g., [{ title: "...", step_type: "lesson", details: { markdown_content: "..." } }, ...]
        const structuredStepsFromAI = await generateLearningPath(current_skills, desired_skills_goal);
        console.log(`[Controller] Received ${structuredStepsFromAI.length} structured steps from Gemini Service.`);

        // For the current DB schema (storing in LearningPath.path_data as JSON):
        // We need to ensure each step has a 'completed' field for frontend progress tracking.
        // We also need a unique ID for each step for frontend keying if not provided by AI.
        const pathDataToStore = structuredStepsFromAI.map((step, index) => ({
            id: step.id || `step_${Date.now()}_${index}`, // Generate a temporary ID if AI doesn't provide one
            title: step.title,
            step_type: step.step_type,
            estimated_duration_minutes: step.estimated_duration_minutes,
            details: step.details, // This is the complex object with markdown, quiz_questions etc.
            completed: false, // Default completion status
        }));
        console.log("[Controller] Path data prepared for DB storage (first step):", JSON.stringify(pathDataToStore[0], null, 2));


        let learningPath = await LearningPath.findOne({ 
            where: { employee_id: employeeId }
            // transaction: t // If you want this find to be part of the transaction
        });

        if (learningPath) {
            console.log(`[Controller] Updating existing LearningPath ID: ${learningPath.id}`);
            learningPath.path_data = pathDataToStore; // Store the new complex structure
            learningPath.generated_by_user_id = ldManagerUserId;
            learningPath.status = 'draft'; // Reset to draft upon regeneration
            await learningPath.save({ transaction: t });
        } else {
            console.log(`[Controller] Creating new LearningPath for Employee ID: ${employeeId}`);
            learningPath = await LearningPath.create({
                employee_id: employeeId,
                generated_by_user_id: ldManagerUserId,
                path_data: pathDataToStore, // Store the new complex structure
                status: 'draft'
            }, { transaction: t });
        }
        
        await t.commit(); // Commit the transaction
        console.log(`[Controller] LearningPath ID ${learningPath.id} saved/updated successfully.`);

        // Fetch the LearningPath again to ensure we return the latest, including any DB defaults/triggers
        // Or just return the 'learningPath' object we just saved/created if it's sufficiently up-to-date.
        // For consistency, fetching it again with its associations is safer.
        const finalLearningPath = await LearningPath.findByPk(learningPath.id, {
             include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }] // Include employee name for context
        });

        console.log("[Controller] Final learning path being sent to frontend:", JSON.stringify(finalLearningPath, null, 2));
        res.status(200).json(finalLearningPath); // Send the full LearningPath object

    } catch (error) {
        if (t && !t.finished) { // Check if transaction exists and hasn't been committed/rolled back
            await t.rollback();
        }
        console.error("Controller Error in generateOrUpdatePath:", error.message, error.originalErrorName ? `(Original: ${error.originalErrorName} - ${error.originalErrorMessage})` : '');
        // Pass error to global error handler in server.js
        // Ensure error object has statusCode if possible for more specific client responses
        if (!error.statusCode && error.originalErrorName === 'GoogleGenerativeAIError') {
            error.statusCode = 502; // Bad Gateway if AI service fails
        } else if (!error.statusCode && error.name === 'SequelizeValidationError') {
            error.statusCode = 400;
        }
        next(error); 
    }
};

// --- getLearningPathForEmployee ---
// This function should also ensure 'completed' and 'id' fields are present in path_data steps
// if they might be missing from older data or if the structure is inconsistent.
exports.getLearningPathForEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;
        // Assuming L&D manager or the employee themselves can fetch.
        // Add more specific auth checks if needed (e.g., if req.user.id is employeeId or L&D manager of company)
        const learningPath = await LearningPath.findOne({ 
            where: { employee_id: employeeId },
            include: [{ model: Employee, as: 'employee', attributes: ['name', 'company_id']}]
        });

        if (!learningPath) {
            return res.status(404).json({ message: "Learning path not found for this employee." });
        }

        // Ensure data consistency for the frontend, especially for the new structure
        if (learningPath.path_data && Array.isArray(learningPath.path_data)) {
            learningPath.path_data = learningPath.path_data.map((step, index) => ({
                id: step.id || `step_${learningPath.id}_${index}`, // Ensure an ID
                completed: typeof step.completed === 'boolean' ? step.completed : false, // Ensure completed exists
                title: step.title || step.topic || `Step ${index + 1}`, // Handle old 'topic' field
                step_type: step.step_type || 'lesson', // Default or infer
                details: step.details || { markdown_content: step.description, external_url: step.suggested_link }, // Adapt old structure
                estimated_duration_minutes: step.estimated_duration_minutes,
                ...step // Spread rest of properties, ensure new ones override old if names clash
            }));
        } else {
            learningPath.path_data = []; // Ensure it's an array
        }

        console.log(`[Controller] Fetched learning path for employee ${employeeId}:`, JSON.stringify(learningPath.path_data[0], null, 2));
        res.json(learningPath);
    } catch (error) {
        console.error("Controller Error in getLearningPathForEmployee:", error.message);
        next(error);
    }
};


// --- curateLearningPath ---
// This function now needs to handle the more complex path_data structure if L&D manager edits it.
// Frontend will send the full array of step objects.
exports.curateLearningPath = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { pathId } = req.params; // This is LearningPath.id
        const { path_data, status } = req.body; // path_data is the array of complex step objects

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['company_id'] }],
            transaction: t
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

        if (path_data && Array.isArray(path_data)) {
            // Validate/sanitize path_data if needed before saving
            // Ensure each step has necessary fields (title, step_type, details, completed, id)
            learningPath.path_data = path_data.map((step, index) => ({
                id: step.id || `curated_step_${Date.now()}_${index}`,
                completed: typeof step.completed === 'boolean' ? step.completed : false,
                title: step.title || `Untitled Step ${index + 1}`,
                step_type: step.step_type || 'lesson',
                details: step.details || {},
                estimated_duration_minutes: step.estimated_duration_minutes,
                ...step
            }));
            console.log(`[Controller] Curating path ${pathId} with ${learningPath.path_data.length} steps.`);
        }
        if (status) {
            learningPath.status = status;
        }

        await learningPath.save({ transaction: t });
        await t.commit();

        console.log(`[Controller] Curated path ${pathId} saved successfully.`);
        res.json(learningPath);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Controller Error in curateLearningPath:", error.message);
        next(error);
    }
};

exports.updateStepStatus = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { pathId, stepIndex } = req.params;
        const { completed } = req.body;

        const learningPath = await LearningPath.findByPk(pathId, {
            include: [{ model: Employee, as: 'employee', attributes: ['id', 'company_id'] }],
            transaction: t
        });

        if (!learningPath) {
            const err = new Error("Learning path not found.");
            err.statusCode = 404;
            throw err;
        }

        const isLdManagerForThisPath = learningPath.employee.company_id === req.user.company_id && req.user.role === 'ld_manager';
        const isAssignedEmployee = learningPath.employee_id === req.user.id && req.user.role === 'employee';

        if (!isLdManagerForThisPath && !isAssignedEmployee) {
             const err = new Error("Not authorized to update this step.");
             err.statusCode = 403;
             throw err;
        }
        
        const stepIndexNum = parseInt(stepIndex, 10);
        if (isNaN(stepIndexNum) || !learningPath.path_data || typeof learningPath.path_data[stepIndexNum] === 'undefined') {
            const err = new Error("Step not found in learning path at the given index.");
            err.statusCode = 404;
            throw err;
        }

        learningPath.path_data[stepIndexNum].completed = completed;
        learningPath.changed('path_data', true);
        
        const allStepsCompleted = learningPath.path_data.every(step => step.completed);
        if (allStepsCompleted && learningPath.status !== 'completed') {
            learningPath.status = 'completed';
        } else if (!allStepsCompleted && learningPath.status === 'completed') {
             learningPath.status = 'in_progress';
        }
        
        if (learningPath.changed()) { 
            await learningPath.save({ transaction: t });
        }
        await t.commit();
        
        console.log(`[Controller] Step ${stepIndexNum} status updated for path ${pathId}. New completed: ${completed}`);
        res.json(learningPath); 
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error("Controller Error in updateStepStatus:", error.message);
        next(error);
    }
};