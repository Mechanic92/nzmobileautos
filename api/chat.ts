import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { BLOG_POSTS } from "../server/_core/blog-data";

const ChatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
});

function generateChatResponse(message: string) {
  const lowerMessage = message.toLowerCase();

  // 1. Initial knowledge base from project data
  const knowledgeBase = [
    {
      keywords: ["service", "offer", "what do you do", "repairs", "work"],
      response: "We provide a comprehensive range of mobile mechanical services across West Auckland and North Shore:\n\n" +
        "• Mobile Diagnostics ($140 callout & scan)\n" +
        "• General Servicing (Bronze, Silver, & Gold packages)\n" +
        "• Brake & Rotor Repairs\n" +
        "• Suspension & Steering\n" +
        "• Pre-Purchase Inspections ($150 deposit)\n" +
        "• WOF Remedial Repairs (fixing what the inspector failed!)\n\n" +
        "All work is done at your home or workplace. Would you like a quote for a specific job?"
    },
    {
      keywords: ["price", "cost", "how much", "quote", "fee", "charge"],
      response: "Our pricing is transparent:\n\n" +
        "• Mobile Diagnostics: $140 flat fee (includes travel, scan, and clear plan).\n" +
        "• Pre-Purchase Inspections: $150 deposit to secure.\n" +
        "• Servicing: Bronze (Essential), Silver (Advanced), Gold (Comprehensive).\n\n" +
        "For a specific estimate for your vehicle, please use our 'Get a Quote' form or call Chris at 027 642 1824."
    },
    {
      keywords: ["area", "location", "cover", "west auckland", "north shore", "suburb", "where"],
      response: "We are 100% mobile and service West Auckland and North Shore, including:\n\n" +
        "Massey, West Harbour, Te Atatū, Henderson, Whenuapai, Hobsonville, Kumeu, Huapai, Riverhead, Albany, Northcote, Glenfield, and more.\n\n" +
        "We come to your home or workplace! Is your suburb in these areas?"
    },
    {
      keywords: ["book", "appointment", "schedule", "when", "time", "available"],
      response: "Booking is easy:\n\n" +
        "1. Use our 'Book Now' button for standard jobs and pay online.\n" +
        "2. Fill out the 'Get a Quote' form for specific issues.\n" +
        "3. Call or text Chris at 027 642 1824.\n\n" +
        "Requests are reviewed manually to ensure we have the right parts and time for you."
    },
    {
      keywords: ["wof", "warrant", "failed", "inspection", "recheck"],
      response: "While we don't issue WOFs, we specialize in 'WOF Remedial Repairs'. If your car failed its WOF, we come to you and fix everything on the fail sheet so you can pass the re-check without leaving home. Just send us a photo of your fail sheet!"
    },
    {
      keywords: ["diagnostics", "scan", "light", "engine", "fault", "error", "check engine"],
      response: "Our mobile diagnostic service is $140. We use professional equipment to scan your car's computer, explain the faults clearly, and provide a repair plan. It covers engine lights, ABS, airbags, and mystery noises. Should I help you get a quote for a scan?"
    },
    {
      keywords: ["battery", "start", "dead", "flat", "winter", "alternator"],
      response: "Having battery trouble? We offer mobile battery testing and replacement. Winter is tough on batteries! We can come to you, test your charging system, and fit a new battery if needed. Need a jump start or a new battery?"
    },
    {
      keywords: ["brake", "squeal", "grind", "noise", "stop", "rotor"],
      response: "Brake issues are a safety priority. If you hear squealing or grinding, or the pedal feels soft, we can help. We replace pads and rotors on-site. Grinding usually means the rotors are being damaged, so it's best to act fast."
    }
  ];

  // 2. Search knowledge base
  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lowerMessage.includes(k))) {
      return item.response;
    }
  }

  // 3. Search blog posts for relevant tips
  const relevantPost = BLOG_POSTS.find(post =>
    post.title.toLowerCase().includes(lowerMessage) ||
    post.excerpt.toLowerCase().includes(lowerMessage) ||
    (post.category && post.category.toLowerCase().includes(lowerMessage))
  );

  if (relevantPost) {
    return `I found a helpful article on our blog about that: "${relevantPost.title}". \n\n${relevantPost.excerpt}\n\nYou can read more in our Blog section! Would you like me to help you with a quote related to this?`;
  }

  // 4. Default fallback
  return "I'm not quite sure about that, but I'd love to help! For the fastest response on pricing or technical questions, please call Chris at 027 642 1824 or use our 'Get a Quote' form. I'm great at answering questions about our services, areas, and common car problems!";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const input = ChatRequestSchema.parse(req.body);
    const reply = generateChatResponse(input.message);
    return res.status(200).json({ message: reply });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Invalid request";
    return res.status(400).json({ error: message });
  }
}
