const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const problemRoutes = require('./routes/problems');
const executeRoutes = require('./routes/execute');
const discussionRoutes = require('./routes/discussions');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/discussions', discussionRoutes);

app.get('/', (req, res) => {
    res.send('ML Code API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
