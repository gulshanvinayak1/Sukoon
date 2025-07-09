const { DataTypes } = require('sequelize');
const sequelize = require('./indexsql');
const Managers = sequelize.define('Managers', {
  //   Manager_id :{type: DataTypes.STRING,
  //   allowNull: true,
  // },
  Manager_id: {
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
  workingAt :{
    type: DataTypes.STRING,
    allowNull: false
  },
  sallary :{
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  freezeTableName:'Managers',
  timestamps: false
});

module.exports=Managers;