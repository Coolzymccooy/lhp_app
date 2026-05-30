import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import api from '../../api/client';
import { Link } from 'react-router-dom';

interface Message {
  role: 'bot' | 'user';
  text: string;
  url?: string | null;
}

const SUGGESTED = [
  'When are your services?',
  'Where are you located?',
  'How do I join the church?',
  'Do you offer counselling?',
  'How can I give online?',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I\'m Lighthouse AI. Ask me anything about our church — services, location, ministries, prayer, and more!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Allow other parts of the site (e.g. the "AI Copilot" quick-resource card) to open the chat.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('lhp:open-ai', handler);
    return () => window.removeEventListener('lhp:open-ai', handler);
  }, []);

  async function send(text?: string) {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { query });
      setMessages(m => [...m, { role: 'bot', text: data.answer, url: data.url }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Sorry, I\'m having trouble right now. Please try again or contact us directly.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-brand rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open AI chat"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat panel */}
      <div className={`fixed bottom-24 right-6 z-50 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ width: 'calc(100vw - 3rem)', maxWidth: '24rem', maxHeight: '75vh' }}>
        {/* Header */}
        <div className="bg-gradient-brand px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Lighthouse AI</div>
            <div className="text-white/70 text-xs">Church information assistant</div>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors" aria-label="Close chat">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'bot' ? 'bg-gradient-brand' : 'bg-gray-200'}`}>
                {m.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'bot' ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-gradient-brand text-white rounded-tr-none'}`}>
                {m.text}
                {m.url && (
                  <Link to={m.url} className="block mt-2 text-xs text-primary underline font-medium" onClick={() => setOpen(false)}>
                    View more →
                  </Link>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested (only show at start) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1">
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs bg-gray-100 hover:bg-pink-50 hover:text-primary text-gray-600 px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-pink-200">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about our church..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 hover:bg-pink-700 transition-colors flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
