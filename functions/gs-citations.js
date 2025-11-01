const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {
  // Replace with your Browserless token (free signup at browserless.io)
  const BROWSERLESS_TOKEN = 'YOUR_BROWSERLESS_TOKEN'; // e.g., 'abc123'
  const PROFILE_URL = 'https://scholar.google.com/citations?user=5fxhlsQAAAAJ&hl=en';

  let browser;
  try {
    // Connect to remote browser (avoids Netlify cold-start issues)
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto(PROFILE_URL, { waitUntil: 'networkidle2' });

    // Extract metrics (total citations, h-index, i10-index)
    const metrics = await page.evaluate(() => {
      const metricRows = Array.from(document.querySelectorAll('tr.gsc_rsb_std'));
      return {
        cited_by_count: parseInt(metricRows[0]?.querySelector('td:last-child')?.textContent || 0),
        h_index: parseInt(metricRows[1]?.querySelector('td:last-child')?.textContent || 0),
        i10_index: parseInt(metricRows[2]?.querySelector('td:last-child')?.textContent || 0)
      };
    });

    // Extract top 6 paper citations (assumes your profile lists them in order)
    const paperCitations = await page.evaluate(() => {
      const paperRows = Array.from(document.querySelectorAll('tr.gsc_a_tr')).slice(0, 6);
      return paperRows.map(row => {
        const citText = row.querySelector('td.gsc_a_t .gs_gray')?.textContent || '';
        return parseInt(citText.match(/\d+/)?.[0] || 0); // Extract number from "Cited by X"
      });
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ stats: metrics, paperCitations })
    };
  } catch (error) {
    console.error('Scraping error:', error);
    // Fallback to hardcoded (update periodically)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        stats: { cited_by_count: 34, h_index: 3, i10_index: 2 },
        paperCitations: [5, 15, 0, 0, 13, 1]
      })
    };
  } finally {
    if (browser) await browser.close();
  }
};