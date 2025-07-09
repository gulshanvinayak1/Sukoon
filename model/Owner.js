const { DataTypes } = require('sequelize');
const sequelize = require('./indexsql');
const Owners = sequelize.define('Owners', {
    Owner_id :{type: DataTypes.STRING,
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
  freezeTableName:'Owners',
  timestamps: false
});

module.exports=Owners;