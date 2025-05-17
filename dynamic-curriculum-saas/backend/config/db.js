const { Sequelize } = require('sequelize');

require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'dcs_db',
    process.env.DB_USER || 'user',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost', // For local non-Docker dev
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
  );
}

module.exports = sequelize;