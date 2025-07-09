const mongoose = require('mongoose');
const Menu = require('./menu');
const Inventory = require('./inventory');
const orderOfOutlet = require('./orderofOutlet');
const outletSchema = {
    Owner_id :{type :mongoose.Schema.Types.ObjectId,required:true},
    Location :{type :String,required:true},
    Outlet_name :{type :String ,required :false},
    Pending_list: { type: mongoose.Schema.Types.ObjectId, ref: orderOfOutlet},
    served_list: { type: mongoose.Schema.Types.ObjectId, ref: orderOfOutlet},
    Todayserved_list: { type: mongoose.Schema.Types.ObjectId, ref: orderOfOutlet},
    inventory_id: { type: mongoose.Schema.Types.ObjectId, ref: Inventory},
    Menu_id: { type: mongoose.Schema.Types.ObjectId, ref: Menu},
    Managers: [mongoose.Schema.Types.ObjectId],
    Expenses: [mongoose.Schema.Types.ObjectId],
  };
const Outlet = mongoose.model('Outlet', outletSchema);
module.exports = Outlet;