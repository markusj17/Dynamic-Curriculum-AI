const { Employee, Company, LearningPath } = require('../models');

// @desc    Create a new employee for the L&D manager's company
// @route   POST /api/employees
// @access  Private (L&D Manager)
exports.createEmployee = async (req, res, next) => {
  try {
    const { name, email, current_role, current_skills, desired_skills_goal } = req.body;
    const company_id = req.user.company_id;

    if (!company_id) {
      const err = new Error('L&D Manager not associated with a company or company_id missing.');
      err.statusCode = 400; 
      throw err;
    }
    if (!name) { // Basic validation
        const err = new Error('Employee name is required.');
        err.statusCode = 400;
        throw err;
    }

    console.log(`[EmployeeCtrl] Creating employee. Data:`, req.body, `Company ID from token: ${company_id}`); // Log input

    const employee = await Employee.create({
      name,
      email, 
      current_role,
      current_skills,
      desired_skills_goal,
      company_id, 
    });

    console.log(`[EmployeeCtrl] Employee created successfully: ID ${employee.id}`);
    res.status(201).json(employee);

  } catch (error) {
    console.error("[EmployeeCtrl] Error creating employee:", error.message, error.stack ? `\nStack: ${error.stack}` : '');
    if (!error.statusCode) {
        error.statusCode = 500; 
    }
    next(error); 
  }
};

// @desc    Get all employees for the L&D manager's company
// @route   GET /api/employees
// @access  Private (L&D Manager)
exports.getEmployees = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    if (!company_id) {
      return res.status(400).json({ message: 'L&D Manager not associated with a company.' });
    }
    const employees = await Employee.findAll({
        where: { company_id },
        include: [{ model: LearningPath, as: 'learningPath', attributes: ['id', 'status']}] // Include basic path info
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching employees', error: error.message });
  }
};

// @desc    Get a single employee by ID
// @route   GET /api/employees/:id
// @access  Private (L&D Manager - ensuring employee belongs to their company)
exports.getEmployeeById = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const employee = await Employee.findOne({
      where: { id: req.params.id, company_id },
      include: [{model: LearningPath, as: 'learningPath'}] // Include full path data
    });
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found or not in your company' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Private (L&D Manager)
exports.updateEmployee = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const employee = await Employee.findOne({ where: { id: req.params.id, company_id } });

    if (employee) {
      employee.name = req.body.name || employee.name;
      employee.email = req.body.email || employee.email;
      employee.current_role = req.body.current_role || employee.current_role;
      employee.current_skills = req.body.current_skills || employee.current_skills;
      employee.desired_skills_goal = req.body.desired_skills_goal || employee.desired_skills_goal;
      await employee.save();
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found or not in your company' });
    }
  } catch (error) {
     if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Employee with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error updating employee', error: error.message });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (L&D Manager)
exports.deleteEmployee = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const employee = await Employee.findOne({ where: { id: req.params.id, company_id } });

    if (employee) {
      await employee.destroy();
      res.json({ message: 'Employee removed' });
    } else {
      res.status(404).json({ message: 'Employee not found or not in your company' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting employee', error: error.message });
  }
};