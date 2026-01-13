import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';

interface Message {
  id?: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export default function AiChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Auto-scroll to bottom
  const bottomRef = useRef<HTMLDivElement>(null);

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // 1. Fetch Chat History on Load
  useEffect(() => {
    if (!user) return;
    
    axios.get(`${gatewayUrl}/api/ai/history/${user.id}`)
      .then(res => {
        if (res.data && res.data.messages) {
          setMessages(res.data.messages);
        }
      })
      .catch(err => console.error("Failed to load chat", err));

  }, [user]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // Clear input immediately
    setLoading(true);

    // Optimistically update UI
    const tempUserMsg: Message = { sender: 'user', text: userText };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Send to AI Service
      const res = await axios.post(`${gatewayUrl}/api/ai/chat`, {
        patientId: user?.id,
        text: userText
      });

      // Add AI Response to UI
      const aiMsg: Message = res.data;
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("Chat failed", err);
      // Show error message in chat
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick prompts for common queries
  const quickPrompts = [
    "I have a headache and fever",
    "Feeling dizzy and nauseous",
    "Persistent cough for 3 days",
    "Chest pain and shortness of breath"
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <Header />
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">AI Health Assistant</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online • Powered by Gemini Pro
              </p>
            </div>
          </div>
          {/* <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button> */}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl">🤖</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Hello, {user?.name}! 👋
              </h2>
              <p className="text-gray-600 text-lg mb-2">
                I'm your AI health assistant, here to help with symptoms and medical questions.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  For guidance only - Not a replacement for professional medical advice
                </span>
              </p>

              {/* Quick Prompts */}
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-gray-700 mb-3">Try asking about:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700 px-4 py-3 rounded-xl text-sm text-left transition-all group"
                    >
                      <span className="block font-medium group-hover:text-purple-700">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-teal-600' 
                    : 'bg-gradient-to-br from-purple-600 to-indigo-600'
                } shadow-md`}>
                  <span className="text-lg">
                    {msg.sender === 'user' ? user?.name.charAt(0).toUpperCase() : '🤖'}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.timestamp && (
                    <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="bg-white text-gray-800 px-5 py-3 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="ml-2 text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe your symptoms or ask a health question..."
                rows={1}
                className="w-full bg-gray-50 text-gray-900 px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:bg-white focus:outline-none resize-none transition"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 bottom-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Press Enter to send
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}