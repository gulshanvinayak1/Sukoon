const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('Sukoon', 'root', 'yourpassword', {
    host: 'localhost',
    logging: false,
    dialect: 'mysql'
  });
  try {
     sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  module.exports=sequelize;
