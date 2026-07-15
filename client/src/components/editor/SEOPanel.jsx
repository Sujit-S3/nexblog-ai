import React, { useState, useEffect } from 'react';
import { HiDocumentSearch, HiCheckCircle, HiExclamationCircle, HiSparkles, HiRefresh } from 'react-icons/hi';
import { apiClient } from '../../lib/apiClient';

export default function SEOPanel({ content = '', title = '', keywords = '', onOptimizeTitleMeta }) {
  const [scoreData, setScoreData] = useState({ score: 75, suggestions: [] });
  const [analyzing, setAnalyzing] = useState(false);

  const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
  const plainText = stripHtml(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    // Calculate local real-time heuristics
    let s = 65;
    const checks = [];

    if (title.length >= 15 && title.length <= 65) {
      s += 10;
      checks.push({ status: 'pass', text: 'SERP Title length is optimal (15-65 chars).' });
    } else {
      checks.push({ status: 'warn', text: `Title is ${title.length || 0} chars. Aim for 15-65.` });
    }

    if (wordCount >= 800) {
      s += 15;
      checks.push({ status: 'pass', text: `Comprehensive depth achieved (${wordCount} words).` });
    } else if (wordCount >= 300) {
      s += 8;
      checks.push({ status: 'warn', text: `Moderate length (${wordCount} words). 800+ recommended.` });
    } else {
      checks.push({ status: 'warn', text: `Short draft (${wordCount} words). Expand for better ranking.` });
    }

    const hasH2 = content.includes('<h2') || content.includes('## ');
    if (hasH2) {
      s += 10;
      checks.push({ status: 'pass', text: 'Semantic H2 heading structure verified.' });
    } else {
      checks.push({ status: 'warn', text: 'Add at least one H2 heading to organize content.' });
    }

    setScoreData({ score: Math.min(100, s), suggestions: checks });
  }, [content, title, wordCount]);

  const handleDeepAudit = async () => {
    setAnalyzing(true);
    try {
      const res = await apiClient.post('/api/ai/score-seo', {
        content: plainText,
        title,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      });
      if (res && res.success) {
        const extraSuggestions = (res.analysis?.suggestions || []).map(s => ({ status: 'warn', text: s }));
        setScoreData(prev => ({
          score: res.score || prev.score,
          suggestions: [...prev.suggestions, ...extraSuggestions],
        }));
      }
    } catch (err) {
      console.error('Deep audit failed:', err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (sc) => {
    if (sc >= 90) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (sc >= 75) return 'text-primary-500 border-primary-500/30 bg-primary-500/10';
    return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-5 space-y-4">
      {/* Header & Gauge */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <HiDocumentSearch className="w-5 h-5 text-primary-500" />
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Real-Time SEO Audit</h3>
        </div>
        <span className={`px-3 py-1 rounded-full font-mono font-extrabold text-sm border ${getScoreColor(scoreData.score)}`}>
          {scoreData.score} / 100
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
          <span>Optimization Progress</span>
          <span>{scoreData.score >= 90 ? 'SERP Dominant' : scoreData.score >= 75 ? 'Competitive' : 'Needs Polish'}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              scoreData.score >= 90 ? 'bg-emerald-500' : scoreData.score >= 75 ? 'gradient-brand' : 'bg-amber-500'
            }`}
            style={{ width: `${scoreData.score}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {scoreData.suggestions.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            {item.status === 'pass' ? (
              <HiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <HiExclamationCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <button
          type="button"
          onClick={handleDeepAudit}
          disabled={analyzing}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <HiRefresh className="w-4 h-4 animate-spin text-primary-500" />
              <span>Running Deep Neural Audit...</span>
            </>
          ) : (
            <>
              <HiDocumentSearch className="w-4 h-4 text-primary-500" />
              <span>Run Deep Semantic Audit</span>
            </>
          )}
        </button>

        {onOptimizeTitleMeta && (
          <button
            type="button"
            onClick={onOptimizeTitleMeta}
            className="w-full py-2.5 px-3 rounded-xl gradient-brand text-white text-xs font-bold shadow-glow-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <HiSparkles className="w-4 h-4" />
            <span>AI Auto-Optimize Title & Meta</span>
          </button>
        )}
      </div>
    </div>
  );
}
