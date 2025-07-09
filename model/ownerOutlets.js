const mongoose = require('mongoose');
const ownerSchema = new mongoose.Schema({
  Oulets_Ids: [mongoose.Schema.Types.ObjectId],
  Manager_Ids: [{type :String}],
});
const Owner = mongoose.model('Owner', ownerSchema);
module.exports = Owner;