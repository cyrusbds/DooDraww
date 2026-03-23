const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: function() {
            return this.name ? this.name.charAt(0).toUpperCase() : 'U';
        }
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drawing'
    }],
});

module.exports = mongoose.model('User', UserSchema);
