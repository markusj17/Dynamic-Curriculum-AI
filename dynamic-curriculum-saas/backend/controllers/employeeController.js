const { Employee, Company, LearningPath } = require('../models');

// @desc    Create a new employee for the L&D manager's company
// @route   POST /api/employees
// @access  Private (L&D Manager)
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, current_role, current_skills, desired_skills_goal } = req.body;
    const company_id = req.user.company_id; // From authenticated L&D manager

    if (!company_id) {
      return res.status(400).json({ message: 'L&D Manager not associated with a company.' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Employee name is required.' });
    }

    const employee = await Employee.create({
      name,
      email, // Optional for MVP
      current_role,
      current_skills,
      desired_skills_goal,
      company_id,
    });
    res.status(201).json(employee);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ message: 'Employee with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error creating employee', error: error.message });
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