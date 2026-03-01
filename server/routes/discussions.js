const router = require('express').Router();
const Discussion = require('../models/Discussion');
const verify = require('./verifyToken'); // Optional or required auth depending on route
const mongoose = require('mongoose');

// GET all discussions for a specific problem
router.get('/:problemId', async (req, res) => {
    try {
        const discussions = await Discussion.find({ problemId: req.params.problemId })
            .populate('userId', 'username name avatar') // Get basic user info, safely
            .sort({ createdAt: -1 }); // Newest first

        res.json(discussions);
    } catch (err) {
        console.error("Fetch discussion error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// POST a new discussion (Logged in users only)
router.post('/', verify, async (req, res) => {
    try {
        const { problemId, text } = req.body;

        if (!problemId || !text || text.trim() === '') {
            return res.status(400).json({ message: "Problem ID and text are required" });
        }

        const newDiscussion = new Discussion({
            problemId,
            userId: req.user._id,
            text
        });

        const savedDiscussion = await newDiscussion.save();

        // Populate the user data immediately to return to the frontend
        await savedDiscussion.populate('userId', 'username name avatar');

        res.status(201).json(savedDiscussion);
    } catch (err) {
        console.error("Post discussion error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE a discussion (Author only)
router.delete('/:id', verify, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) return res.status(404).json({ message: "Discussion not found" });

        if (discussion.userId.toString() !== req.user._id) {
            return res.status(403).json({ message: "Not authorized to delete this discussion" });
        }

        await discussion.deleteOne();
        res.json({ message: "Discussion deleted successfully" });
    } catch (err) {
        console.error("Delete discussion error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
