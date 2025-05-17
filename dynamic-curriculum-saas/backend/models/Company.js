const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Company extends Model {}
  Company.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Company',
    timestamps: true,
  });
  return Company;
};