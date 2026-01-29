var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// schema.ts
var schema_exports = {};
__export(schema_exports, {
  availabilitySlots: () => availabilitySlots,
  blogPosts: () => blogPosts,
  bookings: () => bookings,
  chatConversations: () => chatConversations,
  inspectionReports: () => inspectionReports,
  magicLinks: () => magicLinks,
  quoteRequests: () => quoteRequests,
  serviceAreas: () => serviceAreas,
  serviceHistory: () => serviceHistory,
  testimonials: () => testimonials,
  users: () => users
});
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
var users, magicLinks, quoteRequests, testimonials, serviceAreas, blogPosts, bookings, serviceHistory, chatConversations, availabilitySlots, inspectionReports;
var init_schema = __esm({
  "schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      /**
       * Surrogate primary key. Auto-incremented numeric value managed by the database.
       * Use this for relations between tables.
       */
      id: int("id").autoincrement().primaryKey(),
      /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      phone: varchar("phone", { length: 50 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    magicLinks = mysqlTable("magic_links", {
      id: int("id").autoincrement().primaryKey(),
      token: varchar("token", { length: 128 }).notNull().unique(),
      openId: varchar("openId", { length: 64 }).notNull(),
      email: varchar("email", { length: 320 }),
      phone: varchar("phone", { length: 50 }),
      expiresAt: timestamp("expiresAt").notNull(),
      consumedAt: timestamp("consumedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    quoteRequests = mysqlTable("quote_requests", {
      id: int("id").autoincrement().primaryKey(),
      customerName: varchar("customerName", { length: 255 }).notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      phone: varchar("phone", { length: 50 }).notNull(),
      vehicleMake: varchar("vehicleMake", { length: 100 }),
      vehicleModel: varchar("vehicleModel", { length: 100 }),
      vehicleYear: int("vehicleYear"),
      serviceType: varchar("serviceType", { length: 100 }).notNull(),
      suburb: varchar("suburb", { length: 100 }),
      message: text("message"),
      status: mysqlEnum("status", ["pending", "contacted", "completed"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    testimonials = mysqlTable("testimonials", {
      id: int("id").autoincrement().primaryKey(),
      customerName: varchar("customerName", { length: 255 }).notNull(),
      rating: int("rating").notNull(),
      // 1-5 stars
      review: text("review").notNull(),
      serviceType: varchar("serviceType", { length: 100 }),
      isApproved: boolean("isApproved").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    serviceAreas = mysqlTable("service_areas", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      description: varchar("description", { length: 255 }),
      latitude: varchar("latitude", { length: 50 }),
      longitude: varchar("longitude", { length: 50 }),
      additionalCharge: boolean("additionalCharge").default(false).notNull(),
      isActive: boolean("isActive").default(true).notNull()
    });
    blogPosts = mysqlTable("blog_posts", {
      id: int("id").autoincrement().primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      excerpt: text("excerpt").notNull(),
      content: text("content").notNull(),
      imageUrl: varchar("imageUrl", { length: 500 }),
      category: varchar("category", { length: 100 }),
      isPublished: boolean("isPublished").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    bookings = mysqlTable("bookings", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId"),
      // Optional: links to authenticated user
      customerName: varchar("customerName", { length: 255 }).notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      phone: varchar("phone", { length: 50 }).notNull(),
      vehicleMake: varchar("vehicleMake", { length: 100 }).notNull(),
      vehicleModel: varchar("vehicleModel", { length: 100 }).notNull(),
      vehicleYear: int("vehicleYear").notNull(),
      vehicleRego: varchar("vehicleRego", { length: 50 }),
      serviceType: varchar("serviceType", { length: 100 }).notNull(),
      servicePackage: varchar("servicePackage", { length: 50 }),
      // Bronze, Silver, Gold
      appointmentDate: timestamp("appointmentDate").notNull(),
      appointmentTime: varchar("appointmentTime", { length: 20 }).notNull(),
      // e.g., "09:00-11:00"
      suburb: varchar("suburb", { length: 100 }).notNull(),
      address: text("address").notNull(),
      notes: text("notes"),
      status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
      estimatedCost: int("estimatedCost"),
      actualCost: int("actualCost"),
      adminNotes: text("adminNotes"),
      stripeSessionId: varchar("stripeSessionId", { length: 255 }),
      paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed"]).default("pending").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    serviceHistory = mysqlTable("service_history", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      userId: int("userId"),
      serviceDate: timestamp("serviceDate").notNull(),
      serviceType: varchar("serviceType", { length: 100 }).notNull(),
      vehicleMake: varchar("vehicleMake", { length: 100 }).notNull(),
      vehicleModel: varchar("vehicleModel", { length: 100 }).notNull(),
      vehicleRego: varchar("vehicleRego", { length: 50 }),
      workPerformed: text("workPerformed").notNull(),
      partsUsed: text("partsUsed"),
      totalCost: int("totalCost").notNull(),
      nextServiceDue: timestamp("nextServiceDue"),
      invoiceUrl: varchar("invoiceUrl", { length: 500 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    chatConversations = mysqlTable("chat_conversations", {
      id: int("id").autoincrement().primaryKey(),
      sessionId: varchar("sessionId", { length: 255 }).notNull(),
      userId: int("userId"),
      customerName: varchar("customerName", { length: 255 }),
      customerEmail: varchar("customerEmail", { length: 320 }),
      messages: text("messages").notNull(),
      // JSON array of messages
      isResolved: boolean("isResolved").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    availabilitySlots = mysqlTable("availability_slots", {
      id: int("id").autoincrement().primaryKey(),
      date: varchar("date", { length: 20 }).notNull(),
      // YYYY-MM-DD format
      timeSlot: varchar("timeSlot", { length: 20 }).notNull(),
      // e.g., "09:00-11:00"
      isAvailable: boolean("isAvailable").default(true).notNull(),
      maxBookings: int("maxBookings").default(1).notNull(),
      currentBookings: int("currentBookings").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    inspectionReports = mysqlTable("inspection_reports", {
      id: int("id").autoincrement().primaryKey(),
      bookingId: int("bookingId").notNull(),
      type: mysqlEnum("type", ["pre_purchase", "service"]).default("pre_purchase").notNull(),
      schemaVersion: varchar("schemaVersion", { length: 20 }).default("v1").notNull(),
      /**
       * JSON-encoded structure of sections, items, statuses, comments, and photos
       */
      data: text("data").notNull(),
      /**
       * Public token used to generate a customer-facing link to this report
       */
      publicToken: varchar("publicToken", { length: 255 }).notNull().unique(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
  }
});

// server/_core/blog-data.ts
var blog_data_exports = {};
__export(blog_data_exports, {
  BLOG_POSTS: () => BLOG_POSTS
});
var BLOG_POSTS;
var init_blog_data = __esm({
  "server/_core/blog-data.ts"() {
    "use strict";
    BLOG_POSTS = [
      {
        title: "Mobile Mechanic vs. Garage: Why Mobile is Winning in Auckland",
        slug: "mobile-mechanic-vs-garage-auckland",
        excerpt: "Tired of dropping your car off and finding a ride? Discover why more Aucklanders are switching to mobile mechanics for convenience, transparency, and competitive pricing.",
        content: `
## The Changing Face of Car Maintenance in Auckland

Gone are the days when getting your car serviced meant disrupting your entire day. You know the drill: wake up early, fight traffic to get to the garage before work, arrange a ride or catch a bus, and then stress about getting back before they close. It's a hassle that Aucklanders are increasingly turning away from.

At **Mobile Autoworks NZ**, we've seen a massive shift in how people approach vehicle care. It's not just about saving time; it's about a better overall experience. Here\u2019s why mobile mechanics are becoming the preferred choice for West Auckland drivers and beyond.

### 1. Unbeatable Convenience
This is the big one. We come to you\u2014whether you're at home in Henderson, at work in Albany, or on a job site in Kumeu. 
*   **No travel time:** You don't sit in traffic.
*   **No waiting rooms:** Relax in your own lounge or keep working while we fix your car.
*   **Flexible scheduling:** We work around your calendar, not the other way around.

### 2. Radical Transparency
Ever wondered what's actually happening to your car behind those closed workshop doors? With a mobile mechanic, you can literally watch us work. We're happy to show you the old parts, explain exactly what we're doing, and answer your questions on the spot. It builds trust that is often missing in traditional settings.

### 3. Competitive Pricing
Many people assume "mobile" means "expensive". In reality, mobile mechanics often have lower overheads than large workshops\u2014no expensive commercial lease for a big building, fewer admin staff, and lower utility bills. We pass those savings on to you. You're paying for expert labour and quality parts, not the landlord's rent.

### 4. Comprehensive Services on Your Driveway
You might be surprised at what we can do on the spot. Our vans are fully equipped workshops on wheels. We handle:
*   **Full Servicing:** Oil, filters, fluids, and safety checks.
*   **Diagnostics:** Advanced scanning tools to identify engine lights and electrical faults.
*   **Brakes:** Pad and rotor replacements.
*   **Batteries:** Testing and replacement.
*   **Pre-Purchase Inspections:** Don't buy a lemon! We check used cars before you hand over the cash.

### The Verdict?
For major engine overhauls or chassis straightening, a workshop is still necessary. But for 90% of your vehicle's needs\u2014maintenance, servicing, and common repairs\u2014a mobile mechanic offers a superior, stress-free alternative. 

**Ready to reclaim your time?** Book your next service with Mobile Autoworks NZ and experience the difference for yourself.
    `,
        imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=1000",
        category: "Mobile Mechanic",
        isPublished: true
      },
      {
        title: "The Ultimate WOF Checklist: How to Pass First Time",
        slug: "ultimate-wof-checklist-nz",
        excerpt: "Don't get caught out by a failed WOF. Run through our pre-inspection checklist to spot common issues like tyres, lights, and wipers before you head to the testing station.",
        content: `
## Prepare for Your Warrant of Fitness (WOF)

There's nothing more frustrating than failing a WOF on a $10 lightbulb or a worn wiper blade\u2014issues you could have easily fixed yourself beforehand. In New Zealand, a Warrant of Fitness is a comprehensive safety check, but many failures are due to simple, observable faults.

At **Mobile Autoworks NZ**, while we don't issue the WOF sticker itself, we specialize in **WOF remedial repairs** and pre-inspection checks. Here is our essential checklist to help you pass the first time.

### 1. Lights and Indicators
This is the most common reason for failure. Walk around your car while a friend helps, or park in front of a reflective shop window.
*   **Check:** Headlights (dip and high beam), brake lights, indicators, reversing lights, and parking lights.
*   **Tip:** Don't forget the number plate light!

### 2. Tyres
Your only contact with the road. WOF standards are strict for a reason.
*   **Tread Depth:** Must be at least **1.5mm** across 3/4 of the tread width.
*   **Damage:** Look for cracks, bubbles, or exposed cords on the sidewalls.
*   **Pressure:** While not a failure point itself, incorrect pressure causes uneven wear which *will* fail.

### 3. Windscreen and Wipers
*   **Wipers:** If they streak, smear, or chatter, replace them. It's a cheap fix.
*   **Windscreen:** Chips or cracks in your direct line of sight (the "C-zone") can be a fail. Any damage larger than 25mm elsewhere is also an issue.
*   **Washers:** Make sure your washer bottle is full and the jets work.

### 4. Interior & Safety Belts
*   **Belts:** Pull them all the way out. Fraying or cuts? Immediate fail. Make sure they click into the buckle securely.
*   **Seats:** Must be secure. If your driver's seat rocks back and forth, it needs tightening.
*   **Warning Lights:** An airbag light (SRS) staying on is a fail.

### 5. Fluids and Leaks
*   **Oil/Coolant:** A few drops are usually okay, but a dripping leak onto the exhaust or ground is a fail.
*   **Exhaust:** Listen for loud noises or look for excessive smoke. A hole in the exhaust system is a guaranteed fail.

### What if You Fail?
Don't panic. You have **28 days** to fix the issues and get a re-check (usually free). 
*   **We can help:** Mobile Autoworks NZ can come to you to fix suspension bushes, brakes, light bulbs, and other common failure items. We save you the hassle of driving a "failed" car back and forth to workshops.

*Disclaimer: This guide covers common checks but is not exhaustive. The WOF inspector has the final say.*
    `,
        imageUrl: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=1000",
        category: "WOF",
        isPublished: true
      },
      {
        title: "Warning Lights on Your Dashboard? What They Mean",
        slug: "dashboard-warning-lights-explained",
        excerpt: "Is your dashboard lighting up like a Christmas tree? Learn the difference between Red, Amber, and Green lights and when you need to call a pro immediately.",
        content: `
## Deciphering Your Car's Language

Modern cars are incredibly smart. They constantly monitor thousands of parameters, from engine temperature to tyre rotation speed. When something goes wrong, they try to tell you\u2014but often in hieroglyphics.

Here is a guide to the most common dashboard symbols and, crucially, how urgently you need to act.

### The Colour Code
Just like traffic lights, dashboard warning colours indicate urgency:
*   **\u{1F534} RED:** Stop! This indicates a serious safety issue or potential for major mechanical damage. Pull over safely immediately.
*   **\u{1F7E1} AMBER / ORANGE:** Caution. Something needs attention soon. You can usually drive to a mechanic, but don't ignore it.
*   **\u{1F7E2} GREEN / BLUE:** Information. Systems are on (e.g., headlights, cruise control).

### Top 5 Warning Lights Explained

#### 1. Check Engine Light (Amber)
*   **Symbol:** Outline of an engine.
*   **Meaning:** The ECU (computer) has detected a fault in the engine management system. It could be anything from a loose fuel cap to a failed catalytic converter.
*   **Action:** If the car drives normally, book a diagnostic scan soon. If it's flashing or the car is "shuddering", pull over\u2014you risk damaging the engine.

#### 2. Oil Pressure Warning (Red)
*   **Symbol:** An oil can with a drop.
*   **Meaning:** **CRITICAL.** Your engine has lost oil pressure. Without oil pressure, your engine will destroy itself in seconds.
*   **Action:** **STOP IMMEDIATELY.** Do not drive. Check oil level. If it's low, top it up. If the light stays on, call a tow truck or mobile mechanic.

#### 3. Battery / Charging System (Red)
*   **Symbol:** A battery box with + and - signs.
*   **Meaning:** The car is running off the battery alone; the alternator isn't charging it.
*   **Action:** Turn off non-essential electronics (A/C, radio). Drive immediately to a safe place or mechanic. You have limited time before the engine dies.

#### 4. Temperature Warning (Red)
*   **Symbol:** Thermometer in waves.
*   **Meaning:** The engine is overheating.
*   **Action:** Pull over and turn off the engine. **Do not open the radiator cap** while hot\u2014you will get burned. Let it cool down. This is often caused by a coolant leak or failed water pump.

#### 5. Brake System (Red)
*   **Symbol:** Exclamation mark in a circle or "BRAKE".
*   **Meaning:** Handbrake is on, fluid is low, or there's a hydraulic fault.
*   **Action:** Check handbrake. If off and light remains, your brakes may fail. Do not drive.

### Expert Diagnostics at Your Door
Guessing can be expensive. At Mobile Autoworks NZ, we use professional-grade OBD2 scanning tools to talk directly to your car's computer. We don't just read the code; we diagnose the *root cause*.

**Got a light on?** Don't wait for a breakdown. Contact us for a diagnostic scan today.
    `,
        imageUrl: "https://images.unsplash.com/photo-1583262624115-3b102f4cc785?auto=format&fit=crop&q=80&w=1000",
        category: "Diagnostics",
        isPublished: true
      },
      {
        title: "How Often Should You Service Your Car? A Guide for NZ Conditions",
        slug: "how-often-service-car-nz",
        excerpt: "NZ roads and weather can be tough on vehicles. We break down the recommended service intervals and why skipping an oil change costs you more in the long run.",
        content: `
## Prevention is Cheaper Than Cure

We all know we *should* service our cars, but life gets busy. Is it really that bad if you go a few months over? The short answer: Yes. 

New Zealand conditions are actually classified as "severe" by many vehicle manufacturers. Our stop-start traffic in Auckland, hilly terrain, and variable weather put extra stress on engines and fluids.

### The General Rule: 10,000km or 12 Months
For most petrol vehicles in NZ, the golden rule is every **10,000km** or **every 12 months**, whichever comes first. Even if you only drive 2,000km a year, oil degrades over time due to condensation and oxidation.

### Why Oil Changes Matter
Oil is the lifeblood of your engine. It lubricates, cools, and cleans.
*   **Over time:** Oil breaks down and becomes sludge.
*   **The risk:** Sludge blocks oil galleries. Metal rubs on metal. The result is premature engine wear or catastrophic seizure.
*   **Cost comparison:** A $200 service vs. a $4,000 engine replacement. It's a no-brainer.

### Service Levels Explained

#### 1. Basic Service (The "Oil and Filter")
*   **Best for:** In-between checks for high-mileage drivers.
*   **Includes:** Engine oil change, oil filter replacement, and a visual safety check.

#### 2. Standard / Silver Service (Recommended Annual)
*   **Best for:** The yearly maintenance for most cars.
*   **Includes:** All basic items + air filter check, fluid top-ups (brake, power steering, coolant), tyre rotation, and a comprehensive safety inspection (brakes, suspension, lights).

#### 3. Premium / Gold Service
*   **Best for:** Every 2-3 years or major mileage milestones (e.g., 100,000km).
*   **Includes:** All standard items + spark plugs, fuel filter, cabin air filter, and often brake fluid flush or coolant flush.

### Don't Forget the Cam Belt!
If your car has a rubber cambelt (timing belt), it MUST be changed at the manufacturer's interval (often 100,000km or 5-7 years). If this snaps, your engine is often toast immediately.

### Mobile Servicing Makes It Easy
Sticking to a schedule is hard when it's a hassle. That's why Mobile Autoworks NZ comes to you. We can perform a full comprehensive service in your driveway, keeping your warranty intact and your car running smoothly.

**Is your sticker overdue?** Book a service with us today.
    `,
        imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1000",
        category: "Vehicle Maintenance",
        isPublished: true
      },
      {
        title: "West Auckland Driving: Tips for Saving Fuel in Traffic",
        slug: "fuel-saving-tips-west-auckland",
        excerpt: "Navigating the Northwestern Motorway every day? Learn actionable driving tips to lower your fuel bill and reduce wear and tear on your vehicle.",
        content: `
## Beating the Pump Price

If you live out West\u2014whether in Massey, Henderson, or Te Atat\u016B\u2014you know the pain of the Northwestern Motorway (SH16) during rush hour. Stop-start crawling isn't just frustrating; it burns a hole in your wallet.

While we can't fix the traffic, we can help your car sip rather than guzzle fuel. Here are expert tips for Westie drivers.

### 1. Smooth is Fast (and Cheap)
Aggressive driving\u2014speeding up just to slam on the brakes\u2014is the biggest fuel waster.
*   **The Fix:** Look further ahead. If traffic is stopped 200m away, lift off the accelerator *now*. Coasting uses almost zero fuel.
*   **Benefit:** Saves fuel and saves your brake pads.

### 2. Check Your Tyre Pressure
This is the lowest hanging fruit. Soft tyres create more rolling resistance. It's like trying to ride a bike with flat tyres\u2014much harder work.
*   **The Fix:** Check your pressures monthly. Inflate them to the manufacturer's recommendation (usually found on a sticker inside the driver's door).
*   **Benefit:** Improves fuel economy by up to 3-5% and makes tyres last longer.

### 3. Lose the Weight
Are you carrying a boot full of tools, sports gear, or boxes you've been meaning to drop at the op-shop? 
*   **The Fix:** Every 50kg of extra weight increases fuel consumption by 1-2%. Clear out the junk.
*   **Roof Racks:** If you're not using them, take them off. The aerodynamic drag at 100km/h is significant.

### 4. Maintenance Matters
A poorly maintained car is an inefficient car.
*   **Air Filter:** A clogged air filter chokes the engine.
*   **Spark Plugs:** Worn plugs cause incomplete combustion (wasted fuel).
*   **Oxygen Sensors:** A faulty sensor can trick the computer into injecting too much fuel.

### 5. Plan Your Trips
A cold engine uses much more fuel than a warm one.
*   **The Fix:** "Trip chaining." Combine your errands into one trip rather than three separate ones. Do the grocery run on the way home from work.

### Conclusion
You don't need a hybrid to save money. Simple changes to your driving style and keeping up with maintenance can save you hundreds of dollars a year.

**Think your car is running rich?** Book a tune-up service with Mobile Autoworks NZ to ensure your engine is running at peak efficiency.
    `,
        imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000",
        category: "West Auckland Service Tips",
        isPublished: true
      },
      {
        title: "Why Car Batteries Fail in Winter: Prevention Tips for NZ Drivers",
        slug: "car-battery-failure-winter-nz",
        excerpt: "Cold mornings and a dead battery? Learn why winter is brutal on car batteries and how to avoid being stranded on a freezing Auckland morning.",
        content: `
## The Cold Hard Truth About Winter Batteries

There's nothing worse than turning the key on a cold winter morning and hearing that dreaded slow crank... or worse, nothing at all. If you've ever been stranded with a dead battery, you know the frustration. But why does this happen so often in winter?

### The Science: Cold Kills Battery Power

Car batteries are electrochemical devices. The chemical reactions that produce electricity slow down dramatically in cold temperatures.

*   **At 0\xB0C:** A fully charged battery loses about **35%** of its cranking power.
*   **At -18\xB0C:** It can lose up to **60%** of its power.
*   **Meanwhile:** Your engine needs **more** power to start when cold because the oil is thicker.

It's a double whammy\u2014less power available, more power needed.

### Why Batteries Die in Winter (Not Summer)

Here's the thing: **heat actually damages batteries more than cold**. Summer heat accelerates internal corrosion and evaporates electrolyte fluid. But you don't notice because warm engines start easily.

Come winter, that weakened battery can't deliver the goods. The cold exposes the damage that summer caused.

### Warning Signs Your Battery is Dying

Don't wait for a no-start. Watch for these symptoms:

1.  **Slow cranking:** The engine turns over sluggishly, especially on the first start of the day.
2.  **Dim lights:** Headlights or interior lights seem weaker than usual.
3.  **Dashboard warnings:** Battery or charging system light illuminates.
4.  **Age:** Most batteries last 3-5 years. If yours is older, it's living on borrowed time.
5.  **Corrosion:** White or greenish buildup on the battery terminals.

### Prevention Tips for Auckland Winters

#### 1. Get Your Battery Tested
A simple load test tells you exactly how much life is left. We can do this at your home or workplace in minutes.

#### 2. Clean the Terminals
Corrosion creates resistance. Clean terminals with a wire brush and apply dielectric grease to prevent future buildup.

#### 3. Limit Short Trips
Short trips don't give the alternator enough time to fully recharge the battery. If you only drive short distances, consider a trickle charger.

#### 4. Turn Off Accessories Before Starting
Heated seats, radio, lights\u2014turn them all off before you start the car. Let all available power go to the starter motor.

#### 5. Park Undercover
A garage or carport keeps your car a few degrees warmer, which can make all the difference.

### When to Replace

If your battery is over 4 years old and showing any warning signs, replace it **before** winter hits. A new battery costs far less than a tow truck and the stress of being stranded.

### Mobile Battery Replacement

At Mobile Autoworks NZ, we come to you with a range of quality batteries. We'll test your old one, fit the new one, and dispose of the old battery responsibly\u2014all in your driveway.

**Don't get caught out this winter.** Book a battery check today.
    `,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000",
        category: "Vehicle Maintenance",
        isPublished: true
      },
      {
        title: "Pre-Purchase Inspection: Don't Buy a Lemon",
        slug: "pre-purchase-inspection-guide-nz",
        excerpt: "Buying a used car? A pre-purchase inspection could save you thousands. Here's what we check and why it's worth every dollar.",
        content: `
## The Hidden Risks of Buying Used

That shiny used car looks perfect. The seller swears it's been "well maintained." The price seems fair. But under the skin, there could be thousands of dollars in hidden problems waiting to surface.

In New Zealand, private sales are "buyer beware." Once you hand over the cash, the problems are yours. A pre-purchase inspection (PPI) is your insurance policy.

### What We Check in a Pre-Purchase Inspection

Our comprehensive inspection covers over 150 points across these key areas:

#### 1. Engine & Mechanical
*   Compression test (engine health)
*   Oil condition and leaks
*   Coolant condition (head gasket issues)
*   Belt and hose condition
*   Exhaust smoke analysis

#### 2. Transmission & Drivetrain
*   Gearbox operation (manual and auto)
*   Clutch wear (manual)
*   CV joints and boots
*   Differential condition

#### 3. Suspension & Steering
*   Shock absorbers
*   Ball joints and tie rod ends
*   Bushings
*   Wheel bearings
*   Power steering system

#### 4. Brakes
*   Pad and rotor thickness
*   Brake line condition
*   Handbrake operation
*   ABS system check

#### 5. Electrical
*   Battery health
*   Alternator output
*   All lights and indicators
*   Warning light scan (OBD2)
*   Air conditioning

#### 6. Body & Structure
*   Rust inspection (especially sills, floors, wheel arches)
*   Previous accident damage
*   Panel alignment
*   Paint condition

#### 7. Interior & Safety
*   Seatbelt condition
*   Airbag warning lights
*   Seat adjustments
*   Window and lock operation

### Red Flags We Look For

*   **Mismatched paint:** Sign of accident repair
*   **Fresh undercoating:** Often hides rust
*   **Low oil on dipstick:** Neglected maintenance or consumption issue
*   **Coolant in oil (milky residue):** Head gasket failure
*   **Blue/white exhaust smoke:** Engine wear or turbo issues
*   **Uneven tyre wear:** Alignment or suspension problems

### The Cost of Skipping a PPI

We've seen buyers purchase cars that needed:
*   $3,000 timing chain replacement (2 weeks after purchase)
*   $2,500 transmission rebuild (hidden slipping)
*   $4,000+ rust repair (covered by fresh underseal)

A $200-300 inspection could have saved them thousands\u2014or helped them walk away.

### How It Works

1.  **You find a car** you're interested in
2.  **Book us** to inspect it (we come to the seller's location)
3.  **We inspect** and provide a detailed written report
4.  **You decide** with full knowledge of the car's condition
5.  **Negotiate** using our findings (or walk away)

### Peace of Mind

Even if the car passes with flying colours, you get peace of mind knowing exactly what you're buying. No surprises, no regrets.

**Thinking of buying?** Book a pre-purchase inspection before you hand over your hard-earned money.
    `,
        imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000",
        category: "Pre-Purchase Inspection",
        isPublished: true
      },
      {
        title: "Common Brake Problems and Warning Signs",
        slug: "brake-problems-warning-signs",
        excerpt: "Squealing, grinding, or a soft pedal? Your brakes are trying to tell you something. Learn the warning signs before it's too late.",
        content: `
## Your Brakes: The Most Important Safety System

Your car's brakes are literally a matter of life and death. Yet many drivers ignore warning signs until it's an emergency. Here's how to recognise brake problems early\u2014before they become dangerous and expensive.

### Warning Sign #1: Squealing or Squeaking

**What you hear:** A high-pitched squeal when braking, especially at low speeds.

**What it means:** Most brake pads have a metal wear indicator. When the pad wears down to a certain point, this indicator contacts the rotor and makes noise. It's designed to warn you.

**Action:** Book a brake inspection soon. You likely have some life left, but don't delay.

### Warning Sign #2: Grinding

**What you hear:** A harsh, metal-on-metal grinding sound.

**What it means:** **This is serious.** The brake pads are completely worn through, and the metal backing plate is grinding directly on the rotor. This damages the rotor (expensive) and compromises braking ability (dangerous).

**Action:** Stop driving and get it fixed immediately. Rotors may need replacement as well as pads.

### Warning Sign #3: Soft or Spongy Pedal

**What you feel:** The brake pedal goes further to the floor than usual, or feels "mushy."

**What it means:** There's likely air in the brake lines, or the brake fluid is old and has absorbed moisture. In worst cases, it could indicate a leak in the hydraulic system.

**Action:** Check brake fluid level. If low, there may be a leak. Have the system inspected and bled.

### Warning Sign #4: Pulling to One Side

**What you feel:** The car veers left or right when you brake.

**What it means:** Uneven braking. One side is gripping more than the other. Causes include a stuck caliper, uneven pad wear, or a collapsed brake hose.

**Action:** Needs inspection to identify the cause. Don't ignore it\u2014uneven braking is unpredictable.

### Warning Sign #5: Vibration or Pulsation

**What you feel:** The brake pedal or steering wheel vibrates when braking, especially at higher speeds.

**What it means:** Warped brake rotors. This happens when rotors overheat (e.g., heavy braking down hills) and cool unevenly.

**Action:** Rotors may need machining (resurfacing) or replacement.

### Warning Sign #6: Brake Warning Light

**What you see:** The brake warning light on your dashboard stays on.

**What it means:** Could be as simple as the handbrake being slightly engaged, or as serious as low fluid/hydraulic failure.

**Action:** Check handbrake first. If light remains, check fluid level and have system inspected.

### How Long Do Brakes Last?

*   **Brake pads:** 30,000 - 70,000 km depending on driving style
*   **Rotors:** Often last 2-3 sets of pads
*   **Brake fluid:** Should be flushed every 2-3 years (it absorbs moisture)

### Mobile Brake Service

At Mobile Autoworks NZ, we can inspect and replace your brakes at your home or workplace. We use quality pads and rotors, and we'll show you exactly what we're replacing and why.

**Hearing strange noises?** Don't wait until you can't stop. Book a brake inspection today.
    `,
        imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1000",
        category: "Vehicle Maintenance",
        isPublished: true
      }
    ];
  }
});

// server/_core/index.ts
import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers/index.ts
import { z as z6 } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

// db.ts
init_schema();
import { and, eq, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { nanoid } from "nanoid";

// server/_core/env.ts
var ENV = {
  ownerOpenId: process.env.OWNER_OPEN_ID || "",
  ownerEmail: process.env.OWNER_EMAIL || "",
  ownerPhone: process.env.OWNER_PHONE || "",
  publicAppUrl: process.env.PUBLIC_APP_URL || "",
  databaseUrl: process.env.DATABASE_URL || "",
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development"
};

// db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function createMagicLinkToken(options) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const ttlMinutes = typeof options.ttlMinutes === "number" ? options.ttlMinutes : 15;
  const expiresAt = new Date(Date.now() + ttlMinutes * 6e4);
  const token = nanoid(48);
  const record = {
    token,
    openId: options.openId,
    email: options.email,
    phone: options.phone,
    expiresAt
  };
  await db.insert(magicLinks).values(record);
  return { token, expiresAt };
}
async function consumeMagicLinkToken(token) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const rows = await db.select().from(magicLinks).where(and(eq(magicLinks.token, token), isNull(magicLinks.consumedAt))).limit(1);
  if (rows.length === 0) {
    return null;
  }
  const row = rows[0];
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return null;
  }
  await db.update(magicLinks).set({ consumedAt: /* @__PURE__ */ new Date() }).where(eq(magicLinks.id, row.id));
  return row;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const normalizedEmail = (user.email || "").trim().toLowerCase();
    const normalizedPhone = (user.phone || "").trim();
    const ownerEmail = (ENV.ownerEmail || "").trim().toLowerCase();
    const ownerPhone = (ENV.ownerPhone || "").trim();
    const isOwner = !!ownerEmail && !!normalizedEmail && normalizedEmail === ownerEmail || !!ownerPhone && !!normalizedPhone && normalizedPhone === ownerPhone || !!ENV.ownerOpenId && user.openId === ENV.ownerOpenId;
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (isOwner) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createQuoteRequest(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(quoteRequests).values(data);
  return result;
}
async function getAllQuoteRequests() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(quoteRequests).orderBy(quoteRequests.createdAt);
}
async function getApprovedTestimonials() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(testimonials).where(eq(testimonials.isApproved, true)).orderBy(testimonials.createdAt);
}
async function getActiveServiceAreas() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(serviceAreas).where(eq(serviceAreas.isActive, true));
}
async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { blogPosts: blogPosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(blogPosts2).where(eq(blogPosts2.isPublished, true)).orderBy(blogPosts2.createdAt);
}
async function getBlogPostBySlug(slug) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const { blogPosts: blogPosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(blogPosts2).where(eq(blogPosts2.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createBooking(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(bookings2).values(data);
  return result;
}
async function getAllBookings() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(bookings2).orderBy(bookings2.appointmentDate);
}
async function getBookingsByUserId(userId) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(bookings2).where(eq(bookings2.userId, userId)).orderBy(bookings2.appointmentDate);
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(bookings2).where(eq(bookings2.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateBookingStatus(id, status, adminNotes, estimatedCost, actualCost, paymentStatus) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const updateData = { status };
  if (adminNotes !== void 0) updateData.adminNotes = adminNotes;
  if (estimatedCost !== void 0) updateData.estimatedCost = estimatedCost;
  if (actualCost !== void 0) updateData.actualCost = actualCost;
  if (paymentStatus !== void 0) updateData.paymentStatus = paymentStatus;
  await db.update(bookings2).set(updateData).where(eq(bookings2.id, id));
}
async function updateBookingStripeInfo(id, stripeSessionId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { bookings: bookings2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  await db.update(bookings2).set({ stripeSessionId }).where(eq(bookings2.id, id));
}
async function createServiceHistory(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { serviceHistory: serviceHistory2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(serviceHistory2).values(data);
  return result;
}
async function getServiceHistoryByUserId(userId) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { serviceHistory: serviceHistory2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  return await db.select().from(serviceHistory2).where(eq(serviceHistory2.userId, userId)).orderBy(serviceHistory2.serviceDate);
}
async function createChatConversation(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { chatConversations: chatConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.insert(chatConversations2).values(data);
  return result;
}
async function getChatConversationBySessionId(sessionId) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const { chatConversations: chatConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const result = await db.select().from(chatConversations2).where(eq(chatConversations2.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateChatConversation(sessionId, messages) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { chatConversations: chatConversations2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  await db.update(chatConversations2).set({ messages, updatedAt: /* @__PURE__ */ new Date() }).where(eq(chatConversations2.sessionId, sessionId));
}
async function updateAvailabilitySlot(date, timeSlot, increment) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const { availabilitySlots: availabilitySlots2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const slots = await db.select().from(availabilitySlots2).where(eq(availabilitySlots2.date, date)).limit(1);
  if (slots.length > 0) {
    const currentBookings = slots[0].currentBookings + increment;
    const isAvailable = currentBookings < slots[0].maxBookings;
    await db.update(availabilitySlots2).set({ currentBookings, isAvailable }).where(eq(availabilitySlots2.date, date));
  }
}
async function createInspectionReport(data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const reportData = {
    bookingId: data.bookingId,
    type: data.type ?? "pre_purchase",
    schemaVersion: data.schemaVersion ?? "v1",
    data: data.data,
    publicToken: nanoid(32)
  };
  const result = await db.insert(inspectionReports).values(reportData);
  return result;
}
async function getInspectionReportByBookingId(bookingId) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const rows = await db.select().from(inspectionReports).where(eq(inspectionReports.bookingId, bookingId)).limit(1);
  return rows.length > 0 ? rows[0] : void 0;
}
async function updateInspectionReport(id, data) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.update(inspectionReports).set({ data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(inspectionReports.id, id));
}
async function getInspectionReportByPublicToken(token) {
  const db = await getDb();
  if (!db) {
    return void 0;
  }
  const rows = await db.select().from(inspectionReports).where(eq(inspectionReports.publicToken, token)).limit(1);
  return rows.length > 0 ? rows[0] : void 0;
}
async function seedBlogPosts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed blog posts: database not available");
    return;
  }
  const { blogPosts: blogPosts2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { BLOG_POSTS: BLOG_POSTS2 } = await Promise.resolve().then(() => (init_blog_data(), blog_data_exports));
  for (const post of BLOG_POSTS2) {
    const existing = await db.select().from(blogPosts2).where(eq(blogPosts2.slug, post.slug)).limit(1);
    if (existing.length === 0) {
      console.log(`[Database] Seeding blog post: ${post.title}`);
      await db.insert(blogPosts2).values(post);
    }
  }
}

// server/_core/trpc.ts
async function createContext({ req, res }) {
  let user;
  const openId = req.headers["x-user-openid"];
  if (openId) {
    user = await getUserByOpenId(openId);
  }
  return {
    req,
    res,
    user
  };
}
var t = initTRPC.context().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  }
});
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource"
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You must be an admin to access this resource"
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});

// server/routers/reports.ts
import { z } from "zod";

// shared/types/inspection.ts
function createDefaultPrePurchaseReport(vehicle, customer, inspectionDate) {
  return {
    reportType: "pre_purchase",
    vehicle,
    customer,
    inspectionDate,
    sections: [
      {
        key: "vehicle_identity",
        title: "Vehicle Identity & Basics",
        items: [
          { key: "vin_chassis", label: "VIN / Chassis number", status: "N/A", photos: [] },
          { key: "odometer", label: "Odometer reading", status: "N/A", photos: [] },
          { key: "registration", label: "Registration validity", status: "N/A", photos: [] },
          { key: "service_history", label: "Service history evidence", status: "N/A", photos: [] }
        ]
      },
      {
        key: "exterior_body",
        title: "Exterior / Body",
        items: [
          { key: "paint_panels", label: "Paint & panels", status: "N/A", photos: [] },
          { key: "rust_corrosion", label: "Rust / corrosion", status: "N/A", photos: [] },
          { key: "glass_mirrors", label: "Glass & mirrors", status: "N/A", photos: [] },
          { key: "doors_locks", label: "Doors / locks", status: "N/A", photos: [] },
          { key: "bumpers_trims", label: "Bumpers & trims", status: "N/A", photos: [] }
        ]
      },
      {
        key: "tyres_wheels",
        title: "Tyres & Wheels",
        items: [
          { key: "tyre_tread", label: "Tyre tread depths", status: "N/A", photos: [] },
          { key: "tyre_condition", label: "Tyre age/condition", status: "N/A", photos: [] },
          { key: "wheels_rims", label: "Wheels / rims", status: "N/A", photos: [] },
          { key: "wheel_alignment", label: "Wheel alignment (road test impression)", status: "N/A", photos: [] }
        ]
      },
      {
        key: "brakes_suspension",
        title: "Brakes & Suspension",
        items: [
          { key: "brake_pads", label: "Brake pads/shoes", status: "N/A", photos: [] },
          { key: "brake_discs", label: "Brake discs/drums", status: "N/A", photos: [] },
          { key: "brake_lines", label: "Brake lines/hoses", status: "N/A", photos: [] },
          { key: "suspension", label: "Suspension (shocks/struts)", status: "N/A", photos: [] },
          { key: "steering", label: "Steering components", status: "N/A", photos: [] }
        ]
      },
      {
        key: "engine_bay",
        title: "Engine Bay",
        items: [
          { key: "engine_oil", label: "Engine oil level & condition", status: "N/A", photos: [] },
          { key: "coolant", label: "Coolant level & condition", status: "N/A", photos: [] },
          { key: "belts_hoses", label: "Belts & hoses", status: "N/A", photos: [] },
          { key: "visible_leaks", label: "Visible leaks (oil/coolant)", status: "N/A", photos: [] },
          { key: "battery", label: "Battery & charging", status: "N/A", photos: [] }
        ]
      },
      {
        key: "underbody",
        title: "Underbody (where accessible)",
        items: [
          { key: "oil_leaks_under", label: "Oil leaks", status: "N/A", photos: [] },
          { key: "exhaust", label: "Exhaust system", status: "N/A", photos: [] },
          { key: "structural", label: "Structural rust/damage", status: "N/A", photos: [] }
        ]
      },
      {
        key: "interior",
        title: "Interior",
        items: [
          { key: "seats_belts", label: "Seats & belts", status: "N/A", photos: [] },
          { key: "dashboard_lights", label: "Dashboard warning lights", status: "N/A", photos: [] },
          { key: "hvac", label: "HVAC (heater/AC)", status: "N/A", photos: [] },
          { key: "windows_switches", label: "Windows & switches", status: "N/A", photos: [] }
        ]
      },
      {
        key: "electrical",
        title: "Electrical & Accessories",
        items: [
          { key: "lights", label: "Lights (front/rear/indicators)", status: "N/A", photos: [] },
          { key: "wipers", label: "Wipers & washers", status: "N/A", photos: [] },
          { key: "horn", label: "Horn", status: "N/A", photos: [] },
          { key: "audio", label: "Audio / infotainment (basic check)", status: "N/A", photos: [] }
        ]
      },
      {
        key: "road_test",
        title: "Road Test",
        items: [
          { key: "engine_performance", label: "Engine performance", status: "N/A", photos: [] },
          { key: "transmission", label: "Transmission / clutch", status: "N/A", photos: [] },
          { key: "steering_feel", label: "Steering feel", status: "N/A", photos: [] },
          { key: "braking_performance", label: "Braking performance", status: "N/A", photos: [] },
          { key: "noises_vibrations", label: "Noises / vibrations", status: "N/A", photos: [] }
        ]
      }
    ],
    summary: {
      overallCondition: "Good",
      recommendation: "Caution",
      overallComment: ""
    }
  };
}

// server/routers/reports.ts
var inspectionPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional()
});
var inspectionItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(["OK", "Attention Soon", "Requires Repair", "N/A"]),
  comment: z.string().optional(),
  photos: z.array(inspectionPhotoSchema)
});
var inspectionSectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  items: z.array(inspectionItemSchema)
});
var inspectionReportDataSchema = z.object({
  reportType: z.enum(["pre_purchase", "service"]),
  vehicle: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
    rego: z.string().optional(),
    kms: z.number().optional(),
    vin: z.string().optional()
  }),
  customer: z.object({
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional()
  }),
  inspectionDate: z.string(),
  sections: z.array(inspectionSectionSchema),
  summary: z.object({
    overallCondition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
    recommendation: z.enum(["Recommend purchase", "Caution", "Not recommended"]),
    overallComment: z.string().optional()
  })
});
var reportsRouter = router({
  /**
   * Create a new report for a booking, or return existing one if already created
   */
  createOrGetForBooking: protectedProcedure.input(z.object({
    bookingId: z.number(),
    type: z.enum(["pre_purchase", "service"]).default("pre_purchase")
  })).mutation(async ({ input }) => {
    const existing = await getInspectionReportByBookingId(input.bookingId);
    if (existing) {
      return {
        id: existing.id,
        publicToken: existing.publicToken,
        data: JSON.parse(existing.data),
        isNew: false
      };
    }
    const booking = await getBookingById(input.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    const reportData = createDefaultPrePurchaseReport(
      {
        make: booking.vehicleMake,
        model: booking.vehicleModel,
        year: booking.vehicleYear,
        rego: booking.vehicleRego || void 0
      },
      {
        name: booking.customerName,
        email: booking.email,
        phone: booking.phone
      },
      (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    );
    await createInspectionReport({
      bookingId: input.bookingId,
      type: input.type,
      data: JSON.stringify(reportData)
    });
    const newReport = await getInspectionReportByBookingId(input.bookingId);
    if (!newReport) {
      throw new Error("Failed to create report");
    }
    return {
      id: newReport.id,
      publicToken: newReport.publicToken,
      data: reportData,
      isNew: true
    };
  }),
  /**
   * Update an existing report's data (for autosave)
   */
  update: protectedProcedure.input(z.object({
    id: z.number(),
    data: inspectionReportDataSchema
  })).mutation(async ({ input }) => {
    await updateInspectionReport(input.id, JSON.stringify(input.data));
    return { success: true };
  }),
  /**
   * Get a report by booking ID (for authenticated users)
   */
  getForBooking: protectedProcedure.input(z.object({ bookingId: z.number() })).query(async ({ input }) => {
    const report = await getInspectionReportByBookingId(input.bookingId);
    if (!report) {
      return null;
    }
    return {
      id: report.id,
      bookingId: report.bookingId,
      type: report.type,
      publicToken: report.publicToken,
      data: JSON.parse(report.data),
      createdAt: report.createdAt,
      updatedAt: report.updatedAt
    };
  }),
  /**
   * Get a report by public token (for customer-facing view, no auth required)
   */
  getPublic: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const report = await getInspectionReportByPublicToken(input.token);
    if (!report) {
      return null;
    }
    return {
      id: report.id,
      type: report.type,
      data: JSON.parse(report.data),
      createdAt: report.createdAt
    };
  }),
  /**
   * List all reports (admin only)
   */
  list: adminProcedure.query(async () => {
    return [];
  })
});

// server/routers/vehicle.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError2 } from "@trpc/server";
import fs from "fs";
import { Agent } from "undici";
var motorWebTokenCache = null;
function getMotorWebApiBaseUrl() {
  return (process.env.MOTORWEB_API_BASE_URL || "https://api.motorweb.app").replace(/\/$/, "");
}
async function getMotorWebAccessToken() {
  const baseUrl = getMotorWebApiBaseUrl();
  const clientId = process.env.MOTORWEB_CLIENT_ID;
  const clientSecret = process.env.MOTORWEB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new TRPCError2({
      code: "PRECONDITION_FAILED",
      message: "MotorWeb OAuth credentials not configured. Set MOTORWEB_CLIENT_ID and MOTORWEB_CLIENT_SECRET"
    });
  }
  const now = Date.now();
  if (motorWebTokenCache && motorWebTokenCache.expiresAt - 6e4 > now) {
    return motorWebTokenCache.accessToken;
  }
  if (typeof fetch !== "function") {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Server fetch() is not available. Upgrade Node.js to v18+ or provide a fetch polyfill."
    });
  }
  const tokenUrl = `${baseUrl}/auth/v1/token`;
  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json"
    },
    body
  });
  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    throw new TRPCError2({
      code: "BAD_GATEWAY",
      message: `MotorWeb token endpoint error (${res.status}). ${text2}`.trim()
    });
  }
  const json = await res.json();
  const accessToken = json?.access_token;
  const expiresInSeconds = typeof json?.expires_in === "number" ? json.expires_in : void 0;
  if (!accessToken || !expiresInSeconds) {
    throw new TRPCError2({
      code: "BAD_GATEWAY",
      message: "MotorWeb token response missing access_token/expires_in"
    });
  }
  motorWebTokenCache = {
    accessToken,
    expiresAt: now + expiresInSeconds * 1e3
  };
  return accessToken;
}
async function motorWebGetJson(options) {
  if (typeof fetch !== "function") {
    throw new TRPCError2({
      code: "INTERNAL_SERVER_ERROR",
      message: "Server fetch() is not available. Upgrade Node.js to v18+ or provide a fetch polyfill."
    });
  }
  const query = new URLSearchParams();
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v) query.set(k, v);
    }
  }
  const url = `${options.baseUrl}${options.path}${query.size ? `?${query.toString()}` : ""}`;
  const headers = {
    Accept: "application/json",
    Authorization: options.bearerToken.toLowerCase().startsWith("bearer ") ? options.bearerToken : `Bearer ${options.bearerToken}`
  };
  const res = await fetch(url, { method: "GET", headers });
  if (res.status === 404) {
    throw new TRPCError2({ code: "NOT_FOUND", message: "MotorWeb: resource not found" });
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new TRPCError2({
      code: "BAD_GATEWAY",
      message: `MotorWeb error (${res.status}). ${bodyText}`.trim()
    });
  }
  return await res.json();
}
function getMotorWebRobotAgent() {
  const p12Base64 = process.env.MOTORWEB_ROBOT_P12_BASE64;
  const p12Path = process.env.MOTORWEB_ROBOT_P12_PATH;
  const passphrase = process.env.MOTORWEB_ROBOT_P12_PASSPHRASE;
  if (!passphrase) {
    throw new TRPCError2({
      code: "PRECONDITION_FAILED",
      message: "MOTORWEB_ROBOT_P12_PASSPHRASE is not configured on the server"
    });
  }
  let pfx;
  if (p12Base64) {
    pfx = Buffer.from(p12Base64, "base64");
  } else if (p12Path) {
    pfx = fs.readFileSync(p12Path);
  } else {
    throw new TRPCError2({
      code: "PRECONDITION_FAILED",
      message: "MotorWeb mTLS certificate not configured. Set MOTORWEB_ROBOT_P12_BASE64 or MOTORWEB_ROBOT_P12_PATH"
    });
  }
  return new Agent({
    connect: {
      pfx,
      passphrase
    }
  });
}
async function motorWebRobotRequest(options) {
  const query = new URLSearchParams();
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v) query.set(k, v);
    }
  }
  const url = `${options.baseUrl}${options.path}${query.size ? `?${query.toString()}` : ""}`;
  const dispatcher = getMotorWebRobotAgent();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json, text/xml, application/xml, */*"
    },
    // Node fetch is undici-based; dispatcher is how we attach an mTLS agent.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    dispatcher
  });
  if (res.status === 404) {
    throw new TRPCError2({ code: "NOT_FOUND", message: "MotorWeb: resource not found" });
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new TRPCError2({
      code: "BAD_GATEWAY",
      message: `MotorWeb error (${res.status}). ${bodyText}`.trim()
    });
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return {
      contentType,
      data: await res.json(),
      text: null
    };
  }
  return {
    contentType,
    data: null,
    text: await res.text()
  };
}
var vehicleRouter = router({
  /**
   * Admin-only reports. These are intentionally NOT used for public quote/booking auto-fill.
   */
  basicVehicleInfo: adminProcedure.input(
    z2.object({
      plate: z2.string().optional(),
      vin: z2.string().optional()
    })
  ).query(async ({ input }) => {
    const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");
    const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    if (!plate && !vin) {
      throw new TRPCError2({
        code: "BAD_REQUEST",
        message: "Provide either plate or vin"
      });
    }
    const plateOrVin = plate ?? vin;
    const result = await motorWebRobotRequest({
      baseUrl: motorWebRobotBaseUrl,
      path: "/b2b/bvi/generate/4.0",
      query: {
        plateOrVin
      }
    });
    const raw = result.data ?? result.text;
    const vehicle = result.data?.vehicle;
    const summary = {
      plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
      vin: vehicle?.vin ?? vin ?? null,
      make: vehicle?.make ?? null,
      model: vehicle?.model ?? null,
      year: vehicle?.yearOfManufacture ?? null,
      transmission: vehicle?.transmission?.type?.description ?? null,
      fuel: vehicle?.fuelType?.description ?? null,
      wofExpiry: vehicle?.wof?.expiryDate ?? null,
      regoExpiry: vehicle?.licence?.expiryDate ?? null,
      alerts: result.data?.alerts ?? []
    };
    return { provider: "motorweb_robot", summary, raw, contentType: result.contentType };
  }),
  assetCheck: adminProcedure.input(
    z2.object({
      plate: z2.string().optional(),
      vin: z2.string().optional()
    })
  ).query(async ({ input }) => {
    const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");
    const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    if (!plate && !vin) {
      throw new TRPCError2({ code: "BAD_REQUEST", message: "Provide either plate or vin" });
    }
    const plateOrVin = plate ?? vin;
    const result = await motorWebRobotRequest({
      baseUrl: motorWebRobotBaseUrl,
      path: "/b2b/vir/generate/4.0",
      query: {
        plateOrVin
      }
    });
    const raw = result.data ?? result.text;
    const vehicle = result.data?.vehicle;
    const summary = {
      plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
      vin: vehicle?.vin ?? vin ?? null,
      make: vehicle?.make ?? null,
      model: vehicle?.model ?? null,
      year: vehicle?.yearOfManufacture ?? null,
      reportedStolen: vehicle?.reportedStolen ?? null,
      numberOfOwners: vehicle?.numberOfOwners ?? null,
      alerts: result.data?.alerts ?? []
    };
    return { provider: "motorweb_robot", summary, raw, contentType: result.contentType };
  }),
  chassisCheckPlusRedbook: adminProcedure.input(
    z2.object({
      plate: z2.string().optional(),
      vin: z2.string().optional(),
      widen: z2.boolean().optional()
    })
  ).query(async ({ input }) => {
    const motorWebRobotBaseUrl = (process.env.MOTORWEB_ROBOT_BASE_URL || "https://robot.motorweb.co.nz").replace(/\/$/, "");
    const plate = input.plate ? input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    const vin = input.vin ? input.vin.toUpperCase().replace(/[^A-Z0-9]/g, "") : void 0;
    if (!plate && !vin) {
      throw new TRPCError2({ code: "BAD_REQUEST", message: "Provide either plate or vin" });
    }
    const plateOrVin = plate ?? vin;
    const result = await motorWebRobotRequest({
      baseUrl: motorWebRobotBaseUrl,
      path: "/b2b/ccr/generate/4.0",
      query: {
        plateOrVin,
        widen: input.widen === void 0 ? void 0 : String(input.widen)
      }
    });
    const raw = result.data ?? result.text;
    const vehicle = result.data?.vehicle;
    const summary = {
      plate: vehicle?.currentPlate?.plateNumber ?? vehicle?.plates?.[0]?.plateNumber ?? plate ?? null,
      vin: vehicle?.vin ?? vin ?? null,
      make: vehicle?.make ?? null,
      model: vehicle?.model ?? null,
      year: vehicle?.yearOfManufacture ?? null,
      redbookCodes: result.data?.redbookCodes ?? [],
      alerts: result.data?.alerts ?? []
    };
    return { provider: "motorweb_robot", summary, raw, contentType: result.contentType };
  }),
  lookup: publicProcedure.input(z2.object({ plate: z2.string() })).mutation(async ({ input }) => {
    const normalizedPlate = input.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!normalizedPlate) {
      throw new TRPCError2({
        code: "BAD_REQUEST",
        message: "Registration plate is required"
      });
    }
    const hasOAuth = !!(process.env.MOTORWEB_CLIENT_ID && process.env.MOTORWEB_CLIENT_SECRET);
    const marketDataBaseUrl = `${getMotorWebApiBaseUrl()}/market-data`;
    if (hasOAuth) {
      const bearer = await getMotorWebAccessToken();
      const data = await motorWebGetJson({
        baseUrl: marketDataBaseUrl,
        bearerToken: bearer,
        path: `/v1/vehicles/plate/${encodeURIComponent(normalizedPlate)}`
      });
      const vehicle = data?.vehicle;
      const make = vehicle?.make ?? null;
      const model = vehicle?.model ?? null;
      const year = vehicle?.year ?? null;
      const confidence = data?.confidence ?? vehicle?.confidence ?? vehicle?.confidence_score ?? data?.confidence_score;
      const upstreamVehicle = data?.upstream_vehicle ?? vehicle?.upstream_vehicle;
      if (!make || !model || !year) {
        throw new TRPCError2({
          code: "UNPROCESSABLE_CONTENT",
          message: upstreamVehicle ? `Vehicle match failed/unsupported. Upstream vehicle: ${upstreamVehicle}` : "Vehicle match failed/unsupported"
        });
      }
      return {
        make,
        model,
        year,
        fuelType: vehicle?.fuel_type ?? vehicle?.fuel ?? null,
        transmission: vehicle?.transmission ?? null,
        bodyType: vehicle?.body_type ?? null,
        title: vehicle?.title ?? null,
        confidence: confidence ?? "standard",
        upstreamVehicle: upstreamVehicle ?? null,
        provider: "motorweb_oauth"
      };
    }
    console.log(`[VehicleLookup] MotorWeb OAuth not configured. Using mock vehicle lookup for plate: ${normalizedPlate}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (normalizedPlate === "ERROR") {
      throw new TRPCError2({
        code: "NOT_FOUND",
        message: "Vehicle not found"
      });
    }
    if (normalizedPlate.includes("TESLA") || normalizedPlate === "EV123") {
      return {
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        fuelType: "Electric",
        transmission: "Automatic",
        bodyType: "Sedan",
        title: "2023 Tesla Model 3",
        confidence: "standard",
        upstreamVehicle: null,
        provider: "mock"
      };
    }
    if (normalizedPlate.includes("RANGER") || normalizedPlate === "UTE456") {
      return {
        make: "Ford",
        model: "Ranger",
        year: 2021,
        fuelType: "Diesel",
        transmission: "Automatic",
        bodyType: "Ute",
        title: "2021 Ford Ranger",
        confidence: "standard",
        upstreamVehicle: null,
        provider: "mock"
      };
    }
    return {
      make: "Toyota",
      model: "Corolla",
      year: 2018,
      fuelType: "Petrol",
      transmission: "Automatic",
      bodyType: "Hatchback",
      title: "2018 Toyota Corolla",
      confidence: "reduced",
      upstreamVehicle: null,
      provider: "mock"
    };
  })
});

// server/routers/auth.ts
import { z as z3 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
function normalizePhone(phone) {
  return phone.replace(/[^0-9+]/g, "");
}
function getPublicAppUrlFromCtx(ctx) {
  const envUrl = (ENV.publicAppUrl || "").trim().replace(/\/$/, "");
  if (envUrl) return envUrl;
  const host = ctx?.req?.headers?.host;
  const protocol = ctx?.req?.protocol || "http";
  if (host) return `${protocol}://${host}`;
  return "";
}
async function sendSms(toPhone, message) {
  console.log(`[SMS to ${toPhone}] ${message}`);
}
var authRouter = router({
  login: publicProcedure.input(z3.object({
    email: z3.string().email(),
    name: z3.string().optional(),
    openId: z3.string()
  })).mutation(async ({ input }) => {
    await upsertUser({
      openId: input.openId,
      email: input.email,
      name: input.name,
      loginMethod: "email"
    });
    return { success: true };
  }),
  requestMagicLink: publicProcedure.input(
    z3.object({
      phone: z3.string().min(6).optional(),
      email: z3.string().email().optional(),
      name: z3.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const phone = input.phone ? normalizePhone(input.phone) : void 0;
    const email = input.email ? input.email.trim().toLowerCase() : void 0;
    if (!phone && !email) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: "Provide phone or email" });
    }
    const openId = phone ? `phone_${phone.replace(/[^0-9]/g, "").slice(-12)}` : `email_${(email || "").replace(/[^a-z0-9]/g, "").slice(-32)}`;
    await upsertUser({
      openId,
      email,
      phone,
      name: input.name,
      loginMethod: "magic_link"
    });
    const { token, expiresAt } = await createMagicLinkToken({
      openId,
      email,
      phone,
      ttlMinutes: 15
    });
    const baseUrl = getPublicAppUrlFromCtx(ctx);
    const link = baseUrl ? `${baseUrl}/magic/${token}` : `/magic/${token}`;
    const msg = `Mobile Autoworks NZ login link (valid 15 min): ${link}`;
    if (phone) {
      await sendSms(phone, msg);
    } else {
      console.log(`[MagicLink email to ${email}] ${msg}`);
    }
    return { success: true, expiresAt };
  }),
  consumeMagicLink: publicProcedure.input(z3.object({ token: z3.string().min(10) })).mutation(async ({ input }) => {
    const tokenRow = await consumeMagicLinkToken(input.token);
    if (!tokenRow) {
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "Magic link is invalid or expired" });
    }
    await upsertUser({
      openId: tokenRow.openId,
      email: tokenRow.email || void 0,
      phone: tokenRow.phone || void 0,
      loginMethod: "magic_link",
      lastSignedIn: /* @__PURE__ */ new Date()
    });
    const user = await getUserByOpenId(tokenRow.openId);
    if (!user) {
      throw new TRPCError3({ code: "UNAUTHORIZED", message: "User not found" });
    }
    return {
      openId: user.openId,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role
    };
  })
});

// server/routers/service-history.ts
import { z as z4 } from "zod";
var serviceHistoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getServiceHistoryByUserId(ctx.user.id);
  }),
  create: adminProcedure.input(z4.object({
    bookingId: z4.number(),
    userId: z4.number().optional(),
    serviceDate: z4.string().transform((str) => new Date(str)),
    // Accept ISO string from frontend
    serviceType: z4.string(),
    vehicleMake: z4.string(),
    vehicleModel: z4.string(),
    vehicleRego: z4.string().optional(),
    workPerformed: z4.string(),
    partsUsed: z4.string().optional(),
    totalCost: z4.number(),
    nextServiceDue: z4.string().optional().transform((str) => str ? new Date(str) : void 0),
    invoiceUrl: z4.string().optional()
  })).mutation(async ({ input }) => {
    await createServiceHistory(input);
    return { success: true };
  })
});

// server/routers/confirmation.ts
import { z as z5 } from "zod";

// server/utils/stripe.ts
import Stripe from "stripe";
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  // Use a recent API version or match what was in next/package.json if known. I'll default to a recent one.
  typescript: true
}) : null;
var APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:5173";
async function createStripeCheckoutSession(bookingId, customerEmail, pricing, bookingData) {
  if (!stripe) {
    console.warn("Stripe key not found. Skipping payment session creation.");
    return null;
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: pricing.currency,
          product_data: {
            name: pricing.description,
            description: pricing.isDeposit ? "Deposit payment. Balance due upon completion of work." : "Service fee."
          },
          unit_amount: pricing.amountCents
        },
        quantity: 1
      }
    ],
    metadata: {
      bookingId: bookingId.toString(),
      customerName: bookingData.customerName,
      phone: bookingData.phone,
      address: bookingData.address,
      suburb: bookingData.suburb,
      vehicleRego: bookingData.vehicleRego || "",
      vehicleMake: bookingData.vehicleMake,
      vehicleModel: bookingData.vehicleModel,
      vehicleYear: bookingData.vehicleYear.toString(),
      serviceType: bookingData.serviceType,
      appointmentDate: bookingData.appointmentDate,
      appointmentTime: bookingData.appointmentTime,
      notes: bookingData.notes || ""
    },
    success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/cancel`
  });
  return session;
}

// server/utils/calendar.ts
import { google } from "googleapis";
var GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
var GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";
var calendar = null;
function getCalendarClient() {
  if (calendar) return calendar;
  if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.warn("[Calendar] GOOGLE_SERVICE_ACCOUNT_JSON not configured");
    return null;
  }
  try {
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar"]
    });
    calendar = google.calendar({ version: "v3", auth });
    return calendar;
  } catch (error) {
    console.error("[Calendar] Failed to initialize:", error);
    return null;
  }
}
function parsePreferredDateTime(appointmentDate, appointmentTime) {
  try {
    const date = new Date(appointmentDate);
    const timeMatch = appointmentTime.match(/^(\d{2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const startDate2 = new Date(date);
      startDate2.setHours(hours, minutes, 0, 0);
      const endDate2 = new Date(startDate2);
      endDate2.setHours(startDate2.getHours() + 2);
      return {
        start: startDate2.toISOString(),
        end: endDate2.toISOString()
      };
    }
    const startDate = new Date(date);
    startDate.setHours(9, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(11, 0, 0, 0);
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  } catch (error) {
    const now = /* @__PURE__ */ new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);
    return {
      start: tomorrow.toISOString(),
      end: endTime.toISOString()
    };
  }
}
async function createCalendarEvent(data) {
  const cal = getCalendarClient();
  if (!cal) {
    console.warn("[Calendar] Calendar client not available");
    return null;
  }
  try {
    const { start, end } = parsePreferredDateTime(data.appointmentDate, data.appointmentTime);
    const event = {
      summary: `Mobile AutoWorks \u2013 ${data.serviceType} \u2013 ${data.vehicleRego || "No Rego"}`,
      location: `${data.address}, ${data.suburb}`,
      description: `
PAID BOOKING CONFIRMATION

Customer: ${data.customerName}
Phone: ${data.phone}
Email: ${data.email}
Address: ${data.address}, ${data.suburb}

Vehicle: ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego || "No Rego"})
Service: ${data.serviceType}

Preferred Date/Time: ${data.appointmentDate} ${data.appointmentTime}
Notes: ${data.notes || "None"}

Payment Details:
- Stripe Session: ${data.stripeSessionId}
- Payment Intent: ${data.paymentIntentId || "N/A"}
- Amount Paid: $${(data.amountPaid / 100).toFixed(2)} NZD
- Paid At: ${data.paidAt}
      `.trim(),
      start: {
        dateTime: start,
        timeZone: "Pacific/Auckland"
      },
      end: {
        dateTime: end,
        timeZone: "Pacific/Auckland"
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          // 1 day before
          { method: "popup", minutes: 60 }
          // 1 hour before
        ]
      }
    };
    const response = await cal.events.insert({
      calendarId: GOOGLE_CALENDAR_ID,
      requestBody: event
    });
    console.log("[Calendar] Event created:", response.data.id);
    return {
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    };
  } catch (error) {
    console.error("[Calendar] Failed to create event:", error.message);
    return null;
  }
}

// server/utils/email.ts
import { Resend } from "resend";
var resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
var ADMIN_EMAIL = process.env.ADMIN_EMAIL || "chris@mobileautoworksnz.com";
var FROM_EMAIL = process.env.FROM_EMAIL || "bookings@mobileautoworksnz.com";
async function sendAdminQuoteEmail(data) {
  if (!resend) {
    console.warn("[Email] Resend not configured, logging quote instead");
    console.log("[Email] Quote request:", data);
    return false;
  }
  try {
    const subject = `NEW QUOTE REQUEST \u2013 ${data.customerName} \u2013 ${data.serviceType}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e293b; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F4CB} New Quote Request</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Info</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Suburb:</span> <span class="value">${data.suburb || "Not specified"}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Info</h2>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear || ""} ${data.vehicleMake || ""} ${data.vehicleModel || ""}</span></p>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <p><span class="label">Requested Service:</span> <span class="value">${data.serviceType}</span></p>
        ${data.message ? `<p><span class="label">Message:</span> <br/><span class="value">${data.message.replace(/\n/g, "<br/>")}</span></p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send admin quote email:", error.message);
    return false;
  }
}
async function sendCustomerQuoteEmail(data) {
  if (!resend) return false;
  try {
    const subject = `Quote Request Received \u2013 Mobile Autoworks NZ`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We've Received Your Request</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thanks for requesting a quote for <strong>${data.serviceType}</strong>. We have received your details and will review them shortly.</p>
      <p>Our team will get back to you as soon as possible with a formal quote or any clarifying questions.</p>
      <p>If you need urgent assistance, feel free to call us at <strong>027 642 1824</strong>.</p>
      <br/>
      <p>Best regards,<br/>Mobile Autoworks NZ</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send customer quote email:", error.message);
    return false;
  }
}
async function sendCustomerBookingReceivedEmail(data) {
  if (!resend) return false;
  try {
    const subject = `Booking Received \u2013 Mobile Autoworks NZ`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>We've Received Your Booking</h1>
    </div>
    <div class="content">
      <p>Hi ${data.customerName},</p>
      <p>Thanks for booking <strong>${data.serviceType}</strong> for <strong>${data.appointmentDate}</strong> at <strong>${data.appointmentTime}</strong>.</p>
      
      ${data.needsPayment ? `
      <p>We've received your request. To finalize your booking and secure your slot, please ensure you complete the secure payment through the checkout link provided.</p>
      ` : `
      <p>We've received your details and will be in touch shortly to confirm your booking.</p>
      `}
      
      <p>If you have any questions, feel free to reply to this email or call us at <strong>027 642 1824</strong>.</p>
      <br/>
      <p>Best regards,<br/>Mobile Autoworks NZ</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send customer booking received email:", error.message);
    return false;
  }
}
async function sendAdminBookingAttemptEmail(data) {
  if (!resend) return false;
  try {
    const subject = `NEW BOOKING ATTEMPT \u2013 ${data.customerName} \u2013 ${data.serviceType}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u{1F4C5} New Booking Attempt</h1>
      <p>Status: <strong>${data.paymentStatus}</strong></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Info</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Address:</span> <span class="value">${data.address}, ${data.suburb}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Info</h2>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} (${data.vehicleRego || "No Rego"})</span></p>
      </div>
      
      <div class="section">
        <h2>Appointment Details</h2>
        <p><span class="label">Service:</span> <span class="value">${data.serviceType}</span></p>
        <p><span class="label">Preferred Date:</span> <span class="value">${data.appointmentDate}</span></p>
        <p><span class="label">Preferred Time:</span> <span class="value">${data.appointmentTime}</span></p>
        ${data.notes ? `<p><span class="label">Notes:</span> <span class="value">${data.notes}</span></p>` : ""}
      </div>
      
      <p style="font-size: 0.875rem; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; pt: 10px;">
        Note: This email was sent immediately upon form submission. If payment is required, you will receive a <strong>separate confirmation email</strong> once Stripe confirms the transaction.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send admin booking attempt email:", error.message);
    return false;
  }
}
async function sendAdminBookingConfirmation(data) {
  if (!resend) {
    console.warn("[Email] Resend not configured, logging email instead");
    console.log("[Email] Would send admin confirmation:", data);
    return false;
  }
  try {
    const subject = `PAID BOOKING \u2013 ${data.vehicleRego || "No Rego"} \u2013 ${data.bookingRef}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; margin-top: 20px; }
    .section { margin-bottom: 20px; }
    .label { font-weight: bold; color: #1f2937; }
    .value { color: #4b5563; }
    .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
    .success { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>\u2705 PAID BOOKING CONFIRMED</h1>
      <p>Booking Reference: <strong>${data.bookingRef}</strong></p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Customer Information</h2>
        <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
        <p><span class="label">Phone:</span> <span class="value">${data.phone}</span></p>
        <p><span class="label">Email:</span> <span class="value">${data.email}</span></p>
        <p><span class="label">Address:</span> <span class="value">${data.address}, ${data.suburb}</span></p>
      </div>
      
      <div class="section">
        <h2>Vehicle Details</h2>
        <p><span class="label">Registration:</span> <span class="value">${data.vehicleRego || "Not provided"}</span></p>
        <p><span class="label">Vehicle:</span> <span class="value">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</span></p>
      </div>
      
      <div class="section">
        <h2>Service Details</h2>
        <p><span class="label">Service Type:</span> <span class="value">${data.serviceType}</span></p>
        <p><span class="label">Preferred Date:</span> <span class="value">${data.appointmentDate}</span></p>
        <p><span class="label">Preferred Time:</span> <span class="value">${data.appointmentTime}</span></p>
        ${data.notes ? `<p><span class="label">Notes:</span> <span class="value">${data.notes}</span></p>` : ""}
      </div>
      
      <div class="section">
        <h2>Payment Information</h2>
        <p><span class="label">Amount Paid:</span> <span class="value">$${(data.amountPaid / 100).toFixed(2)} NZD</span></p>
        <p><span class="label">Paid At:</span> <span class="value">${new Date(data.paidAt).toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}</span></p>
        <p><span class="label">Stripe Session:</span> <span class="value">${data.stripeSessionId}</span></p>
        ${data.paymentIntentId ? `<p><span class="label">Payment Intent:</span> <span class="value">${data.paymentIntentId}</span></p>` : ""}
      </div>
      
      ${data.calendarFailed ? `
      <div class="alert">
        <strong>\u26A0\uFE0F Calendar Event Failed</strong>
        <p>The calendar event could not be created automatically. Please add this booking to your calendar manually.</p>
      </div>
      ` : data.calendarEventId ? `
      <div class="success">
        <strong>\u2705 Calendar Event Created</strong>
        <p><span class="label">Event ID:</span> ${data.calendarEventId}</p>
        ${data.calendarEventLink ? `<p><a href="${data.calendarEventLink}">View in Google Calendar</a></p>` : ""}
      </div>
      ` : ""}
    </div>
  </div>
</body>
</html>
    `.trim();
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      html
    });
    console.log("[Email] Admin confirmation sent:", result.data?.id);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send admin confirmation:", error.message);
    return false;
  }
}

// server/routers/confirmation.ts
var confirmationRouter = router({
  /**
   * Confirm a Stripe checkout session and process the booking
   * This is called from the /success page after payment
   */
  confirm: publicProcedure.input(z5.object({
    sessionId: z5.string()
  })).query(async ({ input }) => {
    if (!stripe) {
      return {
        success: false,
        error: "Payment system not configured"
      };
    }
    try {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["payment_intent"]
      });
      if (session.payment_status !== "paid") {
        return {
          success: false,
          error: "Payment not completed",
          paymentStatus: session.payment_status
        };
      }
      if (session.metadata.confirmed === "true") {
        console.log("[Confirmation] Session already confirmed:", input.sessionId);
        return {
          success: true,
          bookingRef: session.metadata.bookingRef || session.id.slice(-8),
          alreadyConfirmed: true
        };
      }
      const bookingRef = session.id.slice(-8).toUpperCase();
      const bookingData = {
        customerName: session.metadata.customerName || "",
        phone: session.metadata.phone || "",
        email: session.customer_email || session.metadata.email || "",
        address: session.metadata.address || "",
        suburb: session.metadata.suburb || "",
        vehicleRego: session.metadata.vehicleRego || "",
        vehicleMake: session.metadata.vehicleMake || "",
        vehicleModel: session.metadata.vehicleModel || "",
        vehicleYear: parseInt(session.metadata.vehicleYear || "0"),
        serviceType: session.metadata.serviceType || "",
        appointmentDate: session.metadata.appointmentDate || "",
        appointmentTime: session.metadata.appointmentTime || "",
        notes: session.metadata.notes || ""
      };
      const paymentIntent = session.payment_intent;
      const amountPaid = session.amount_total || 0;
      const paidAt = new Date((paymentIntent?.created || Date.now() / 1e3) * 1e3).toISOString();
      let calendarEventId;
      let calendarEventLink;
      let calendarFailed = false;
      try {
        const calendarResult = await createCalendarEvent({
          ...bookingData,
          stripeSessionId: session.id,
          paymentIntentId: paymentIntent?.id,
          amountPaid,
          paidAt
        });
        if (calendarResult) {
          calendarEventId = calendarResult.eventId;
          calendarEventLink = calendarResult.eventLink;
        } else {
          calendarFailed = true;
        }
      } catch (error) {
        console.error("[Confirmation] Calendar creation failed:", error.message);
        calendarFailed = true;
      }
      try {
        await sendAdminBookingConfirmation({
          bookingRef,
          ...bookingData,
          stripeSessionId: session.id,
          paymentIntentId: paymentIntent?.id,
          amountPaid,
          paidAt,
          calendarEventId,
          calendarEventLink,
          calendarFailed
        });
      } catch (error) {
        console.error("[Confirmation] Email send failed:", error.message);
      }
      try {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            confirmed: "true",
            bookingRef,
            calendarEventId: calendarEventId || "",
            confirmedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (error) {
        console.error("[Confirmation] Failed to update session metadata:", error.message);
      }
      const bookingId = parseInt(session.metadata.bookingId || "0");
      if (bookingId) {
        try {
          await updateBookingStatus(bookingId, "confirmed", void 0, void 0, void 0, "paid");
        } catch (error) {
          console.error("[Confirmation] Failed to update booking status:", error.message);
        }
      }
      return {
        success: true,
        bookingRef,
        customerName: bookingData.customerName,
        email: bookingData.email,
        calendarEventId,
        calendarEventLink,
        calendarFailed
      };
    } catch (error) {
      console.error("[Confirmation] Error processing confirmation:", error.message);
      return {
        success: false,
        error: error.message || "Failed to confirm booking"
      };
    }
  })
});

// server/utils/pricing.ts
function computeBookingPrice(serviceType) {
  const type = serviceType;
  if (type === "Mobile Diagnostics" || type === "Engine Diagnostics") {
    return {
      amountCents: 14e3,
      // $140.00
      currency: "nzd",
      description: "Mobile Diagnostics Fee",
      isDeposit: false
      // Full payment
    };
  }
  if (type === "Pre-Purchase Inspection") {
    return {
      amountCents: 15e3,
      // $150.00
      currency: "nzd",
      description: "Pre-Purchase Inspection Deposit",
      isDeposit: true
    };
  }
  if (type === "General Service") {
    return {
      amountCents: 2e4,
      // $200.00 (Example base price)
      currency: "nzd",
      description: "General Service Deposit",
      isDeposit: true
    };
  }
  return {
    amountCents: 8500,
    // $85.00 Callout/Deposit
    currency: "nzd",
    description: "Service Callout & Deposit",
    isDeposit: true
  };
}

// server/routers/index.ts
async function notifyCustomer(email, data) {
  console.log(`[Notification to Customer (${email})] ${data.title}: ${data.content}`);
}
var appRouter = router({
  auth: authRouter,
  /**
   * Vehicle lookup (rego -> make/model/year)
   */
  vehicle: vehicleRouter,
  /**
   * Service History
   */
  serviceHistory: serviceHistoryRouter,
  /**
   * Booking confirmation (post-payment)
   */
  confirmation: confirmationRouter,
  /**
   * Quote requests
   */
  quotes: router({
    submit: publicProcedure.input(z6.object({
      customerName: z6.string().min(1),
      email: z6.string().email(),
      phone: z6.string().min(1),
      vehicleMake: z6.string().optional(),
      vehicleModel: z6.string().optional(),
      vehicleYear: z6.number().optional(),
      serviceType: z6.string().min(1),
      suburb: z6.string().optional(),
      message: z6.string().optional()
    })).mutation(async ({ input }) => {
      await createQuoteRequest(input);
      await sendAdminQuoteEmail(input);
      await sendCustomerQuoteEmail(input);
      return { success: true };
    }),
    list: adminProcedure.query(async () => {
      return await getAllQuoteRequests();
    })
  }),
  /**
   * Testimonials
   */
  testimonials: router({
    list: publicProcedure.query(async () => {
      return await getApprovedTestimonials();
    })
  }),
  /**
   * Service areas
   */
  serviceAreas: router({
    list: publicProcedure.query(async () => {
      return await getActiveServiceAreas();
    })
  }),
  /**
   * Blog posts
   */
  blog: router({
    list: publicProcedure.query(async () => {
      return await getPublishedBlogPosts();
    }),
    getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input }) => {
      return await getBlogPostBySlug(input.slug);
    })
  }),
  /**
   * Bookings
   */
  bookings: router({
    create: publicProcedure.input(z6.object({
      customerName: z6.string().min(1),
      email: z6.string().email(),
      phone: z6.string().min(1),
      vehicleMake: z6.string().min(1),
      vehicleModel: z6.string().min(1),
      vehicleYear: z6.number(),
      vehicleRego: z6.string().optional(),
      serviceType: z6.string().min(1),
      servicePackage: z6.string().optional(),
      appointmentDate: z6.date(),
      appointmentTime: z6.string(),
      suburb: z6.string().min(1),
      address: z6.string().min(1),
      notes: z6.string().optional()
    })).mutation(async ({ input, ctx }) => {
      const bookingData = {
        ...input,
        userId: ctx.user?.id
      };
      const result = await createBooking(bookingData);
      const bookingId = result[0]?.insertId || result.insertId;
      const pricing = computeBookingPrice(input.serviceType);
      let appsUrl = "";
      const session = await createStripeCheckoutSession(
        bookingId,
        input.email,
        pricing,
        {
          customerName: input.customerName,
          phone: input.phone,
          address: input.address,
          suburb: input.suburb,
          vehicleRego: input.vehicleRego,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          vehicleYear: input.vehicleYear,
          serviceType: input.serviceType,
          appointmentDate: input.appointmentDate.toISOString(),
          appointmentTime: input.appointmentTime,
          notes: input.notes
        }
      );
      if (session && session.url) {
        await updateBookingStripeInfo(bookingId, session.id);
        appsUrl = session.url;
      }
      const dateStr = input.appointmentDate.toISOString().split("T")[0];
      await updateAvailabilitySlot(dateStr, input.appointmentTime, 1);
      await sendAdminBookingAttemptEmail({
        ...input,
        appointmentDate: dateStr,
        paymentStatus: session ? "Payment Pending" : "Not Required/Success"
      });
      await sendCustomerBookingReceivedEmail({
        customerName: input.customerName,
        email: input.email,
        serviceType: input.serviceType,
        appointmentDate: dateStr,
        appointmentTime: input.appointmentTime,
        needsPayment: !!session
      });
      return { success: true, checkoutUrl: appsUrl || void 0 };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role === "admin") {
        return await getAllBookings();
      }
      return await getBookingsByUserId(ctx.user.id);
    }),
    getById: protectedProcedure.input(z6.object({ id: z6.number() })).query(async ({ input }) => {
      return await getBookingById(input.id);
    }),
    updateStatus: adminProcedure.input(z6.object({
      id: z6.number(),
      status: z6.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
      adminNotes: z6.string().optional(),
      estimatedCost: z6.number().optional(),
      actualCost: z6.number().optional()
    })).mutation(async ({ input }) => {
      await updateBookingStatus(
        input.id,
        input.status,
        input.adminNotes,
        input.estimatedCost,
        input.actualCost
      );
      const booking = await getBookingById(input.id);
      if (booking) {
        await notifyCustomer(booking.email, {
          title: `Booking Update: ${input.status.toUpperCase()} - Mobile Autoworks NZ`,
          content: `Your booking for ${booking.serviceType} is now ${input.status}. ${input.adminNotes ? `Note: ${input.adminNotes}` : ""}`
        });
      }
      return { success: true };
    })
  }),
  /**
   * Chat conversations (AI chatbot)
   */
  chat: router({
    getConversation: publicProcedure.input(z6.object({ sessionId: z6.string() })).query(async ({ input }) => {
      const conversation = await getChatConversationBySessionId(input.sessionId);
      if (!conversation) {
        return { messages: [] };
      }
      return {
        messages: JSON.parse(conversation.messages)
      };
    }),
    sendMessage: publicProcedure.input(z6.object({
      sessionId: z6.string(),
      message: z6.string()
    })).mutation(async ({ input }) => {
      let conversation = await getChatConversationBySessionId(input.sessionId);
      const userMessage = {
        role: "user",
        content: input.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      const aiResponse = generateChatResponse(input.message);
      if (!conversation) {
        const messages = [userMessage, aiResponse];
        await createChatConversation({
          sessionId: input.sessionId,
          messages: JSON.stringify(messages)
        });
      } else {
        const messages = JSON.parse(conversation.messages);
        messages.push(userMessage, aiResponse);
        await updateChatConversation(input.sessionId, JSON.stringify(messages));
      }
      return { message: aiResponse.content };
    })
  }),
  /**
   * Inspection reports
   */
  reports: reportsRouter
});
function generateChatResponse(message) {
  const lowerMessage = message.toLowerCase();
  let response = "Thanks for your message! I'm the Mobile Autoworks virtual assistant. For specific inquiries, pricing, or to book a job, please use our 'Get a Quote' form or call Chris directly at 027 642 1824.";
  if (lowerMessage.includes("service") || lowerMessage.includes("offer") || lowerMessage.includes("what do you do")) {
    response = "We provide a comprehensive range of mobile mechanical services across West Auckland, including:\n\n\u2022 Mobile Diagnostics ($140 callout & scan)\n\u2022 General Servicing (Bronze, Silver, & Gold packages)\n\u2022 Brake & Rotor Repairs\n\u2022 Suspension & Steering\n\u2022 Pre-Purchase Inspections ($150 deposit)\n\u2022 WOF Remedial Repairs (we fix what the inspector failed!)\n\nAll work is done at your home or workplace for maximum convenience!";
  } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much")) {
    response = "Our pricing is transparent and competitive. \n\n\u2022 Diagnostics: $140 flat fee for mobile scan and fault finding.\n\u2022 Pre-Purchase Inspections: $150 deposit to secure the booking.\n\u2022 Servicing: Varies by package and vehicle.\n\nFor a specific quote for your vehicle, please use our 'Get a Quote' form or call 027 642 1824 and we'll give you an estimate over the phone.";
  } else if (lowerMessage.includes("area") || lowerMessage.includes("location") || lowerMessage.includes("cover") || lowerMessage.includes("west auckland")) {
    response = "We are 100% mobile and service all of West Auckland, including:\n\nMassey, West Harbour, Te Atat\u016B, Henderson, Whenuapai, Hobsonville, Kumeu, Huapai, Riverhead, Taupaki, Swanson, Ranui, Glendene, and Muriwai.\n\nWe come to your home or workplace!";
  } else if (lowerMessage.includes("book") || lowerMessage.includes("appointment") || lowerMessage.includes("schedule")) {
    response = "Booking is easy! You can:\n\n1. Use our 'Book Now' button to select a time and pay your deposit online.\n2. Fill out the 'Get a Quote' form if you have a specific issue.\n3. Call or text Chris at 027 642 1824.\n\nWhich would you prefer?";
  } else if (lowerMessage.includes("wof") || lowerMessage.includes("warrant")) {
    response = "While we don't issue WOFs ourselves, we specialize in 'WOF Remedial Repairs'. This means if your car failed its WOF, we come to you and fix everything on the fail sheet so you can get your sticker on the re-check without leaving home!";
  } else if (lowerMessage.includes("diagnostics") || lowerMessage.includes("scan") || lowerMessage.includes("light") || lowerMessage.includes("engine")) {
    response = "Our mobile diagnostic service is $140. This includes a full system scan using professional equipment at your location, clear explanation of the faults, and a plan for repair. It's the best way to deal with 'Check Engine' lights or mystery noises!";
  } else if (lowerMessage.includes("who is chris") || lowerMessage.includes("owner") || lowerMessage.includes("about")) {
    response = "Mobile Autoworks is owned and operated by Chris, a qualified and experienced mobile mechanic dedicated to providing honest, transparent, and convenient car repairs for the West Auckland community.";
  }
  return {
    role: "assistant",
    content: response,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server/_core/index.ts
import path from "path";
import { fileURLToPath } from "url";
var app = express();
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret || !stripe) {
    res.status(400).send("Webhook Error: Missing signature, secret, or stripe client");
    return;
  }
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = parseInt(session.metadata?.bookingId || "0");
      if (bookingId) {
        await updateBookingStatus(bookingId, "confirmed", void 0, void 0, void 0, "paid");
        console.log(`[Stripe] Booking ${bookingId} confirmed via webhook`);
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error(`[Stripe] Webhook error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
if (ENV.nodeEnv === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDir = path.resolve(__dirname, "../../dist/client");
  app.use(express.static(clientDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}
var port = ENV.port;
app.listen(port, async () => {
  console.log(`[Server] Mobile Autoworks NZ API running on port ${port}`);
  console.log(`[Server] tRPC endpoint: http://localhost:${port}/api/trpc`);
  try {
    await seedBlogPosts();
    console.log("[Server] Blog posts seeded successfully");
  } catch (error) {
    console.error("[Server] Failed to seed blog posts:", error);
  }
});
export {
  appRouter
};
