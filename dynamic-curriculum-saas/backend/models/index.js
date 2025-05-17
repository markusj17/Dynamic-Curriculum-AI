const sequelize = require('../config/db'); 
const User = require('./User')(sequelize);
const Company = require('./Company')(sequelize);
const Employee = require('./Employee')(sequelize);
const LearningPath = require('./LearningPath')(sequelize);

User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' }); 

Company.hasMany(Employee, { foreignKey: 'company_id', as: 'employees' });
Employee.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Employee.hasOne(LearningPath, { foreignKey: 'employee_id', as: 'learningPath' });
LearningPath.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

LearningPath.belongsTo(User, { foreignKey: 'generated_by_user_id', as: 'generator' }); 
User.hasMany(LearningPath, { foreignKey: 'generated_by_user_id', as: 'generatedPaths' });


const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  User,
  Company,
  Employee,
  LearningPath,
};

module.exports = db;