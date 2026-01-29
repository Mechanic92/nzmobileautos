
import puppeteer from 'puppeteer';

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true, // Use headless for stability in agent env
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  console.log("Navigating...");
  await page.goto('http://localhost:3000/instant-quote');
  console.log("Page title:", await page.title());
  await page.screenshot({ path: 'screenshot_test.png' });
  console.log("Screenshot saved.");
  await browser.close();
}

main().catch(console.error);
