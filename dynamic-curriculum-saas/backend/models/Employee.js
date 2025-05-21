const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Employee extends Model {
    async comparePassword(candidatePassword) {
      if (!this.password_hash) return false;
      return bcrypt.compare(candidatePassword, this.password_hash);
    }
  }
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
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,   
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
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
    hooks: {
      beforeCreate: async (employee) => {
        if (employee.password_hash) {
          const salt = await bcrypt.genSalt(10);
          employee.password_hash = await bcrypt.hash(employee.password_hash, salt);
        }
      },
      beforeUpdate: async (employee) => {
        if (employee.changed('password_hash') && employee.password_hash) {
          const salt = await bcrypt.genSalt(10);
          employee.password_hash = await bcrypt.hash(employee.password_hash, salt);
        }
      },
    },
  });
  return Employee;
};