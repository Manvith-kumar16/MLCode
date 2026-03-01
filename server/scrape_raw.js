const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log('Launching browser...');
        // Use standard settings for Windows local execution
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        console.log('Navigating to https://www.deep-ml.com/problems ...');
        await page.goto('https://www.deep-ml.com/problems', { waitUntil: 'networkidle2' });

        console.log('Extracting HTML...');
        // Get the entire HTML content
        const html = await page.content();

        fs.writeFileSync('deep_ml_raw.html', html);
        console.log('Saved to deep_ml_raw.html');

        // Let's also try to see if there's any JSON in ___NEXT_DATA___ or similar React state
        const nextData = await page.evaluate(() => {
            const nextNode = document.getElementById('__NEXT_DATA__');
            if (nextNode) return nextNode.textContent;
            return null;
        });

        if (nextData) {
            fs.writeFileSync('deep_ml_next_data.json', nextData);
            console.log('Saved __NEXT_DATA__ JSON too!');
        }

        await browser.close();
    } catch (err) {
        console.error('Error during scraping:', err);
    }
})();
