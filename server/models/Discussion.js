const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    problemId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    upvotes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
