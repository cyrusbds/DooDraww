const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Untitled Drawing'
    },
    imageData: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Drawing', DrawingSchema);