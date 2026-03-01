const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    problemId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String, // 'Easy', 'Medium', 'Hard'
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: "General"
    },
    starterCode: {
        type: String,
        default: ""
    },
    example: {
        type: mongoose.Schema.Types.Mixed, // { input, output, reasoning }
        default: null
    },
    testCases: {
        type: [mongoose.Schema.Types.Mixed], // [{test, expected_output}]
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Problem', ProblemSchema);
