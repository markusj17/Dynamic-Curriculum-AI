const { Company, User } = require('../models');

// @desc    Get current L&D manager's company details
// @route   GET /api/companies/my-company
// @access  Private (L&D Manager)
exports.getMyCompany = async (req, res) => {
  try {
    if (!req.user || !req.user.company_id) {
      return res.status(400).json({ message: 'User is not associated with a company.' });
    }
    const company = await Company.findByPk(req.user.company_id, {
        include: [{model: User, as: 'owner', attributes: ['id', 'email']}]
    });
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update company details (by L&D Manager)
// @route   PUT /api/companies/my-company
// @access  Private (L&D Manager)
exports.updateMyCompany = async (req, res) => {
    try {
        if (!req.user || !req.user.company_id) {
            return res.status(400).json({ message: 'User is not associated with a company.' });
        }
        const company = await Company.findByPk(req.user.company_id);
        if (company) {
            // Make sure only owner can update
            if (company.owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to update this company.'});
            }
            company.name = req.body.name || company.name;
            await company.save();
            res.json(company);
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating company', error: error.message });
    }
};