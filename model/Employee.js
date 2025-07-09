const { DataTypes } = require('sequelize');
const sequelize = require('./indexsql');
const Employees = sequelize.define('Employees', {
    Employee_id :{type: DataTypes.STRING,
    allowNull: false
  },
  emailId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  password :{
    type: DataTypes.STRING,
    allowNull: false
  },
  name :{
    type: DataTypes.STRING,
    allowNull: false
  },
  contactnumber :{
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  freezeTableName:'Employees',
  timestamps: false
});

module.exports=Employees;