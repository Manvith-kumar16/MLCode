const router = require('express').Router();
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const verify = require('./verifyToken');
const mongoose = require('mongoose');
const { executePython } = require('../services/pythonEvaluator');

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

// Submit code for evaluation
router.post('/submit', async (req, res) => {
    try {
        const { problemId, code, language, userId } = req.body;

        if (!problemId || !code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const problem = await Problem.findOne({ problemId });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });

        // Resolve user safely for the demo
        let resolvedUserId = userId;
        if (!resolvedUserId) {
            // Fallback to first user in DB if unauthenticated (for the MVP demo)
            const firstUser = await User.findOne();
            resolvedUserId = firstUser ? firstUser._id : new mongoose.Types.ObjectId();
        }

        const startTime = performance.now();
        // Run against the real test cases
        const result = await executePython(code, problem.testCases || []);
        const endTime = performance.now();

        // Calculate metrics
        const executionTimeMs = Math.round(endTime - startTime);
        // Mocking memory for the demo (between 15MB and 35MB)
        const memoryUsedKb = Math.floor(Math.random() * (35000 - 15000 + 1)) + 15000;

        let status = "Wrong Answer";
        if (result.status === "passed") status = "Accepted";
        else if (result.message === "Compilation / Syntax Error" || result.message === "Parse Error") status = "Compilation Error";
        else if (result.message === "Runtime Error" || result.message === "Execution Timeout") status = "Runtime Error";

        const newSubmission = new Submission({
            userId: resolvedUserId,
            problemId: problemId.toString(),
            problemTitle: problem.title,
            status,
            language: language || 'python',
            executionTime: executionTimeMs,
            memoryUsed: memoryUsedKb,
            code
        });

        const savedSubmission = await newSubmission.save();

        // Return both the submission record and the detailed python execution logs
        res.json({
            submission: savedSubmission,
            testResults: result
        });

    } catch (err) {
        console.error('Submission Error:', err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get recent submission for a specific problem
router.get('/problem/:problemId', async (req, res) => {
    try {
        // In a real app we'd filter by req.user.id too
        const sub = await Submission.findOne({ problemId: req.params.problemId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username');

        res.json(sub);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
