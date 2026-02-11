import { NextRequest, NextResponse } from 'next/server';
import { getChatbotResponse } from '@/lib/chatbot-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message field' }, { status: 400 });
    }

    const response = getChatbotResponse(message);

    return NextResponse.json({
      success: true,
      response: response.content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
