import puppeteer from 'puppeteer';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("🚀 Starting Full Booking Flow Test\n");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Step 1: Navigate to instant quote
    console.log("1️⃣  Navigating to /instant-quote...");
    await page.goto('http://localhost:3000/instant-quote', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'flow_1_instant_quote.png' });
    console.log("   ✅ Page loaded\n");

    // Step 2: Enter plate and email
    console.log("2️⃣  Entering vehicle details...");
    await page.type('input[placeholder="ABC123"]', 'KRB400');
    await page.type('input[type="email"]', 'test@flow.com');
    await page.screenshot({ path: 'flow_2_form_filled.png' });
    console.log("   ✅ Form filled\n");

    // Step 3: Click lookup
    console.log("3️⃣  Submitting lookup...");
    await page.click('button[type="submit"]');
    await delay(5000); // Wait for API response
    await page.screenshot({ path: 'flow_3_after_lookup.png' });
    console.log("   ✅ Lookup submitted\n");

    // Step 4: Wait for results and click service
    console.log("4️⃣  Waiting for vehicle results...");
    await delay(3000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    if (bodyText.includes('SSANGYONG') || bodyText.includes('$295')) {
      console.log("   ✅ Vehicle found: Ssangyong Actyon\n");
      await page.screenshot({ path: 'flow_4_results.png' });
      
      // Step 5: Click "Select & Book Slot" button
      console.log("5️⃣  Selecting service...");
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text?.includes("Select") && text?.includes("Book")) {
          await btn.click();
          console.log("   ✅ Service selected\n");
          break;
        }
      }
      
      // Step 6: Wait for navigation to booking page
      console.log("6️⃣  Waiting for booking page...");
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 });
      await page.screenshot({ path: 'flow_5_booking_page.png' });
      const url = page.url();
      console.log(`   ✅ Redirected to: ${url}\n`);
      
      if (url.includes('/book')) {
        console.log("7️⃣  On booking page - selecting date/time...");
        await delay(2000);
        
        // Click first available day
        const dayBtn = await page.$('button.rdp-day:not([disabled])');
        if (dayBtn) {
          await dayBtn.click();
          console.log("   ✅ Date selected\n");
          await delay(2000);
          await page.screenshot({ path: 'flow_6_date_selected.png' });
          
          // Click first available time slot
          console.log("8️⃣  Selecting time slot...");
          const slotButtons = await page.$$('button');
          for (const btn of slotButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && (text.includes('AM') || text.includes('PM'))) {
              await btn.click();
              console.log(`   ✅ Time slot selected: ${text}\n`);
              break;
            }
          }
          
          await delay(1000);
          await page.screenshot({ path: 'flow_7_slot_selected.png' });
          
          // Fill customer details
          console.log("9️⃣  Filling customer details...");
          await page.type('input[placeholder="John Doe"]', 'Test User');
          await page.type('input[placeholder="027..."]', '0211234567');
          await page.type('input[placeholder="john@example.com"]', 'test@flow.com');
          await page.type('input[placeholder="123 Example Street"]', '123 Test St');
          await page.type('input[placeholder="Ponsonby"]', 'Mount Eden');
          console.log("   ✅ Details filled\n");
          await page.screenshot({ path: 'flow_8_details_filled.png' });
          
          // Submit booking
          console.log("🔟 Submitting booking...");
          const submitButtons = await page.$$('button');
          for (const btn of submitButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text?.includes('SECURE PAYMENT')) {
              const isDisabled = await page.evaluate(el => el.disabled, btn);
              if (!isDisabled) {
                await btn.click();
                console.log("   ✅ Payment button clicked\n");
                break;
              } else {
                console.log("   ⚠️  Payment button is disabled\n");
              }
            }
          }
          
          // Wait for Stripe redirect
          console.log("1️⃣1️⃣  Waiting for Stripe redirect...");
          await delay(5000);
          const finalUrl = page.url();
          await page.screenshot({ path: 'flow_9_final.png' });
          
          if (finalUrl.includes('stripe.com') || finalUrl.includes('checkout')) {
            console.log(`   ✅ SUCCESS! Redirected to Stripe: ${finalUrl}\n`);
            console.log("=" .repeat(60));
            console.log("🎉 FULL BOOKING FLOW TEST PASSED!");
            console.log("=" .repeat(60));
          } else {
            console.log(`   ⚠️  Final URL: ${finalUrl}`);
            console.log("   Check flow_9_final.png for details\n");
          }
        }
      }
    } else {
      console.log("   ❌ Vehicle lookup failed");
      console.log("   Body text:", bodyText.substring(0, 300));
    }
    
  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
    await page.screenshot({ path: 'flow_error.png' });
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
