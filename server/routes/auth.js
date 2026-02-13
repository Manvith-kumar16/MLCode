
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const { OAuth2Client } = require('google-auth-library');

// Register
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already exists' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await user.save();

        // Create token
        const token = jwt.sign({ _id: savedUser._id }, 'SECRET_KEY_SHOULD_BE_IN_ENV');

        res.header('auth-token', token).json({ token, user: { id: savedUser._id, name: savedUser.name, email: savedUser.email } });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Login
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email is not found' });

        // Check password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });

        // Create token
        const token = jwt.sign({ _id: user._id }, 'SECRET_KEY_SHOULD_BE_IN_ENV');

        res.header('auth-token', token).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get Current User
router.get('/me', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Update Current User
router.put('/me', verify, async (req, res) => {
    try {
        const { name, bio, location, socials, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (location) user.location = location;
        if (socials) user.socials = socials;
        if (avatar) user.avatar = avatar;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Get Leaderboard (Top 10 by points)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find()
            .sort({ points: -1 })
            .limit(10)
            .select('name points problemsSolved streak');

        // Transform data for frontend
        const leaderboardData = users.map((user, index) => ({
            rank: index + 1,
            username: user.name,
            score: user.points,
            solved: user.problemsSolved.easy + user.problemsSolved.medium + user.problemsSolved.hard,
            streak: user.streak.current
        }));

        res.json(leaderboardData);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Google Sign In
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                avatar: picture,
                password: Math.random().toString(36).slice(-8), // Generate random password
                socials: { github: "", linkedin: "", website: "" }
            });
            await user.save();
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
