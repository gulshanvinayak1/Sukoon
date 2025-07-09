const mongoose = require('mongoose');
const Order = require('./order');
const orderOfOutletSchema = {
    orders_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: Order}],
    };
const orderOfOutlet = mongoose.model('orderOfOutlet', orderOfOutletSchema);
module.exports = orderOfOutlet;