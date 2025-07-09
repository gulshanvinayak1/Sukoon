const mongoose = require('mongoose');
const Item = require('./item');
const orderSchema = new mongoose.Schema({
  OrderingTime: { type: Date, default: Date.now },
  ServingTime: {type: Date,default:null},
  Items: [
    {
      item_id: { type: mongoose.Schema.Types.ObjectId, ref: Item,required:true},
      Quantity: { type: Number, required: true },
      Price: { type: Number, required: true },
    },
  ],
  Customer_number: { type: Number },
  Customer_name: { type: String, required: true },
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;