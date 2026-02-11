import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a compassionate health support assistant for Sanghini, a breast health support platform.

Your role:
- Provide emotional support and encouragement
- Explain medical terms in simple, clear language
- Guide users on general wellness and self-care
- Be calm, empathetic, warm, and reassuring
- Keep responses concise (2-3 paragraphs maximum)

Critical safety rules:
- You CANNOT and MUST NOT diagnose any medical condition
- You CANNOT and MUST NOT recommend specific medications or treatments
- If asked for diagnosis or medication advice, politely decline and suggest consulting a healthcare professional
- Focus on emotional support, education, and guidance to appropriate care

Response style:
- Use simple, everyday language
- Be supportive without being medical
- Encourage professional consultation when appropriate
- Never include medical disclaimers in your responses
- Maintain a warm, caring tone`;

const UNSAFE_PATTERNS = [
  /diagnose|diagnosis/i,
  /prescribe|prescription|medication|medicine|drug/i,
  /cure|treatment plan/i,
  /what (disease|condition|illness) do i have/i,
];

function containsUnsafeRequest(message: string): boolean {
  return UNSAFE_PATTERNS.some(pattern => pattern.test(message));
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    const response = await result.response;
    return !!response.text();
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

export async function getChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  if (containsUnsafeRequest(userMessage)) {
    return "I appreciate your trust in me, but I'm not able to provide medical diagnoses or prescribe treatments. For medical advice specific to your situation, please consult with a qualified healthcare professional. I'm here to support you emotionally and help you understand general health information. How else can I help you today?";
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const recentHistory = conversationHistory.slice(-5);

    let prompt = SYSTEM_PROMPT + '\n\n';
    
    if (recentHistory.length > 0) {
      prompt += 'Recent conversation:\n';
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `User: ${userMessage}\n\nAssistant (respond with empathy and support):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    if (error?.message?.includes('API key')) {
      throw new Error('AI service configuration error');
    }
    throw new Error('Failed to get response from AI service');
  }
}
