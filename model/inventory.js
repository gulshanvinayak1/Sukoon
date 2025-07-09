const mongoose = require('mongoose');
const rawMaterial =require('./rawmaterial');
const inventorySchema = {
  Inventory :[{ type: mongoose.Schema.Types.ObjectId, ref: rawMaterial}]
  };
const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;