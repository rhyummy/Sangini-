"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircleHeart, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidButton, GlassButton } from "@/components/ui/liquid-glass-button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ExpandableChatProps {
  onSendMessage: (message: string) => string;
  initialMessage?: string;
  quickPrompts?: string[];
  className?: string;
}

export function ExpandableChat({
  onSendMessage,
  initialMessage = "Hello! How can I support you today?",
  quickPrompts = [],
  className,
}: ExpandableChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: initialMessage,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = onSendMessage(trimmed);
      const botMsg: Message = {
        id: "b_" + Date.now(),
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn("fixed bottom-6 right-6 z-50", className)}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500 text-white shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/70 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm group"
            >
              <MessageCircleHeart className="h-7 w-7 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col",
              "bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-pink-200/60",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-200/50 bg-gradient-to-r from-pink-50/80 to-rose-50/80 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <MessageCircleHeart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-pink-900">
                    Support Chat
                  </h3>
                  <p className="text-xs text-pink-600 flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <GlassButton
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </GlassButton>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-br-md shadow-md"
                        : "bg-white/80 backdrop-blur-sm text-pink-900 border border-pink-100/50 rounded-bl-md shadow-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/80 backdrop-blur-sm border border-pink-100/50 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-pink-500">
                    <span className="flex items-center gap-1">
                      <span className="animate-bounce">●</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      >
                        ●
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        ●
                      </span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {quickPrompts.length > 0 && messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs bg-pink-100/60 text-pink-700 border border-pink-200/60 px-3 py-1.5 rounded-full hover:bg-pink-200/60 transition-all hover:scale-105"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-pink-200/50 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-b-3xl">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="flex-1 bg-white/60 backdrop-blur-sm border border-pink-200/60 rounded-2xl px-4 py-2.5 text-sm text-pink-900 placeholder:text-pink-400 focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 outline-none transition-all"
                />
                <LiquidButton
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </LiquidButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
