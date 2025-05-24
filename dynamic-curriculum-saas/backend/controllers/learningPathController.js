// ... (imports as before: generateLearningPath, LearningPath, Employee, sequelize) ...
const { generateLearningPath } = require('../services/geminiService');
const { LearningPath, Employee, sequelize } = require('../models');


// L&D Manager generates path
exports.generateOrUpdatePath = async (req, res, next) => { /* ... (existing logic, ensure it uses req.user.id for ldManagerUserId and req.user.company_id) ... */ 
    const t = await sequelize.transaction();
    try {
        const { employeeId } = req.params;
        const ldManagerUserId = req.user.id; // L&D Manager's User ID from token
        if (req.user.role !== 'ld_manager') { const err = new Error("Forbidden: Only L&D Managers can generate paths."); err.statusCode = 403; throw err; }

        const employee = await Employee.findOne({ where: { id: employeeId, company_id: req.user.company_id } });
        if (!employee) { const err = new Error("Employee not found or not in your company."); err.statusCode = 404; throw err; }
        
        const { current_skills, desired_skills_goal } = employee;
        if (!current_skills || !desired_skills_goal) { const err = new Error("Employee current skills and desired goal must be set first."); err.statusCode = 400; throw err; }

        const structuredStepsFromAI = await generateLearningPath(current_skills, desired_skills_goal);
        const pathDataToStore = structuredStepsFromAI.map((step, index) => ({
            id: step.id || `step_${Date.now()}_${index}`, title: step.title, step_type: step.step_type,
            estimated_duration_minutes: step.estimated_duration_minutes, details: step.details, completed: false,
        }));

        let learningPath = await LearningPath.findOne({ where: { employee_id: employeeId } });
        if (learningPath) {
            learningPath.path_data = pathDataToStore; learningPath.generated_by_user_id = ldManagerUserId; learningPath.status = 'draft';
            await learningPath.save({ transaction: t });
        } else {
            learningPath = await LearningPath.create({
                employee_id: employeeId, generated_by_user_id: ldManagerUserId,
                path_data: pathDataToStore, status: 'draft'
            }, { transaction: t });
        }
        await t.commit();
        const finalLearningPath = await LearningPath.findByPk(learningPath.id, { include: [{ model: Employee, as: 'employee', attributes: ['id', 'name'] }] });
        res.status(200).json(finalLearningPath);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error);
    }
};

exports.getLearningPathForEmployee = async (req, res, next) => {
  console.log("[LearningPathCtrl GET] User making request:", JSON.stringify(req.user, null, 2));
  console.log("[LearningPathCtrl GET] Target employeeId from URL param:", req.params.employeeId, "(type:", typeof req.params.employeeId + ")");
  
  try {
    const targetEmployeeId = req.params.employeeId;
    let learningPath;
    let authorized = false;

    if (req.user.role === 'ld_manager') {
      console.log(`[LearningPathCtrl GET] L&D Manager (User ID: ${req.user.id}, Company ID: ${req.user.company_id}) attempting to access path for employee ${targetEmployeeId}`);
      learningPath = await LearningPath.findOne({
        where: { employee_id: targetEmployeeId },
        include: [{ 
            model: Employee, 
            as: 'employee', 
            where: { company_id: req.user.company_id }, 
            attributes: ['name', 'company_id'] 
        }]
      });
      if (learningPath) {
          authorized = true;
      }
    } else if (req.user.role === 'employee') {
      const loggedInEmployeeId = req.user.id.toString(); // From token via middleware
      const requestedEmployeeId = targetEmployeeId.toString(); // From URL param
      
      console.log(`[LearningPathCtrl GET] Employee (ID: ${loggedInEmployeeId}) attempting to access path for employee ${requestedEmployeeId}`);
      if (loggedInEmployeeId === requestedEmployeeId) {
        authorized = true;
        learningPath = await LearningPath.findOne({
          where: { employee_id: loggedInEmployeeId },
          include: [{ model: Employee, as: 'employee', attributes: ['name', 'company_id'] }]
        });
      }
    }

    if (!authorized) {
      console.log(`[LearningPathCtrl GET] Authorization failed. User role: ${req.user.role}, User ID (if employee): ${req.user.id}, Target Employee ID: ${targetEmployeeId}`);
      const err = new Error("Forbidden: You are not authorized to view this learning path.");
      err.statusCode = 403;
      throw err;
    }

    if (!learningPath) {
      console.log(`[LearningPathCtrl GET] Path not found for employee ${targetEmployeeId} (even if authorized).`);
      return res.status(404).json({ message: "Learning path not found for this employee." });
    }
    
    if (learningPath.path_data && Array.isArray(learningPath.path_data)) {
        learningPath.path_data = learningPath.path_data.map((step, index) => ({
            id: step.id || `step_${learningPath.id}_${index}`,
            completed: typeof step.completed === 'boolean' ? step.completed : false,
            title: step.title || step.topic || `Step ${index + 1}`,
            step_type: step.step_type || 'lesson',
            details: step.details || { markdown_content: step.description, external_url: step.suggested_link },
            estimated_duration_minutes: step.estimated_duration_minutes,
            ...step
        }));
    } else {
        learningPath.path_data = [];
    }
    res.json(learningPath);
  } catch (error) {
    next(error);
  }
};

// L&D Manager curates path
exports.curateLearningPath = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'ld_manager') { const err = new Error("Forbidden: Only L&D Managers can curate paths."); err.statusCode = 403; throw err; }
        const { pathId } = req.params;
        const { path_data, status } = req.body;
        const learningPath = await LearningPath.findByPk(pathId, { include: [{ model: Employee, as: 'employee', attributes: ['company_id'] }], transaction: t });
        if (!learningPath) { const err = new Error("Learning path not found."); err.statusCode = 404; throw err; }
        if (learningPath.employee.company_id !== req.user.company_id) { const err = new Error("Not authorized to update this learning path."); err.statusCode = 403; throw err; }
        if (path_data && Array.isArray(path_data)) {
            learningPath.path_data = path_data.map((step, index) => ({
                id: step.id || `curated_db_step_${Date.now()}_${index}`, title: step.title || `Untitled Step (BE Check ${index + 1})`,
                step_type: step.step_type || 'lesson', details: step.details || {},
                estimated_duration_minutes: step.estimated_duration_minutes,
                completed: typeof step.completed === 'boolean' ? step.completed : false,
            }));
        }
        if (status) learningPath.status = status;
        await learningPath.save({ transaction: t });
        await t.commit();
        res.json(learningPath);
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        next(error);
    }
};

// Employee or L&D Manager can update step status
exports.updateStepStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { pathId, stepIndex } = req.params;
    const { completed } = req.body;

    const learningPath = await LearningPath.findByPk(pathId, {
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'company_id'] }],
      transaction: t
    });

    if (!learningPath) { const err = new Error("Learning path not found."); err.statusCode = 404; throw err; }

    const isLdManagerForThisPath = req.user.role === 'ld_manager' && learningPath.employee.company_id === req.user.company_id;
    const isAssignedEmployee = req.user.role === 'employee' && learningPath.employee_id === req.user.employeeId;

    if (!isLdManagerForThisPath) { // REMOVED "isAssignedEmployee", could cause problems but it shouldn't matter in the long run (for now atleast)
      const err = new Error("Not authorized to update this step status.");
      err.statusCode = 403;
      throw err;
    }
    
    const stepIndexNum = parseInt(stepIndex, 10);
    if (isNaN(stepIndexNum) || !learningPath.path_data || typeof learningPath.path_data[stepIndexNum] === 'undefined') {
      const err = new Error("Step not found at the given index.");
      err.statusCode = 404;
      throw err;
    }

    learningPath.path_data[stepIndexNum].completed = completed;
    learningPath.changed('path_data', true);
    
    const allStepsCompleted = learningPath.path_data.every(step => step.completed);
    if (allStepsCompleted && learningPath.status !== 'completed') {
      learningPath.status = 'completed';
    } else if (!allStepsCompleted && learningPath.status === 'completed' && learningPath.path_data.some(step => !step.completed)) {
      learningPath.status = 'in_progress'; // Revert to in_progress if a step is uncompleted
    } else if (!allStepsCompleted && learningPath.status !== 'in_progress' && learningPath.status !== 'assigned' && learningPath.path_data.some(step => step.completed)) {
      learningPath.status = 'in_progress'; // Move to in_progress if any step is done
    }
    
    if (learningPath.changed()) {
        await learningPath.save({ transaction: t });
    }
    await t.commit();
    res.json(learningPath);
  } catch (error) {
    if (t && !t.finished) await t.rollback();
    next(error);
  }
};