import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';

interface Message {
  id?: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export default function AiChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const gatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setLoading(true);

    const tempUserMsg: Message = { sender: 'user', text: userText };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await axios.post(`${gatewayUrl}/api/ai/chat`, {
        patientId: user?.id,
        text: userText
      });

      const aiMsg: Message = res.data;
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat failed", err);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "I have a headache and fever",
    "Feeling dizzy and nauseous",
    "Persistent cough for 3 days",
    "How can I improve my sleep quality?"
  ];

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen bg-gray-950">
        
        {/* Chat Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              
              {/* Welcome Screen */}
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition">
                    <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Hi {user?.name}, I'm your AI Health Assistant
                  </h1>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                    I can help you understand your symptoms and provide health guidance. How are you feeling today?
                  </p>

                  {/* Quick Prompts */}
                  <div className="max-w-3xl mx-auto">
                    <p className="text-sm font-semibold text-gray-400 mb-4">Try asking:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInput(prompt)}
                          className="bg-gray-900 border-2 border-gray-800 hover:border-purple-500 hover:bg-gray-800 text-gray-300 px-5 py-4 rounded-2xl text-left transition group shadow-lg"
                        >
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
</svg>
<span className="text-sm font-medium group-hover:text-purple-300">{prompt}</span>
</div>
</button>
))}
</div>
</div>
              {/* Disclaimer */}
              <div className="mt-12 max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-400 mb-1">Important Notice</p>
                    <p className="text-sm text-amber-300/80">This AI provides guidance only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-teal-500 to-blue-600' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  } shadow-lg`}>
                    {msg.sender === 'user' ? (
                      <span className="text-white font-semibold text-sm">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-6 py-4 rounded-3xl ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-tr-md' 
                        : 'bg-gray-800 text-gray-100 rounded-tl-md border border-gray-700'
                    } shadow-lg`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.timestamp && (
                      <p className="text-xs text-gray-600 mt-2 px-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-3xl">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-gray-800 px-6 py-4 rounded-3xl rounded-tl-md shadow-lg border border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message AI Health Assistant..."
              rows={1}
              className="w-full bg-gray-800 text-gray-100 px-6 py-4 pr-14 rounded-3xl border-2 border-gray-700 focus:border-purple-500 outline-none resize-none transition text-base placeholder-gray-500"
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-3 rounded-full transition transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          <p className="text-xs text-gray-600 text-center mt-3">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  </div>
</>
);
}