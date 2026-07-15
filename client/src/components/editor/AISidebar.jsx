import React, { useState } from 'react';
import {
  HiSparkles, HiLightningBolt,
  HiTag, HiDocumentText, HiRefresh, HiCheck, HiOutlinePencilAlt
} from 'react-icons/hi';
import { apiClient } from '../../lib/apiClient';

const TONES = ['Professional', 'Executive', 'Technical', 'Conversational', 'Academic', 'Viral / Bold'];

export default function AISidebar({ content = '', title = '', onApplyContent, onApplyMeta }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [selectedTone, setSelectedTone] = useState('Executive');
  const [statusMsg, setStatusMsg] = useState(null);

  const triggerAI = async (actionId, endpoint, payload) => {
    setLoadingAction(actionId);
    setStatusMsg(null);
    try {
      const res = await apiClient.post(endpoint, payload);
      if (res && res.success) {
        if (actionId === 'rewrite' || actionId === 'grammar' || actionId === 'continue' || actionId === 'expand') {
          // If rewrite/grammar, we pass back the revised output
          const newHtml = res.output.includes('<p>') ? res.output : `<p>${res.output.replace(/\n\n/g, '</p><p>')}</p>`;
          if (onApplyContent) onApplyContent(newHtml, actionId === 'continue');
        } else if (actionId === 'seo-meta' && onApplyMeta) {
          onApplyMeta(res.seoTitle, res.metaDescription);
        } else if (actionId === 'tags' && onApplyMeta) {
          onApplyMeta(null, null, res.tags);
        }
        setStatusMsg({ type: 'success', text: `${actionId.toUpperCase()} completed successfully!` });
      } else {
        setStatusMsg({ type: 'error', text: res?.message || 'Action failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'AI engine error.' });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
  const plainText = stripHtml(content);

  const actions = [
    {
      id: 'grammar',
      label: 'Grammar & Syntax Shield',
      icon: HiLightningBolt,
      desc: 'Fix active voice and grammatical issues',
      run: () => triggerAI('grammar', '/api/ai/improve-grammar', { content: plainText || title }),
    },
    {
      id: 'rewrite',
      label: `Rewrite in ${selectedTone} Tone`,
      icon: HiOutlinePencilAlt,
      desc: `Transform structure into ${selectedTone} style`,
      run: () => triggerAI('rewrite', '/api/ai/rewrite-copy', { content: plainText || title, tone: selectedTone }),
    },
    {
      id: 'continue',
      label: 'Continue Writing Deep-Dive',
      icon: HiSparkles,
      desc: 'Autonomous completion from last paragraph',
      run: () => triggerAI('continue', '/api/ai/expand-section', { content: plainText.slice(-300) || title }),
    },
    {
      id: 'seo-meta',
      label: 'Generate SEO Title & Meta',
      icon: HiDocumentText,
      desc: 'Optimize SERP title and description',
      run: () => triggerAI('seo-meta', '/api/ai/generate-meta', { topic: title || 'Flagship Article', content: plainText }),
    },
    {
      id: 'tags',
      label: 'Generate Viral Taxonomy Tags',
      icon: HiTag,
      desc: 'Extract LSI keywords and hashtags',
      run: () => triggerAI('tags', '/api/ai/generate-tags', { topic: title, content: plainText }),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Copilot Palette Header */}
      <div className="glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-brand rounded-xl flex items-center justify-center shadow-glow-sm">
              <HiSparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">AI Studio Copilot</h3>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Live & Ready</p>
            </div>
          </div>
        </div>

        {/* Tone Selector Dropdown */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <label htmlFor="ai-sidebar-tone-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Target Voice Profile
          </label>
          <select
            id="ai-sidebar-tone-select"
            aria-label="Target Tone"
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="input-glass w-full rounded-xl py-2 px-3 text-xs font-semibold"
          >
            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Action Buttons List */}
        <div className="space-y-2 pt-1">
          {actions.map(({ id, label, icon: Icon, desc, run }) => {
            const isRunning = loadingAction === id;
            return (
              <button
                key={id}
                type="button"
                onClick={run}
                disabled={!!loadingAction}
                className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-xl text-left border transition-all ${
                  isRunning
                    ? 'gradient-brand text-white border-transparent shadow-glow-sm scale-[1.02]'
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50'
                }`}
              >
                {isRunning ? (
                  <HiRefresh className="w-4 h-4 flex-shrink-0 animate-spin text-white mt-0.5" />
                ) : (
                  <Icon className="w-4 h-4 flex-shrink-0 text-primary-500 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs leading-tight mb-0.5 truncate">{label}</p>
                  <p className={`text-[10px] leading-snug ${isRunning ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' : 'bg-red-500/10 text-red-600 border border-red-500/30'
          }`}>
            {statusMsg.type === 'success' ? <HiCheck className="w-4 h-4 flex-shrink-0" /> : <span>⚠️</span>}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Flagship Writing Tips Box */}
      <div className="glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
        <h4 className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <span>🎯</span> Flagship Editorial Standard
        </h4>
        <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
            <span>Target 1,200+ words for deep SERP authority</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Maintain active voice ratio &gt; 95%</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 flex-shrink-0" />
            <span>Use H2 & H3 tags to partition semantic concepts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
