const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Employee extends Model {}
  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: { // Optional for direct employee login later
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    current_role: {
      type: DataTypes.STRING,
    },
    current_skills: {
      type: DataTypes.TEXT,
    },
    desired_skills_goal: {
      type: DataTypes.TEXT,
    },
  
  }, {
    sequelize,
    modelName: 'Employee',
    timestamps: true,
  });
  return Employee;
};