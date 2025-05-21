const { Employee, Company, LearningPath, sequelize } = require('../models');
const crypto = require('crypto');

const generateRandomPassword = (length = 12) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

const generateUniqueUsername = async (name, email, company_id) => {
    let base = name.toLowerCase().replace(/[^a-z0-9]/gi, '').substring(0, 8);
    if (email) {
        const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (emailPrefix.length > 2) base = emailPrefix.substring(0,10);
    }
    if (base.length < 3) base = `user${base}`;

    let username = `${base}${Math.floor(100 + Math.random() * 900)}`;
    let attempts = 0;
    // Check for uniqueness within the specific company
    while (await Employee.findOne({ where: { username, company_id } }) && attempts < 10) {
        username = `${base}${Math.floor(100 + Math.random() * 900)}`;
        attempts++;
    }
    if (await Employee.findOne({ where: { username, company_id } })) { // Final check
        throw new Error('Could not generate a unique username for this employee after several attempts.');
    }
    return username;
};

exports.createEmployee = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, current_role, current_skills, desired_skills_goal } = req.body;
    const company_id = req.user.company_id;

    if (!company_id) {
      const err = new Error('L&D Manager not associated with a company.'); err.statusCode = 400; throw err;
    }
    if (!name) {
        const err = new Error('Employee name is required.'); err.statusCode = 400; throw err;
    }

    const username = await generateUniqueUsername(name, email, company_id);
    const temporaryPassword = generateRandomPassword();

    const employee = await Employee.create({
      name,
      email,
      username,
      password_hash: temporaryPassword,
      current_role,
      current_skills,
      desired_skills_goal,
      company_id,
    }, { transaction: t });

    await t.commit();

    const { password_hash, ...employeeData } = employee.toJSON();
    res.status(201).json({
        employee: employeeData,
        username: username,
        temporaryPassword: temporaryPassword
    });

  } catch (error) {
    if (t && !t.finished) await t.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0];
        error.message = `An employee with that ${field} already exists.`;
        error.statusCode = 409;
    } else if (error.message && error.message.includes('Could not generate a unique username')) {
        error.statusCode = 500;
    } else if (!error.statusCode) {
        error.statusCode = 500; // Default for other errors
    }
    next(error);
  }
};

exports.regenerateEmployeeCredentials = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { employeeId } = req.params;
        const company_id = req.user.company_id;

        if (req.user.role !== 'ld_manager') {
            const err = new Error("Forbidden: Only L&D Managers can regenerate credentials.");
            err.statusCode = 403;
            throw err;
        }

        const employee = await Employee.findOne({
            where: { id: employeeId, company_id: company_id },
            transaction: t
        });

        if (!employee) {
            const err = new Error("Employee not found in your company.");
            err.statusCode = 404;
            throw err;
        }

        const newTemporaryPassword = generateRandomPassword();
        employee.password_hash = newTemporaryPassword;
        await employee.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: 'Credentials regenerated successfully.',
            username: employee.username,
            newTemporaryPassword: newTemporaryPassword,
            employeeName: employee.name // For frontend display
        });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
};

exports.getEmployees = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        if (!company_id) { const err = new Error('L&D Manager not associated with a company.'); err.statusCode = 400; throw err; }
        const employees = await Employee.findAll({
            where: { company_id },
            attributes: { exclude: ['password_hash', 'updatedAt'] }, // Exclude password and updatedAt for list view
            include: [{ model: LearningPath, as: 'learningPath', attributes: ['id', 'status']}]
        });
        res.json(employees);
    } catch (error) { next(error); }
};

exports.getEmployeeById = async (req, res, next) => {
    try {
        const company_id = req.user.company_id;
        const employee = await Employee.findOne({
          where: { id: req.params.id, company_id },
          attributes: { exclude: ['password_hash'] },
          include: [{model: LearningPath, as: 'learningPath'}]
        });
        if (employee) { res.json(employee); }
        else { const err = new Error('Employee not found or not in your company'); err.statusCode = 404; throw err; }
    } catch (error) { next(error); }
};

exports.updateEmployee = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const company_id = req.user.company_id;
        const employee = await Employee.findOne({ where: { id: req.params.id, company_id }, transaction: t });
        if (employee) {
            const { name, email, current_role, current_skills, desired_skills_goal } = req.body;
            if (name !== undefined) employee.name = name;
            if (email !== undefined) employee.email = email; // Add validation for email uniqueness if changed
            if (current_role !== undefined) employee.current_role = current_role;
            if (current_skills !== undefined) employee.current_skills = current_skills;
            if (desired_skills_goal !== undefined) employee.desired_skills_goal = desired_skills_goal;
            
            await employee.save({ transaction: t });
            await t.commit();
            const { password_hash, ...employeeData } = employee.toJSON();
            res.json(employeeData);
        } else { 
            await t.rollback(); 
            const err = new Error('Employee not found or not in your company'); err.statusCode = 404; throw err; 
        }
    } catch (error) { 
        if (t && !t.finished) await t.rollback(); 
        if (error.name === 'SequelizeUniqueConstraintError' && error.fields.email) {
            error.message = 'An employee with this email already exists.';
            error.statusCode = 409;
        } else if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error); 
    }
};

exports.deleteEmployee = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const company_id = req.user.company_id;
        const employee = await Employee.findOne({ where: { id: req.params.id, company_id }, transaction: t });
        if (employee) { 
            await employee.destroy({ transaction: t }); 
            await t.commit(); 
            res.json({ message: 'Employee and associated data removed' }); 
        } else { 
            await t.rollback(); 
            const err = new Error('Employee not found or not in your company'); err.statusCode = 404; throw err; 
        }
    } catch (error) { 
        if (t && !t.finished) await t.rollback(); 
        if (!error.statusCode) error.statusCode = 500;
        next(error); 
    }
};