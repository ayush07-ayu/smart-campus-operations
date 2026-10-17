import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Bot, User as UserIcon, RefreshCw, 
  Terminal, CheckCircle2, ChevronRight, HelpCircle, 
  DoorOpen, Users, Calendar, MessageSquareWarning, 
  Briefcase, CreditCard
} from 'lucide-react';
import { User } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionExecuted?: {
    name: string;
    args: any;
    result: any;
  };
  timestamp: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onNavigateToModule?: (moduleKey: string) => void;
}

const QUICK_PROMPTS = [
  'Which computer lab is free at 2 PM?',
  'Show my classes for today',
  'Find an eligible substitute for Dr. Amit Verma',
  'What is the status of complaint MMU-GRV-2026-1042?',
  'Show upcoming placement drives for MCA',
  'When can MCA students collect their student ID cards?'
];

export const AiAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToModule
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello ${currentUser.name}! I am your MMU Smart Campus Operations Assistant. I can look up live room/lab availability, check your timetable, find conflict-free faculty substitutes, track grievance tickets, or check placement drives. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: history
        })
      });

      const data = await res.json();
      const assistantMessage: Message = {
        id: 'msg_res_' + Date.now(),
        role: 'assistant',
        content: data.reply || 'Request executed.',
        actionExecuted: data.actionExecuted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: 'I encountered an error communicating with the campus backend. Please check connectivity or try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl h-[90vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  MMU Smart Campus Assistant
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Connected to MMU Database • Authenticated for: <strong>{currentUser.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-blue-700 shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Render visual tool execution output */}
                {msg.actionExecuted && (
                  <div className="p-3 rounded-lg bg-white border border-blue-200 text-[11px] text-slate-700 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-blue-800 font-bold text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        <span>Action: {msg.actionExecuted.name}</span>
                      </span>
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>System Verified</span>
                      </span>
                    </div>

                    {msg.actionExecuted.name === 'getAvailableRooms' && msg.actionExecuted.result?.availableRooms && (
                      <div className="mt-2 space-y-1">
                        <span className="font-semibold text-slate-800">
                          {msg.actionExecuted.result.totalAvailable} Rooms Available on {msg.actionExecuted.result.day} at {msg.actionExecuted.result.time}:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {msg.actionExecuted.result.availableRooms.slice(0, 4).map((r: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-50 text-[10px] border border-slate-200">
                              <span className="font-bold text-slate-900 block">{r.code}</span>
                              <span className="text-slate-500 text-[9px] truncate block">{r.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.actionExecuted.name === 'findSubstitutes' && msg.actionExecuted.result?.recommendedSubstitutes && (
                      <div className="mt-2 space-y-1">
                        <span className="font-semibold text-slate-800">
                          Recommended Substitute Candidates:
                        </span>
                        <div className="space-y-1 pt-1">
                          {msg.actionExecuted.result.recommendedSubstitutes.slice(0, 3).map((sub: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-50 text-[10px] border border-slate-200 flex justify-between">
                              <span className="font-semibold text-slate-900">{sub.facultyName}</span>
                              <span className="text-emerald-700 font-bold">{sub.matchScore}% Score</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.actionExecuted.name === 'getPlacementDrives' && msg.actionExecuted.result?.upcomingDrives && (
                      <div className="mt-2 space-y-1">
                        <span className="font-semibold text-slate-800">
                          Upcoming Recruitment Drives:
                        </span>
                        <div className="space-y-1 pt-1">
                          {msg.actionExecuted.result.upcomingDrives.map((d: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-50 text-[10px] border border-slate-200 flex justify-between">
                              <div>
                                <strong className="text-slate-900 block">{d.company}</strong>
                                <span className="text-slate-500 text-[9px]">{d.date} • {d.venue}</span>
                              </div>
                              <span className="text-blue-800 font-bold">{d.package}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                <span>Executing campus tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">
            Suggested:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input form */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything or request an action (e.g. check labs, timetable, substitutes, complaints)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
