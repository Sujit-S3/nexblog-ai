import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles, HiCode, HiViewBoards, HiQuestionMarkCircle,
  HiLightningBolt, HiAnnotation, HiPlusCircle, HiX
} from 'react-icons/hi';
import { apiClient } from '../../lib/apiClient';

export default function SlashCommandMenu({ isOpen, onClose, onInsertHtml, topic = 'Flagship Architecture' }) {
  const [loadingCommand, setLoadingCommand] = useState(null);

  if (!isOpen) return null;

  const triggerCommandAI = async (cmdId, endpoint, payload) => {
    setLoadingCommand(cmdId);
    try {
      const res = await apiClient.post(endpoint, payload);
      if (res && res.success && onInsertHtml) {
        // Convert markdown / plaintext to clean HTML for ReactQuill
        const formatted = res.output.includes('<') ? res.output : `<p>${res.output.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
        onInsertHtml(formatted);
        onClose();
      }
    } catch (err) {
      console.error('Slash command error:', err.message);
    } finally {
      setLoadingCommand(null);
    }
  };

  const commands = [
    {
      id: 'ai-draft',
      label: 'AI Draft Section',
      icon: HiSparkles,
      desc: 'Synthesize a deep-dive technical section on your topic',
      run: () => triggerCommandAI('ai-draft', '/api/ai/expand-section', { content: topic }),
    },
    {
      id: 'cta-box',
      label: 'Call to Action (CTA) Block',
      icon: HiLightningBolt,
      desc: 'Insert a high-converting signup / workspace prompt',
      run: () => triggerCommandAI('cta-box', '/api/ai/generate-cta', { topic }),
    },
    {
      id: 'pros-cons',
      label: 'Pros & Cons Evaluation Table',
      icon: HiViewBoards,
      desc: 'Insert a balanced comparative breakdown',
      run: () => triggerCommandAI('pros-cons', '/api/ai/generate-pros-cons', { topic }),
    },
    {
      id: 'code-snippet',
      label: 'Technical Code Example',
      icon: HiCode,
      desc: 'Insert a well-commented JavaScript production snippet',
      run: () => triggerCommandAI('code-snippet', '/api/ai/generate-code-snippet', { topic, language: 'javascript' }),
    },
    {
      id: 'faq-section',
      label: 'FAQ Accordion Block',
      icon: HiQuestionMarkCircle,
      desc: 'Generate 3-4 authoritative Q&As answering reader queries',
      run: () => triggerCommandAI('faq-section', '/api/ai/generate-faq', { topic }),
    },
    {
      id: 'takeaways',
      label: 'Key Takeaways Highlight Box',
      icon: HiAnnotation,
      desc: 'Insert a styled executive summary quote block',
      run: () => {
        const html = `<blockquote class="nexblog-takeaway-box" style="border-left: 4px solid #3b82f6; padding: 16px; background: rgba(59, 130, 246, 0.08); border-radius: 8px; margin: 16px 0;"><strong>⚡ Executive Takeaways:</strong><br/>• High-speed architecture guarantees &lt;12ms latency across edge nodes.<br/>• Liquid Glass interfaces increase reader retention by 42%.<br/>• Always verify entity density before publishing.</blockquote><p><br/></p>`;
        onInsertHtml(html);
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-sm">
                <HiPlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Notion AI Slash Commands</h3>
                <p className="text-[11px] text-slate-500 font-medium">Click any command to insert instantly into your article</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Commands List */}
          <div className="p-4 max-h-[420px] overflow-y-auto space-y-2">
            {commands.map(({ id, label, icon: Icon, desc, run }) => {
              const isRunning = loadingCommand === id;
              return (
                <button
                  key={id}
                  onClick={run}
                  disabled={!!loadingCommand}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left border transition-all ${
                    isRunning
                      ? 'gradient-brand text-white border-transparent shadow-glow'
                      : 'bg-white/70 dark:bg-slate-800/70 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isRunning ? 'bg-white/20 text-white' : 'bg-primary-500/10 text-primary-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-sm truncate">{label}</p>
                    <p className={`text-xs ${isRunning ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{desc}</p>
                  </div>
                  {isRunning && <span className="text-xs font-mono font-bold animate-pulse">Running...</span>}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Tip: You can also use AI Studio Copilot on the right panel</span>
            <span className="font-mono text-xs">ESC to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
