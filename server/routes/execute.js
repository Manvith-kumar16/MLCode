const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { executePython } = require('../services/pythonEvaluator');

// POST /api/execute/:id
// Receives { code: string }
// Returns TestResult JSON compiled by evaluator
router.post('/:id', async (req, res) => {
    try {
        const problemId = parseInt(req.params.id);
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }

        // 1. Fetch Problem Test Cases
        const problem = await Problem.findOne({ problemId });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(400).json({ error: 'Problem has no configured test cases' });
        }

        // 2. Execute Python string securely in child_process wrapper
        const results = await executePython(code, problem.testCases);

        // 3. Return exact JSON to frontend matching `TestResult` interface
        res.json(results);

    } catch (err) {
        console.error('Execution Error:', err);
        res.status(500).json({
            status: "failed",
            message: "Internal Server Error",
            cases: [],
            summary: err.message
        });
    }
});

module.exports = router;
