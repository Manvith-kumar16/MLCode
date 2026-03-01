const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const Problem = require('./models/Problem');

dotenv.config();

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
                }
            });
        }).on('error', err => reject(err));
    });
}

const seedProblems = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        console.log('Fetching problems list from API...');
        // Node 18+ has native fetch. If on older node, use cross-fetch or https module. 
        // We'll use global fetch.
        const listData = await fetchUrl('https://api.deep-ml.com/list-problems');

        const problems = listData.problems;
        console.log(`Found ${problems.length} problems. Creating models...`);

        // We can fetch details for the first few or just populate basic info first.
        // Let's populate the database with the basic list to avoid hammering their API too fast.
        let addedCount = 0;
        let updatedCount = 0;

        for (const prob of problems) {
            // Check if already exists
            let existing = await Problem.findOne({ problemId: prob.id });

            // Wait a little before fetching details to avoid rate limiting
            // Wait, for this seed file, let's just fetch the description for all of them carefully.
            // Or just store the list details. The user wants the questions.
            try {
                const detailData = await fetchUrl(`https://api.deep-ml.com/fetch-problem?problem_id=${prob.id}`);

                let descriptionText = detailData.description || "";

                // Some descriptions are base64 encoded by deep-ml ("SW1wbGVtZW50...")
                // In the API logs, problem 100 has a base64 string.
                // Let's decode it if it doesn't contain spaces (a strong hint it's base64)
                if (descriptionText && descriptionText.length > 20 && !descriptionText.includes(' ')) {
                    try {
                        descriptionText = Buffer.from(descriptionText, 'base64').toString('utf-8');
                    } catch (e) { }
                }

                let starterCode = detailData.starter_code || "";
                if (!starterCode && detailData.tinygrad_starter_code) {
                    try {
                        starterCode = Buffer.from(detailData.tinygrad_starter_code, 'base64').toString('utf-8');
                    } catch (e) { }
                }
                let example = detailData.example || null;
                let testCases = detailData.test_cases || [];

                if (existing) {
                    existing.title = prob.title;
                    existing.difficulty = prob.difficulty === 'easy' ? 'Easy' : (prob.difficulty === 'medium' ? 'Medium' : 'Hard');
                    existing.category = prob.category || "General";
                    existing.description = descriptionText;
                    existing.starterCode = starterCode;
                    existing.example = example;
                    existing.testCases = testCases;
                    await existing.save();
                    updatedCount++;
                } else {
                    await Problem.create({
                        problemId: prob.id,
                        title: prob.title,
                        difficulty: prob.difficulty === 'easy' ? 'Easy' : (prob.difficulty === 'medium' ? 'Medium' : 'Hard'),
                        category: prob.category || "General",
                        description: descriptionText,
                        starterCode: starterCode,
                        example: example,
                        testCases: testCases
                    });
                    addedCount++;
                }
                process.stdout.write('.');
            } catch (err) {
                console.error(`\nFailed to fetch details for problem ${prob.id}`);
            }

            // Sleep for 100ms
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`\nDone! Added ${addedCount} new problems and updated ${updatedCount} existing problems.`);
        mongoose.disconnect();
    } catch (err) {
        console.error('Error seeding data:', err);
        mongoose.disconnect();
    }
};

seedProblems();
