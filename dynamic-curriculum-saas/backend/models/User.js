const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password_hash);
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Companies', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    role: { 
        type: DataTypes.STRING,
        defaultValue: 'ld_manager',
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    subscription_status: {
      type: DataTypes.ENUM('active', 'inactive', 'trialing', 'canceled'),
      defaultValue: 'inactive',
    },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true, 
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash') && user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
    },
  });
  return User;
};