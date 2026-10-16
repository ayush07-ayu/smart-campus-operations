import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '../types/campus.ts';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentUserName: string;
  onNavigateTab: (tab: string) => void;
}

const QUICK_QUESTIONS = [
  'Which shifts are unfilled tomorrow?',
  'Which guards are available for the night shift?',
  'Which hostel complaints are overdue?',
  'Which buses have upcoming maintenance?',
  'Which department has the highest pending workload?',
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentUserName,
  onNavigateTab,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello ${currentUserName} (${currentRole}). I am your Smart Campus Operations AI Assistant. I can analyze real-time rosters, guard availability, pending maintenance, fleet services, and overdue grievances. Ask me anything or select a prompt below.`,
      source: 'System Briefing',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userRole: currentRole,
          userName: currentUserName,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        sender: 'assistant',
        text: data.answer || 'No response returned.',
        source: data.source || 'Campus Operations Intelligence',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error connecting to AI service: ${err.message}`,
          source: 'System Error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col text-left border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">
                Campus Operations AI Assistant
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Role Context: <span className="text-indigo-300 font-semibold">{currentRole}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Suggested Operational Queries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 border border-slate-200 rounded-md transition-colors text-[11px] text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 font-mono">
                {msg.sender === 'user' ? (
                  <>
                    <span>{currentUserName}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="text-indigo-600 font-semibold">{msg.source}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-sm whitespace-pre-wrap leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80 font-normal'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs italic p-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Analyzing live campus operational telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about shifts, guards, complaints, bus maintenance..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Answers are grounded in real server-side state with role authorization filters.
          </div>
        </div>
      </div>
    </div>
  );
};
