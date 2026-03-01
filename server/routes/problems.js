const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const jwt = require('jsonwebtoken');

// Optional auth middleware
const optionalAuth = (req, res, next) => {
    const token = req.header('auth-token');
    if (token) {
        try {
            req.user = jwt.verify(token, 'SECRET_KEY_SHOULD_BE_IN_ENV');
        } catch (err) { }
    }
    next();
};

// GET all problems
router.get('/', optionalAuth, async (req, res) => {
    try {
        let problems = await Problem.find().sort({ createdAt: -1 });

        // Make it mutable
        problems = problems.map(p => p.toObject());

        if (req.user) {
            // Fetch user's submissions
            const userSubmissions = await Submission.find({ userId: req.user._id });
            const statusMap = {};

            userSubmissions.forEach(sub => {
                const pid = sub.problemId;
                if (statusMap[pid] === "solved") return; // Already best status
                if (sub.status === "Accepted") {
                    statusMap[pid] = "solved";
                } else {
                    statusMap[pid] = "attempted";
                }
            });

            problems.forEach(p => {
                if (statusMap[p.problemId]) {
                    p.status = statusMap[p.problemId];
                }
            });
        }

        // Calculate global acceptance rates
        const stats = await Submission.aggregate([
            {
                $group: {
                    _id: "$problemId",
                    total: { $sum: 1 },
                    accepted: {
                        $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
                    }
                }
            }
        ]);

        const accMap = {};
        stats.forEach(s => {
            accMap[s._id] = ((s.accepted / s.total) * 100).toFixed(1) + "%";
        });

        problems.forEach(p => {
            p.acceptance = accMap[p.problemId] || "0.0%";
        });

        res.status(200).json(problems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch problems', details: err.message });
    }
});

// GET a specific problem by problemId
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        let problem = await Problem.findOne({ problemId: req.params.id });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        problem = problem.toObject();

        if (req.user) {
            const userSubmissions = await Submission.find({ userId: req.user._id, problemId: problem.problemId });
            let status = null;
            userSubmissions.forEach(sub => {
                if (status === "solved") return;
                if (sub.status === "Accepted") status = "solved";
                else status = "attempted";
            });
            if (status) problem.status = status;
        }

        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch problem', details: err.message });
    }
});

module.exports = router;
