const mongoose = require('mongoose');
const RawMaterial =require('./rawmaterial');
const itemSchema = {
    Available :{type :Boolean, default:true},
    Name: { type: String, required: true },
    Description: { type: String, default: null },
    Price : { type: Number, required: true },
    NotAvailableSince :{type :Date,default:null},
    requirements : {
      type:[{
      Product_id :{ type: mongoose.Schema.Types.ObjectId, ref: RawMaterial},
      quantity :Number,
      }],
      required :true,
    }
  };
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;