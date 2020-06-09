const mongoose = require('mongoose')

const MenuSchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    linkName: {
        type: String
    },
    icon: {
        type: String
    },
    caption: {
        type: String
    },
    roles: {
        type: Array
    },
    children: {
        type: Array
    }
});

var Menu = mongoose.model('Menu', MenuSchema);
module.exports = Menu;