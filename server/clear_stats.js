const mongoose = require('mongoose');
require('dotenv').config();
const Submission = require('./models/Submission');

const clearStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await Submission.deleteMany({});
        console.log(`Deleted ${result.deletedCount} submissions.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
clearStats();
