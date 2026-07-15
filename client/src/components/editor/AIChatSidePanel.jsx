import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles, HiX, HiPaperAirplane, HiClipboardCopy,
  HiCheck, HiLightningBolt, HiDocumentSearch, HiAnnotation,
  HiPlusCircle, HiRefresh
} from 'react-icons/hi';
import { apiClient } from '../../lib/apiClient';

export default function AIChatSidePanel({ isOpen, onClose, onInsertText, currentDraft = '', currentTitle = '' }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: '🤖 **Welcome to your NexBlog AI Copilot!**\n\nI have live context of your current draft. You can ask me to rewrite sections, fact-check statements, generate hooks, or audit SEO right here without leaving your editor.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp }]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: `Draft Title: "${currentTitle}"\nDraft Content Preview: "${currentDraft.slice(0, 500)}..."\n\nUser Question/Instruction: ${userMessage}`,
        history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
      };

      const res = await apiClient.post('/api/ai/studio-chat', payload);
      if (res?.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: res.output,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: '⚠️ Processing error: Unable to synthesize response.', timestamp }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: `❌ Network connection error: ${err.message}`, timestamp }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    if (loading) return;
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let promptText = '';
    let actionTitle = '';
    if (actionType === 'seo') {
      actionTitle = '🔍 Running Real-Time SEO Audit...';
      promptText = `Perform a rapid 3-bullet SEO and heading hierarchy audit for this draft titled "${currentTitle}":\n\n${currentDraft.slice(0, 1000)}`;
    } else if (actionType === 'grammar') {
      actionTitle = '✨ Running Active Voice & Grammar Shield...';
      promptText = `Identify any passive voice phrasing or redundancy in this draft and provide 3 punchy improvements:\n\n${currentDraft.slice(0, 1000)}`;
    } else if (actionType === 'hooks') {
      actionTitle = '⚡ Generating Viral Intro Hooks...';
      promptText = `Generate 4 high-converting, viral opening lines or hooks for this article titled "${currentTitle}"`;
    }

    setMessages(prev => [...prev, { role: 'user', text: actionTitle, timestamp }]);

    try {
      const res = await apiClient.post('/api/ai/studio-chat', { message: promptText });
      if (res?.success) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: res.output, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `❌ Quick action failed: ${err.message}`, timestamp }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Slide-out Drawer */}
          <motion.aside
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] lg:w-[460px] glass dark:glass-dark border-l border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-glow-sm">
                  <HiSparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>AI Copilot Drawer</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Injected with your saved Creator Memory Invariants
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-all"
                aria-label="Close AI Copilot"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 mr-1">Quick Actions:</span>
              <button
                onClick={() => handleQuickAction('seo')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-primary-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0 transition-all shadow-2xs"
              >
                <HiDocumentSearch className="w-3.5 h-3.5 text-blue-500" />
                <span>SEO Audit</span>
              </button>
              <button
                onClick={() => handleQuickAction('grammar')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-primary-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0 transition-all shadow-2xs"
              >
                <HiAnnotation className="w-3.5 h-3.5 text-purple-500" />
                <span>Grammar Check</span>
              </button>
              <button
                onClick={() => handleQuickAction('hooks')}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-primary-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0 transition-all shadow-2xs"
              >
                <HiLightningBolt className="w-3.5 h-3.5 text-amber-500" />
                <span>Viral Hooks</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-sm bg-slate-50/30 dark:bg-slate-950/30">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {m.role === 'user' ? 'You' : 'NexBlog AI Copilot'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[92%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'gradient-brand text-white rounded-tr-none shadow-sm font-medium'
                        : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/70 dark:border-slate-700/80 shadow-card'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* AI Output Action Buttons (Copy / Insert into Editor) */}
                  {m.role === 'ai' && idx > 0 && (
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <button
                        onClick={() => handleCopy(m.text, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                      >
                        {copiedIndex === idx ? <HiCheck className="w-3 h-3 text-emerald-500" /> : <HiClipboardCopy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onInsertText && (
                        <button
                          onClick={() => onInsertText(m.text)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-[11px] font-bold text-primary-600 dark:text-primary-400 border border-primary-500/30 transition-all"
                        >
                          <HiPlusCircle className="w-3.5 h-3.5" />
                          <span>Insert into Editor</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start animate-fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">NexBlog AI Copilot</span>
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-mono flex items-center gap-3 shadow-card">
                    <HiRefresh className="w-4 h-4 animate-spin text-primary-500" />
                    <span>Analyzing context and synthesizing telemetry response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Bar */}
            <div className="p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for editorial advice, fact verification, rewrite..."
                  disabled={loading}
                  className="input-glass flex-1 rounded-xl px-4 py-3 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="btn-primary p-3 rounded-xl shadow-glow-sm disabled:opacity-40 transition-all flex items-center justify-center"
                  aria-label="Send Message"
                >
                  <HiPaperAirplane className="w-5 h-5 rotate-90" />
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
