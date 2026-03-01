const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// GET all problems
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().sort({ createdAt: -1 });
        res.status(200).json(problems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch problems', details: err.message });
    }
});

// GET a specific problem by problemId
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findOne({ problemId: req.params.id });
        if (!problem) return res.status(404).json({ error: 'Problem not found' });
        res.status(200).json(problem);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch problem', details: err.message });
    }
});

module.exports = router;
