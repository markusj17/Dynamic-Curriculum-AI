const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class LearningPath extends Model {}
  LearningPath.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, 
      references: {
        model: 'Employees',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    generated_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    path_data: { 
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'assigned', 'in_progress', 'completed'),
      defaultValue: 'draft',
    },
  }, {
    sequelize,
    modelName: 'LearningPath',
    timestamps: true,
  });
  return LearningPath;
};