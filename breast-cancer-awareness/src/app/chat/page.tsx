'use client';

import { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '@/lib/chatbot-engine';
import { ChatMessage } from '@/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I'm your breast health awareness support assistant. 💗\n\n**I can help you with:**\n- 📋 Understanding your risk assessment results\n- 🔍 Explaining medical terms and screening methods\n- 💬 Emotional support and coping strategies\n- 📅 Guiding you to book appointments\n- 📖 Breast self-examination (BSE) guidance\n- 👨‍👩‍👧 Understanding family history and genetic factors\n\nJust type your question and I'll do my best to help. What would you like to know?\n\n*Disclaimer: I am an AI support assistant, not a medical professional. This information is educational only and does not constitute a diagnosis or medical advice. Always consult a qualified healthcare provider for medical concerns.*",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getChatbotResponse(trimmed);
      const botMsg: ChatMessage = {
        id: 'b_' + Date.now(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  }

  const quickPrompts = [
    'What does my risk score mean?',
    'How do I do a breast self-exam?',
    'I feel anxious about my results',
    'Tell me about mammograms',
    'How do I book an appointment?',
    'What about family history?',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          💬 Support Chat
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Online</span>
        </h1>
        <p className="text-sm text-gray-500">Emotional support, medical term explanations, and guidance. No diagnosis or treatment advice.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-pink-100 p-4 space-y-4 mb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-pink-600 text-white rounded-br-md'
                  : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium text-pink-600">🤖 BreastGuard Bot</span>
                </div>
              )}
              {renderMarkdown(msg.content)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => {
                  setInput(prompt);
                  const el = document.getElementById('chat-input') as HTMLInputElement;
                  if (el) el.focus();
                }, 50);
              }}
              className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type your question here..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Simple markdown-like rendering
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold
        const boldRegex = /\*\*(.*?)\*\*/g;
        const italicRegex = /\*(.*?)\*/g;

        let processed = line;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        // Process bold first
        const boldMatches: { start: number; end: number; text: string }[] = [];
        while ((match = boldRegex.exec(line)) !== null) {
          boldMatches.push({ start: match.index, end: match.index + match[0].length, text: match[1] });
        }

        if (boldMatches.length > 0) {
          boldMatches.forEach((m, idx) => {
            if (m.start > lastIndex) {
              parts.push(<span key={`t${i}_${idx}`}>{line.slice(lastIndex, m.start)}</span>);
            }
            parts.push(<strong key={`b${i}_${idx}`}>{m.text}</strong>);
            lastIndex = m.end;
          });
          if (lastIndex < line.length) {
            parts.push(<span key={`e${i}`}>{line.slice(lastIndex)}</span>);
          }
          return <p key={i}>{parts}</p>;
        }

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="pl-3">{line}</p>;
        }

        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
