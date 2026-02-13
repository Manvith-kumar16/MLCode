const router = require('express').Router();
const Submission = require('../models/Submission');
const verify = require('./verifyToken');
const mongoose = require('mongoose');

// Get all submissions for a user
router.get('/user/:userId', verify, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(10); // Limit to recent 10 for now
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get submission stats (heatmap data)
router.get('/stats/:userId', verify, async (req, res) => {
    try {
        // Aggregate submissions by date for heatmap
        const stats = await Submission.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(req.params.userId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
