import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function AIMentor() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello, Explorer! I'm your Questoria Mentor. Need help with a quest or want to learn a new concept? Just ask!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a friendly and encouraging AI mentor in a gamified learning platform called Questoria. Your goal is to help undergraduate students learn technical skills like coding, AI, and logic. Keep your tone game-like, using terms like "quests", "XP", "level up", and "explorers". Be concise and helpful. User says: ${userMessage}` }] }
        ],
        config: {
          systemInstruction: "You are the Questoria Mentor, a wise and futuristic guide."
        }
      });

      const botMessage = response.text || "I'm having trouble connecting to the Questoria network. Try again later!";
      setMessages(prev => [...prev, { role: 'bot', content: botMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "The cosmic signals are weak right now. Let's try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
      <header className="px-6 py-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Bot size={24} className="text-slate-950" />
          </div>
          <div>
            <div className="text-white font-black text-sm uppercase tracking-widest">AI Mentor</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase">Online</span>
            </div>
          </div>
        </div>
        <Sparkles size={20} className="text-cyan-400" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-purple-600" : "bg-cyan-600"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-purple-600/20 border border-purple-500/30 text-purple-50" 
                : "bg-slate-900/80 border border-white/5 text-slate-100"
            )}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-900/80 border border-white/5 p-4 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="p-4 bg-slate-950/80 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your mentor anything..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
