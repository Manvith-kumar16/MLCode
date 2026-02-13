const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: String, // Assuming problem ID is a string (e.g., from a predefined list)
        required: true
    },
    problemTitle: {
        type: String,
        required: true
    },
    status: {
        type: String, // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
        required: true
    },
    language: {
        type: String,
        required: true
    },
    executionTime: {
        type: Number, // in ms
        default: 0
    },
    memoryUsed: {
        type: Number, // in KB
        default: 0
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
