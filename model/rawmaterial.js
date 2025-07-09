const mongoose = require('mongoose');
const rawMaterialSchema = {
      Product :{type : String ,required :true},
      today_Quantity :{type: Number,default:0},
      yesterday_Quantity :{type: Number,default:0},
      Unit :{type :String , required :true}
  };
const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);
module.exports = RawMaterial;