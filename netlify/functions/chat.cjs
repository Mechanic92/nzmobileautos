const { z } = require("zod");

const ChatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional().default([])
});

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

// Comprehensive business knowledge base
const BUSINESS_CONTEXT = `
You are the AI assistant for Mobile Autoworks NZ, a mobile mechanic service operating in West Auckland and North Shore.

CORE BUSINESS INFORMATION:
- Owner: Chris
- Phone: 027 642 1824
- Email: chris@mobileautoworksnz.com
- Website: www.mobileautoworksnz.com
- Service Model: 100% mobile - we come to your home or workplace

SERVICE AREAS (West Auckland & North Shore):
- West Auckland: Massey, West Harbour, Te Atatū, Henderson, Whenuapai, Hobsonville, Kumeu, Huapai, Riverhead, Swanson, Waitakere
- North Shore: Albany, Northcote, Glenfield, Birkenhead, Takapuna, Devonport, Browns Bay

SERVICES OFFERED:
1. Mobile Diagnostics - $140 flat fee
   - Professional OBD2 scanning
   - Engine light diagnosis
   - ABS, airbag, transmission fault codes
   - Clear explanation of issues
   - Repair plan provided

2. General Servicing (Bronze, Silver, Gold packages)
   - Bronze: Essential service (oil, filter, basic checks)
   - Silver: Advanced service (includes brake inspection, fluid top-ups)
   - Gold: Comprehensive service (full vehicle health check)

3. Pre-Purchase Inspections - $150 deposit
   - Comprehensive vehicle assessment
   - Detailed report on condition
   - Identifies potential issues before you buy
   - Peace of mind for used car purchases

4. WOF Remedial Repairs
   - We DON'T issue WOFs
   - We FIX what failed the WOF inspection
   - Customer sends photo of fail sheet
   - We come to you and fix all items
   - Ready for re-check without leaving home

5. Brake & Rotor Repairs
   - Pad replacement
   - Rotor machining/replacement
   - Brake fluid flush
   - Caliper service
   - Mobile service at your location

6. Suspension & Steering
   - Shock absorber replacement
   - Strut replacement
   - Ball joint replacement
   - Tie rod ends
   - Wheel alignment diagnosis

7. Battery Service
   - Battery testing
   - Charging system diagnosis
   - Battery replacement
   - Jump start service
   - Alternator testing

PRICING PHILOSOPHY:
- Transparent, upfront pricing
- No hidden fees
- $140 diagnostic fee (includes callout + scan)
- Specific job quotes provided after assessment
- Competitive rates for mobile service

BOOKING PROCESS:
1. Online booking for standard services (Book Now button)
2. Quote request form for specific issues
3. Direct call/text to Chris: 027 642 1824
4. All requests reviewed manually to ensure proper parts/time allocation

KEY DIFFERENTIATORS:
- 100% mobile - no workshop needed
- Professional diagnostic equipment
- Transparent communication
- Experienced mechanic (Chris)
- Convenient - work done at your location
- West Auckland & North Shore specialist

TONE & STYLE:
- Friendly, approachable, professional
- Use "we" when referring to the business
- Encourage booking/quotes for specific pricing
- Provide Chris's phone number for urgent/complex queries
- Be helpful but honest about limitations (e.g., we don't issue WOFs)
- Use NZ English spelling and terminology

IMPORTANT LIMITATIONS:
- We do NOT issue Warrants of Fitness (WOF)
- We do NOT provide towing services
- We do NOT work on heavy vehicles/trucks
- Service area limited to West Auckland & North Shore

When answering questions:
1. Be specific and accurate about services, pricing, and areas
2. If asked about pricing for specific jobs, suggest getting a quote
3. For complex technical issues, recommend the $140 diagnostic service
4. Always provide contact details (phone/quote form) for next steps
5. If unsure about something specific, direct to Chris for expert advice
6. Keep responses concise but informative
7. Use bullet points for clarity when listing multiple items
`;

async function generateAIResponse(userMessage, conversationHistory) {
  const apiKey = requireEnv("OPENAI_API_KEY");
  
  // Build messages array with system context
  const messages = [
    {
      role: "system",
      content: BUSINESS_CONTEXT
    },
    // Include conversation history for context
    ...conversationHistory.slice(-6), // Last 6 messages (3 turns) for context
    {
      role: "user",
      content: userMessage
    }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Fast, cost-effective, intelligent
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again or call Chris at 027 642 1824.";
}

// Fallback for when OpenAI is unavailable
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  const knowledgeBase = [
    {
      keywords: ["service", "offer", "what do you do", "repairs", "work"],
      response: "We provide comprehensive mobile mechanical services:\n\n• Mobile Diagnostics ($140)\n• General Servicing (Bronze, Silver, Gold)\n• Brake & Rotor Repairs\n• Suspension & Steering\n• Pre-Purchase Inspections ($150 deposit)\n• WOF Remedial Repairs\n\nAll work done at your location! Need a quote? Call 027 642 1824 or use our quote form."
    },
    {
      keywords: ["price", "cost", "how much", "quote", "fee"],
      response: "Pricing:\n• Mobile Diagnostics: $140 flat fee\n• Pre-Purchase Inspections: $150 deposit\n• Other services: Quote provided after assessment\n\nFor specific pricing, call Chris at 027 642 1824 or use our 'Get a Quote' form."
    },
    {
      keywords: ["area", "location", "cover", "suburb", "where"],
      response: "We service West Auckland & North Shore:\n\nWest Auckland: Massey, Henderson, Te Atatū, Hobsonville, Kumeu, Huapai, Riverhead\nNorth Shore: Albany, Northcote, Glenfield, Takapuna\n\nIs your suburb in these areas?"
    },
    {
      keywords: ["book", "appointment", "schedule"],
      response: "Booking options:\n1. Use our 'Book Now' button for standard services\n2. Fill out 'Get a Quote' form for specific issues\n3. Call/text Chris: 027 642 1824\n\nAll requests reviewed manually to ensure we have the right parts and time for you."
    },
    {
      keywords: ["wof", "warrant", "failed"],
      response: "We DON'T issue WOFs, but we specialize in WOF Remedial Repairs! If your car failed, we come to you and fix everything on the fail sheet. Just send us a photo and we'll get you sorted for the re-check."
    },
    {
      keywords: ["diagnostic", "scan", "light", "engine", "fault"],
      response: "Mobile Diagnostics: $140 flat fee. We use professional equipment to scan your car, explain faults clearly, and provide a repair plan. Covers engine lights, ABS, airbags, and more. Want to book a scan?"
    }
  ];

  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lowerMessage.includes(k))) {
      return item.response;
    }
  }

  return "I'm here to help! For the fastest response on pricing or technical questions, please call Chris at 027 642 1824 or use our 'Get a Quote' form. I can answer questions about our services, areas, and common car problems!";
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { Allow: "POST" },
      body: "Method Not Allowed",
    };
  }

  let payload;
  try {
    payload = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  let input;
  try {
    input = ChatRequestSchema.parse(payload);
  } catch (err) {
    return json(400, { error: "Invalid chat request", details: err?.message });
  }

  try {
    // Try OpenAI first
    const reply = await generateAIResponse(input.message, input.history || []);
    return json(200, { message: reply });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Chat AI Error - falling back to keyword matching]", err);
    
    // Fallback to keyword matching if OpenAI fails
    const fallbackReply = generateFallbackResponse(input.message);
    return json(200, { message: fallbackReply });
  }
};
