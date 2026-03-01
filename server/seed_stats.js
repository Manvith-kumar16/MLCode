const mongoose = require('mongoose');
require('dotenv').config();
const Submission = require('./models/Submission');
const User = require('./models/User');

const seedStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            process.exit(1);
        }

        // Generate data for the last 6 months
        const subDocs = [];
        const today = new Date();

        for (let i = 0; i < 180; i++) {
            // Randomly skip days to make it look realistic (40% chance of skipping)
            if (Math.random() < 0.4) continue;

            // Random number of submissions in a day (1 to 6)
            const numSubs = Math.floor(Math.random() * 6) + 1;

            for (let j = 0; j < numSubs; j++) {
                const subDate = new Date();
                subDate.setDate(today.getDate() - i);
                subDate.setHours(Math.floor(Math.random() * 24));

                subDocs.push({
                    userId: user._id,
                    problemId: (Math.floor(Math.random() * 50) + 1).toString(),
                    problemTitle: "Sample Problem " + (i * 10 + j),
                    status: Math.random() > 0.3 ? "Accepted" : "Wrong Answer",
                    language: "python",
                    executionTime: Math.floor(Math.random() * 50) + 10,
                    memoryUsed: Math.floor(Math.random() * 20000) + 10000,
                    code: "print('Hello World')",
                    createdAt: subDate
                });
            }
        }

        await Submission.insertMany(subDocs);
        console.log(`Inserted ${subDocs.length} historical submissions for heatmap!`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedStats();
