
import puppeteer from 'puppeteer';

// Helper to delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // 1. Go to Instant Quote
  console.log("1. Navigating to /instant-quote...");
  await page.goto('http://localhost:3000/instant-quote', { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Page loaded. Title:", await page.title());

  // 2. Lookup Plate
  console.log("2. Entering Plate KRB400...");
  try {
    await page.waitForSelector('input[placeholder="ABC123"]', { timeout: 5000 });
  } catch (e) {
    console.error("Input not found! Screenshotting...");
    await page.screenshot({ path: 'debug_no_input.png' });
    const html = await page.evaluate(() => document.body.outerHTML);
    const fs = require('fs');
    fs.writeFileSync('debug.html', html);
    console.log("HTML dumped to debug.html");
    throw e;
  }
  await page.type('input[placeholder="ABC123"]', 'KRB400');
  
  // Enter Email
  await page.type('input[type="email"]', 'test@browser.com');

  // Click Lookup
  console.log("3. Clicking Lookup...");
  await page.click('button[type="submit"]');

  // 3. Wait for Results (Wait for text "Identity Verified" or ServiceCard)
  console.log("4. Waiting for results...");
  try {
    await page.waitForFunction(
      () => document.body.innerText.toUpperCase().includes('BASIC SERVICE'), 
      { timeout: 40000 }
    );
    console.log("Basic Service found (Lookup Success).");
  } catch (e) {
    console.log("Timeout waiting for result text. Checking for error messages...");
    const errorText = await page.evaluate(() => document.querySelector('.text-red-500')?.textContent);
    console.log("On-screen Error:", errorText);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log("Body text snippet:", bodyText.substring(0, 500));
    await page.screenshot({ path: 'error_lookup.png' });
    throw e;
  }

  // 4. Select Service
  console.log("5. Selecting 'Basic Service'...");
  // Find button inside the first ServiceCard (Basic Service)
  // We can look for the button with text "Select & Book Slot"
  const buttons = await page.$$('button');
  let targetBtn;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text?.includes("Select & Book Slot")) {
      targetBtn = btn;
      break; 
    }
  }

  if (!targetBtn) {
    throw new Error("Could not find Service Selection button");
  }
  
  await targetBtn.click();

  // 5. Wait for Redirect to Booking Page
  console.log("6. Waiting for booking page...");
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log("Current URL:", page.url());

  if (!page.url().includes('/book')) {
    throw new Error("Did not redirect to booking page");
  }

  // 6. Select Date
  console.log("7. Selecting Date...");
  try {
    // Wait for Calendar day buttons
    await page.waitForSelector('.rdp-day_button', { timeout: 10000 });
    // Click first non-disabled day
    const day = await page.$('button.rdp-day_button:not([disabled])');
    if (day) {
      await day.click();
      console.log("Date clicked.");
    } else {
      throw new Error("No available dates found");
    }
  } catch (e) {
    console.error("Date selection failed! Screenshotting...");
    await page.screenshot({ path: 'error_date_selection.png' });
    const html = await page.evaluate(() => document.body.outerHTML);
    const fs = require('fs');
    fs.writeFileSync('debug_book.html', html);
    throw e;
  }

  // Click a Time Slot (if any)
  // Time slots are loaded async. Wait for them.
  console.log("8. Waiting for time slots...");
  // Look for buttons that look like slots. Maybe contains ":"
  await delay(2000); // Wait for slots to load
  await page.waitForSelector('button.group'); // Slot buttons have 'group' class? Needs verification.
  // Actually, checking page.tsx for slot rendering... 
  // <button onClick={() => setSelectedSlot(slot)} ...>
  // It renders time, e.g. "08:00 AM".
  
  // Let's try to click a button containing "AM" or "PM"
  const slotButtons = await page.$$('button');
  let slotClicked = false;
  for (const btn of slotButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes("AM") || text.includes("PM"))) {
       await btn.click();
       slotClicked = true;
       console.log(`Clicked slot: ${text}`);
       break;
    }
  }
  
  if (!slotClicked) {
     console.log("No specific slot button found via text. Screenshotting...");
     await page.screenshot({ path: 'error_slots.png' });
     // Try to click the first button that follows "Available Start Times"
     // This is brittle. Assuming one was clicked or we failed.
     // If failed, form submission will be disabled.
  }

  // 7. Fill Form
  console.log("9. Filling Customer Form...");
  // Full Name
  await page.click('input[placeholder="John Doe"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder="John Doe"]', 'Browser Test User');
  
  // Phone
  await page.click('input[placeholder="027..."]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder="027..."]', '0219876543');
  
  // Email (pre-filled from quote)
  await page.click('input[placeholder="john@example.com"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder="john@example.com"]', 'test@browser.com');
  
  // Address
  await page.click('input[placeholder="123 Example Street"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder="123 Example Street"]', '123 Test Ave');
  
  // Suburb
  await page.click('input[placeholder="Ponsonby"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder="Ponsonby"]', 'CBD');

  await delay(1000);

  // 8. Submit
  console.log("10. Clicking Secure Payment...");
  // Find button with text "SECURE PAYMENT"
  const submitButtons = await page.$$('button');
  let submitBtn;
  for (const btn of submitButtons) {
     const text = await page.evaluate(el => el.textContent, btn);
     if (text?.includes("SECURE PAYMENT")) {
        submitBtn = btn;
        break;
     }
  }

  if (!submitBtn) throw new Error("Submit button not found");
  
  // Check if disabled
  const isDisabled = await page.evaluate(el => el.disabled, submitBtn);
  if (isDisabled) {
    console.error("Submit button is disabled! Maybe slot not selected.");
    await page.screenshot({ path: 'error_disabled.png' });
    throw new Error("Submit button disabled");
  }

  await submitBtn.click();

  // 9. Wait for Stripe Redirect
  console.log("11. Waiting for Stripe redirect...");
  // We expect navigation to stripe.com or checkout.stripe.com
  // Note: networkidle0 might time out if stripe loads many things, we can wait for URL change
  try {
     await page.waitForFunction(() => location.href.includes('stripe.com'), { timeout: 15000 });
     console.log("Redirected to:", page.url());
     console.log("SUCCESS: Flow Completed!");
  } catch (e) {
     console.log("Redirect failed or timed out. Current URL:", page.url());
     await page.screenshot({ path: 'error_redirect.png' });
     throw e;
  }

  await browser.close();
}

main().catch(console.error);
