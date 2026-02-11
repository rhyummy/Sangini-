// ============================================================
// Support Chatbot — Template-based response engine
// No diagnosis. Emotional support + education + navigation.
// ============================================================

interface BotResponse {
  content: string;
  sources?: string[];
}

const DISCLAIMER = '\n\n*Disclaimer: I am an AI support assistant, not a medical professional. This information is educational only and does not constitute a diagnosis or medical advice. Always consult a qualified healthcare provider for medical concerns.*';

// Keyword-based intent matching (simple but effective for MVP)
const intentPatterns: { keywords: string[]; response: string }[] = [
  {
    keywords: ['scared', 'afraid', 'anxious', 'worried', 'nervous', 'panic', 'fear'],
    response:
      "It's completely natural to feel concerned about your health. Remember that being aware and proactive is a strength, not a source of fear.\n\n**Here are some things that may help:**\n- Take deep breaths — anxiety is a normal response\n- Talk to someone you trust about how you're feeling\n- Remember that a risk assessment is NOT a diagnosis\n- Schedule a doctor's appointment to get professional guidance\n- Our platform's community forum has supportive conversations from others who've felt the same way\n\nYou are not alone in this. Would you like me to explain what your risk score means, or guide you to support resources?",
  },
  {
    keywords: ['lump', 'lumps', 'found lump', 'breast lump'],
    response:
      "Finding a lump can be concerning, but it's important to know that **most breast lumps are benign** (non-cancerous). Common causes include cysts, fibroadenomas, or hormonal changes.\n\n**What you should do:**\n1. Don't panic — 8 out of 10 breast lumps are non-cancerous\n2. Note the size, shape, and location\n3. Schedule a clinical breast examination with your doctor\n4. Your doctor may order imaging (ultrasound or mammogram) to evaluate it\n\nWould you like to book an appointment through our platform?",
  },
  {
    keywords: ['mammogram', 'screening', 'test', 'scan', 'ultrasound', 'imaging'],
    response:
      "**Breast Screening Methods:**\n\n- **Mammogram**: An X-ray of the breast. Recommended annually for women 40+ (or earlier with risk factors). It can detect changes before they can be felt.\n- **Ultrasound**: Uses sound waves. Often used alongside mammograms, especially for dense breasts.\n- **Clinical Breast Exam (CBE)**: A physical exam by a healthcare provider.\n- **MRI**: Used for high-risk women. More sensitive but also more costly.\n\n**General guidelines:**\n- Ages 25–39: Clinical breast exam every 1–3 years\n- Ages 40+: Annual mammogram + clinical exam\n- High risk: Discuss enhanced screening with your doctor\n\nWould you like to schedule an appointment to discuss screening?",
  },
  {
    keywords: ['risk', 'score', 'result', 'what does', 'mean', 'explain', 'understand'],
    response:
      "**Understanding Your Risk Score:**\n\nOur assessment combines two components:\n- **Risk Factors (40%)**: Age, family history, lifestyle, hormonal factors\n- **Symptoms via BSE (60%)**: Self-reported changes in breast tissue\n\n**Risk Levels:**\n- 🟢 **Low (0–30)**: Standard monitoring. Continue routine screening.\n- 🟡 **Moderate (31–60)**: Some elevated factors. Clinical evaluation recommended.\n- 🔴 **High (61–100)**: Multiple concerning indicators. Please see a doctor promptly.\n\n**Important**: This is a screening tool for awareness, NOT a diagnosis. Only a medical professional can diagnose any condition.\n\nWould you like more details about any specific risk factor?",
  },
  {
    keywords: ['bse', 'self-exam', 'self exam', 'self-examination', 'check myself', 'how to check'],
    response:
      "**Breast Self-Examination (BSE) Guide:**\n\nBest done 3–5 days after your period starts:\n\n**Step 1 — Visual check** (in front of a mirror)\n- Arms at sides, then raised overhead\n- Look for changes in size, shape, skin texture, or nipple position\n\n**Step 2 — Manual exam** (lying down)\n- Use the pads of your 3 middle fingers\n- Move in small circles, covering the entire breast and armpit\n- Use light, medium, and firm pressure\n- Check both breasts\n\n**Step 3 — Standing/shower**\n- Repeat the circular motion while skin is wet (easier to feel)\n\n**What to report to a doctor:**\n- New lumps or thickening\n- Skin dimpling or puckering\n- Nipple discharge or inversion\n- Persistent pain\n\nRegular BSE increases your awareness of what's normal for you, making it easier to spot changes.",
  },
  {
    keywords: ['appointment', 'book', 'doctor', 'consult', 'visit', 'schedule'],
    response:
      'You can book an appointment through our **Appointment Scheduler**.\n\n**Available doctors:**\n- Dr. Rekha Menon — Breast health specialist\n- Dr. Sunita Patel — General practitioner\n\n**How to book:**\n1. Go to the Appointments section from the navigation bar\n2. Select a doctor and preferred date\n3. Choose an available time slot\n4. Confirm your booking\n\nWould you like me to direct you there?',
  },
  {
    keywords: ['family history', 'genetic', 'hereditary', 'brca', 'gene', 'inherited'],
    response:
      "**Family History & Genetic Risk:**\n\nHaving a first-degree relative (mother, sister, daughter) with breast cancer roughly doubles your risk. Multiple affected relatives increase it further.\n\n**BRCA1 and BRCA2 genes:**\n- Inherited mutations in these genes significantly increase breast cancer risk\n- Genetic testing is available and may be recommended if you have a strong family history\n- A genetic counselor can help you understand results and options\n\n**What you can do:**\n- Document your family history (both sides)\n- Share it with your doctor\n- Ask about genetic counseling if multiple relatives are affected\n- Consider enhanced screening (MRI + mammogram) if you're high-risk\n\nWould you like to learn more about genetic counseling?",
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'start', 'what can you do'],
    response:
      "Hello! I'm your breast health awareness support assistant. 💗\n\n**I can help you with:**\n- 📋 Understanding your risk assessment results\n- 🔍 Explaining medical terms and screening methods\n- 💬 Emotional support and coping strategies\n- 📅 Guiding you to book appointments\n- 📖 Breast self-examination (BSE) guidance\n- 👨‍👩‍👧 Understanding family history and genetic factors\n\nJust type your question and I'll do my best to help. What would you like to know?",
  },
];

const defaultResponse =
  "Thank you for reaching out. I want to make sure I give you the best guidance.\n\nHere are topics I can help with:\n- **Risk score explanation** — understanding your assessment results\n- **Breast self-exam (BSE)** — how to check yourself\n- **Screening methods** — mammograms, ultrasounds, etc.\n- **Emotional support** — coping with worry or anxiety\n- **Appointments** — booking a doctor consultation\n- **Family history** — understanding genetic risk factors\n\nCould you tell me more about what you'd like to know?";

export function getChatbotResponse(userMessage: string): BotResponse {
  const lower = userMessage.toLowerCase();

  // Find the best matching intent
  let bestMatch: (typeof intentPatterns)[0] | null = null;
  let bestScore = 0;

  for (const intent of intentPatterns) {
    const score = intent.keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = intent;
    }
  }

  const content = bestMatch ? bestMatch.response : defaultResponse;
  return { content: content + DISCLAIMER };
}
