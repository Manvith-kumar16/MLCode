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
        default: ""
    },
    rank: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    problemsSolved: {
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 }
    },
    badges: [{
        name: String,
        desc: String,
        icon: String,
        earnedDate: Date
    }],
    streak: {
        current: { type: Number, default: 0 },
        lastActive: Date
    },
    socials: {
        github: String,
        linkedin: String,
        website: String
    },
    bio: String,
    location: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
