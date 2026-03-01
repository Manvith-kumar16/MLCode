const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');
        const problems = await Problem.find({});

        // Find problems to delete
        const toDeleteIds = problems
            .filter(p => !isNaN(parseInt(p.problemId)) && parseInt(p.problemId) > 420)
            .map(p => p._id);

        if (toDeleteIds.length > 0) {
            const res = await Problem.deleteMany({ _id: { $in: toDeleteIds } });
            console.log(`Deleted ${res.deletedCount} problems.`);
        } else {
            console.log('No problems > 420 found to delete.');
        }

        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
