const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log('Launching browser to intercept APIs...');
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        fs.writeFileSync('api_logs.txt', '--- API LOGS ---\n');

        page.on('response', async (response) => {
            const url = response.url();
            // We want to capture json responses
            if (url.includes('deep-ml.com') && !url.includes('.css') && !url.includes('.js') && !url.includes('.png')) {
                try {
                    const text = await response.text();
                    if (text.includes('difficulty') || text.includes('title') || url.includes('api')) {
                        fs.appendFileSync('api_logs.txt', `\n--- URL: ${url} ---\n${text.substring(0, 2000)}\n`);
                    }
                } catch (e) {
                    // Ignore response reading errors
                }
            }
        });

        console.log('Navigating to https://www.deep-ml.com/problems ...');
        await page.goto('https://www.deep-ml.com/problems', { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('Waiting an extra 5 seconds for dynamic content...');
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('deep_ml_raw2.html', html);
        console.log('Saved to deep_ml_raw2.html, closing browser.');

        await browser.close();
    } catch (err) {
        console.error('Error during scraping:', err);
    }
})();
