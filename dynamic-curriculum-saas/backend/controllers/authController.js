const jwt = require('jsonwebtoken');
const { User, Company, Employee, sequelize } = require('../models'); // Added Employee

const generateToken = (id, role, employeeId = null, companyId = null) => { // Added role, employeeId, companyId
  const payload = { id, role };
  if (employeeId) payload.employeeId = employeeId; // If it's an employee login
  if (companyId) payload.companyId = companyId;   // Company ID of the employee
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// For L&D Managers (existing)
exports.registerUser = async (req, res, next) => { /* ... (code from my previous full script, ensure it's the version that creates user then company then updates user) ... */ 
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
        const err = new Error('Please provide email, password, and company name'); err.statusCode = 400; throw err;
    }
    const t = await sequelize.transaction();
    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) { await t.rollback(); const err = new Error('User already exists'); err.statusCode = 400; throw err; }
        const user = await User.create({ email, password_hash: password, role: 'ld_manager' }, { transaction: t });
        const company = await Company.create({ name: companyName, owner_id: user.id }, { transaction: t });
        user.company_id = company.id;
        await user.save({ transaction: t });
        await t.commit();
        res.status(201).json({
        _id: user.id, email: user.email, company_id: user.company_id,
        company_name: company.name, role: user.role,
        subscription_status: user.subscription_status || 'inactive',
        token: generateToken(user.id, user.role, null, user.company_id),
        });
    } catch (error) {
        if(t && !t.finished) await t.rollback();
        next(error);
    }
};

exports.loginUser = async (req, res, next) => { /* ... (existing ld_manager login) ... */ 
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email }, include: [{ model: Company, as: 'company', attributes: ['name'] }] });
        if (user && (await user.comparePassword(password)) && user.role === 'ld_manager') {
        res.json({
            _id: user.id, email: user.email, company_id: user.company_id,
            company_name: user.company ? user.company.name : null, role: user.role,
            subscription_status: user.subscription_status,
            token: generateToken(user.id, user.role, null, user.company_id),
        });
        } else {
            const err = new Error('Invalid L&D Manager credentials or role.'); err.statusCode = 401; throw err;
        }
    } catch (error) {
        next(error);
    }
};

// NEW: For Employees
exports.loginEmployee = async (req, res, next) => {
  const { username, password, companyCode } = req.body; // companyCode might be needed if usernames aren't globally unique
  try {
    // To make usernames effectively unique per company, you might need a company identifier
    // For now, assuming username is unique across all employees, or you add company_id to where clause
    const employee = await Employee.findOne({ 
        where: { username },
        include: [{model: Company, as: 'company', attributes: ['id', 'name']}]
    });

    if (employee && (await employee.comparePassword(password))) {
      // Logged in successfully
      res.json({
        _id: employee.id, // This is the Employee ID
        username: employee.username,
        email: employee.email,
        name: employee.name,
        role: 'employee', // Set role explicitly
        company_id: employee.company_id,
        company_name: employee.company ? employee.company.name : null,
        // No subscription_status directly on employee, access is through company's L&D manager
        token: generateToken(employee.id, 'employee', employee.id, employee.company_id), // Use employee.id for 'id' in token
      });
    } else {
      const err = new Error('Invalid employee username or password.');
      err.statusCode = 401;
      throw err;
    }
  } catch (error) {
    next(error);
  }
};


exports.getMe = async (req, res, next) => { /* ... (existing getMe, ensure it handles both User and Employee based on token's role) ... */
    try {
        // The token now includes 'role' and potentially 'employeeId'
        if (!req.user || !req.user.id || !req.user.role) {
             const err = new Error('Not authorized or user data missing from token'); err.statusCode = 401; throw err;
        }

        let userData;
        if (req.user.role === 'ld_manager') {
            const user = await User.findByPk(req.user.id, {
                attributes: { exclude: ['password_hash'] },
                include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
            });
            if (!user) { const err = new Error('L&D Manager not found'); err.statusCode = 404; throw err; }
            userData = {
                _id: user.id, type: 'user', email: user.email, company_id: user.company_id,
                company: user.company, role: user.role, subscription_status: user.subscription_status,
                stripe_customer_id: user.stripe_customer_id,
            };
        } else if (req.user.role === 'employee' && req.user.employeeId) {
            const employee = await Employee.findByPk(req.user.employeeId, { // Use employeeId from token
                attributes: { exclude: ['password_hash'] },
                include: [{model: Company, as: 'company', attributes: ['id', 'name']}]
            });
            if (!employee) { const err = new Error('Employee not found'); err.statusCode = 404; throw err; }
            userData = {
                _id: employee.id, type: 'employee', username: employee.username, email: employee.email, name: employee.name,
                company_id: employee.company_id, company: employee.company, role: 'employee',
            };
        } else {
            const err = new Error('Invalid user role or missing ID in token'); err.statusCode = 401; throw err;
        }
        res.json(userData);
    } catch (error) {
        next(error);
    }
};