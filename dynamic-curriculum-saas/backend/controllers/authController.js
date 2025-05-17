const jwt = require('jsonwebtoken');
const { User, Company, sequelize } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

exports.registerUser = async (req, res) => {
  const { email, password, companyName } = req.body;
  if (!email || !password || !companyName) {
    return res.status(400).json({ message: 'Please provide email, password, and company name' });
  }
  const t = await sequelize.transaction();
  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      await t.rollback();
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ email, password_hash: password, role: 'ld_manager' }, { transaction: t });
    const company = await Company.create({ name: companyName, owner_id: user.id }, { transaction: t });
    user.company_id = company.id;
    await user.save({ transaction: t });
    await t.commit();
    res.status(201).json({
      _id: user.id, email: user.email, company_id: user.company_id,
      company_name: company.name, role: user.role,
      subscription_status: user.subscription_status || 'inactive', 
      token: generateToken(user.id),
    });
  } catch (error) {
    await t.rollback();
    console.error('Registration Error:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors.map(e => ({ field: e.path, message: e.message })) });
    }
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 
        where: { email },
        include: [{ model: Company, as: 'company', attributes: ['name'] }]
    });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user.id, email: user.email, company_id: user.company_id,
        company_name: user.company ? user.company.name : null, role: user.role,
        subscription_status: user.subscription_status,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  if (req.user && req.user.id) {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password_hash'] }, // Dont include password
        include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }]
    });
    if (user) {
        res.json({
            _id: user.id,
            email: user.email,
            company_id: user.company_id,
            company: user.company,
            role: user.role,
            subscription_status: user.subscription_status,
            stripe_customer_id: user.stripe_customer_id,
        });
    } else {
        res.status(404).json({ message: 'User not found in database' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized or user ID missing from token' });
  }
};