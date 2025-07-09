const mongoose = require('mongoose');
const Item = require('./item');
const menuSchema = {
    Menu: [{ type: mongoose.Schema.Types.ObjectId, ref: Item}],
    };
const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;