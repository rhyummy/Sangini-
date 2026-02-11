'use client';

import { getChatbotResponse } from '@/lib/chatbot-engine';
import { ExpandableChat } from '@/components/chat/support-chat';

export default function ChatPage() {
  const handleSendMessage = (message: string): string => {
    const response = getChatbotResponse(message);
    return response.content;
  };

  const quickPrompts = [
    'What does my risk score mean?',
    'How do I do a breast self-exam?',
    'Tell me about mammograms',
    'How do I book an appointment?',
  ];

  return (
    <div className="relative min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-pink-900 mb-4">
          💬 Support Chat
        </h1>
        <p className="text-lg text-pink-600 max-w-2xl mx-auto">
          Get emotional support, understand medical terms, and find guidance. 
          Click the chat button to start a conversation with our support assistant.
        </p>
        
        <div className="mt-12 bg-white/40 backdrop-blur-lg rounded-3xl border border-pink-200/50 p-12 shadow-xl">
          <div className="space-y-6">
            <div className="text-6xl mb-4">💗</div>
            <h2 className="text-2xl font-semibold text-pink-900">
              How can we support you today?
            </h2>
            <p className="text-pink-700 max-w-md mx-auto">
              Our AI assistant is here to help with questions about breast health, 
              risk assessments, screening methods, and emotional support.
            </p>
            <div className="pt-4">
              <p className="text-sm text-pink-500">
                Click the chat button in the bottom right to get started →
              </p>
            </div>
          </div>
        </div>
      </div>

      <ExpandableChat
        onSendMessage={handleSendMessage}
        initialMessage="Hello! 💗 How can I support you today? I'm here to help with questions about breast health awareness, risk assessments, and emotional support."
        quickPrompts={quickPrompts}
      />
    </div>
  );
}
