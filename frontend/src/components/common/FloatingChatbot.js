import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';

const QUICK_PROMPTS = [
  'How do I raise a request?',
  'Check payment status',
  'Register a visitor',
  'Society rules',
];

export default function FloatingChatbot() {
  const { user }                    = useAuth();
  const [open, setOpen]             = useState(false);
  const [messages, setMessages]     = useState([
    { role: 'bot', text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your SocietyCare assistant. How can I help you today?` },
  ]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const bottomRef                   = useRef(null);
  const inputRef                    = useRef(null);

  useEffect(() => {
    if (open) { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus(); }
  }, [open, messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chatbotAPI.chat(msg);
      setMessages((m) => [...m, { role: 'bot', text: res.data.reply || res.data.message || 'I\'m here to help!' }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I couldn\'t process that right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="gradient-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FiMessageCircle className="text-white text-sm" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">SocietyCare Assistant</p>
                <p className="text-blue-200 text-xs">Powered by AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white opacity-70 hover:opacity-100 transition p-1">
              <FiMinimize2 />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: 300 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-card'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex flex-wrap gap-1">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-700 px-2.5 py-1 rounded-full transition">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              ref={inputRef}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask me anything…"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300 transition"
            />
            <button onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition disabled:opacity-40 flex-shrink-0">
              <FiSend className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button onClick={() => setOpen(!open)} className="chatbot-fab" title="Chat with AI Assistant">
        {open ? <FiX className="text-xl" /> : <FiMessageCircle className="text-xl" />}
      </button>
    </>
  );
}
