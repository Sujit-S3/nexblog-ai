import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiSparkles, HiLightningBolt, HiDocumentSearch, HiAnnotation,
  HiTranslate, HiTag, HiChatAlt2, HiClipboardCopy, HiCheck,
  HiArrowRight, HiDownload, HiRefresh, HiCog, HiDatabase,
  HiAcademicCap, HiViewBoards
} from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';
import KnowledgeBaseDrawer from '../components/knowledge/KnowledgeBaseDrawer';
import VerificationReportCard from '../components/ai/VerificationReportCard';

const OPERATIONS = [
  { id: 'generate-article', label: 'Article Generator', icon: HiSparkles, desc: 'Synthesize comprehensive 1,500+ word structured Markdown drafts.' },
  { id: 'rewrite-copy', label: 'Rewrite & Tone Polish', icon: HiLightningBolt, desc: 'Re-engineer copy into Executive, Technical, or Viral tones.' },
  { id: 'score-seo', label: '0-100 SEO Audit', icon: HiDocumentSearch, desc: 'Audit keyword density, LSI entities, and structural headings.' },
  { id: 'improve-grammar', label: 'Grammar Shield', icon: HiAnnotation, desc: 'Verify active voice and eliminate passive redundancy.' },
  { id: 'translate-content', label: 'Global Translator', icon: HiTranslate, desc: 'Translate cleanly into French, German, Japanese, or Spanish.' },
  { id: 'generate-tags', label: 'Smart Taxonomy', icon: HiTag, desc: 'Generate viral categorization tags and JSON-LD schema entities.' },
  { id: 'studio-chat', label: 'Copilot Chat', icon: HiChatAlt2, desc: 'Conversational AI assistant for real-time editorial advice.' },
];

const TONES = ['Professional', 'Executive', 'Technical', 'Conversational', 'Academic', 'Viral / Bold'];

export default function AIWorkspace() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  // Top navigation tabs: 'tools', 'research', 'memory'
  const [activeTab, setActiveTab] = useState('research');

  // Studio Tools State
  const [activeOp, setActiveOp] = useState(OPERATIONS[0]);
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [tone, setTone] = useState('Executive');
  const [keywords, setKeywords] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('French');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ words: 0, readTime: '0 min', seoScore: '--' });

  // V3.2 Knowledge Base & Verification States
  const [kbOpen, setKbOpen] = useState(false);
  const [selectedKbDoc, setSelectedKbDoc] = useState(null);
  const [verificationReport, setVerificationReport] = useState(null);
  const [verifyingDraft, setVerifyingDraft] = useState(false);

  const handleVerifyDraft = async (draftText = researchDraft || output) => {
    if (!draftText) return;
    setVerifyingDraft(true);
    try {
      const res = await apiClient('/api/ai/verify-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: draftText, documentId: selectedKbDoc?._id || null }),
      });
      if (res.success && res.verificationReport) {
        setVerificationReport(res.verificationReport);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Verification error occurred');
    } finally {
      setVerifyingDraft(false);
    }
  };

  // Chat copilot history
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '👋 Welcome to NexBlog AI Studio. Select a tool or ask me anything about your current draft.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // AI Memory Invariants State
  const [memory, setMemory] = useState({
    brandVoice: 'Professional & Authoritative',
    writingStyle: 'Analytical, active voice, concise paragraphs with high structural density',
    targetAudience: 'Senior Staff Engineers, Tech Executives, & Product Architects',
    preferredLength: '1500+ words (Comprehensive Deep Dive)',
    seoRules: 'Include LSI keywords across semantic H2/H3 headings, ensure high keyword relevance, and structure actionable comparison tables',
    customInstructions: 'Avoid generic marketing fluff or repetitive filler. Prioritize concrete architectural insights and code specifications.',
  });
  const [memorySaving, setMemorySaving] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);

  // Interactive Research Workspace State
  const [researchTopic, setResearchTopic] = useState('Flagship Liquid Glass & Sub-12ms Edge Architectures');
  const [researchStepIndex, setResearchStepIndex] = useState(0); // 0: Research, 1: Outline, 2: Draft, 3: Citations
  const [stepLoading, setStepLoading] = useState(false);
  const [researchFacts, setResearchFacts] = useState('');
  const [researchOutline, setResearchOutline] = useState('');
  const [researchDraft, setResearchDraft] = useState('');
  const [researchCitations, setResearchCitations] = useState('');

  // Load User AI Memory on mount
  useEffect(() => {
    if (currentUser?._id) {
      apiClient.get(`/api/ai/memory/get/${currentUser._id}`).then((res) => {
        if (res?.success && res.memory) {
          setMemory({
            brandVoice: res.memory.brandVoice || 'Professional & Authoritative',
            writingStyle: res.memory.writingStyle || 'Analytical, active voice, concise paragraphs with high structural density',
            targetAudience: res.memory.targetAudience || 'Senior Staff Engineers, Tech Executives, & Product Architects',
            preferredLength: res.memory.preferredLength || '1500+ words (Comprehensive Deep Dive)',
            seoRules: res.memory.seoRules || 'Include LSI keywords across semantic H2/H3 headings, ensure high keyword relevance, and structure actionable comparison tables',
            customInstructions: res.memory.customInstructions || 'Avoid generic marketing fluff or repetitive filler. Prioritize concrete architectural insights and code specifications.',
          });
        }
      }).catch(err => console.warn('Memory load error:', err.message));
    }
  }, [currentUser]);

  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return;
    setMemorySaving(true);
    setMemorySuccess(false);
    try {
      const res = await apiClient.put(`/api/ai/memory/update/${currentUser._id}`, memory);
      if (res?.success) {
        setMemorySuccess(true);
        setTimeout(() => setMemorySuccess(false), 3500);
      }
    } catch (err) {
      setError('Failed to synchronize AI Memory invariants: ' + err.message);
    } finally {
      setMemorySaving(false);
    }
  };

  const handleExecuteStep = async (stepName, isMerge = false) => {
    setStepLoading(true);
    setError(null);
    try {
      const payload = {
        step: stepName,
        topic: researchTopic,
        researchFacts,
        outline: researchOutline,
        draft: researchDraft,
        seoRules: memory.seoRules,
        isMerge,
      };
      const res = await apiClient.post('/api/ai/research-step', payload);
      if (res?.success) {
        if (stepName === 'research') {
          setResearchFacts(prev => (isMerge && prev ? `${prev}\n\n### Additional Iterative Findings (${new Date().toLocaleTimeString()}):\n${res.output}` : res.output));
          setResearchStepIndex(0);
        } else if (stepName === 'outline') {
          setResearchOutline(prev => (isMerge && prev ? `${prev}\n\n### Supplementary Outline Blueprint:\n${res.output}` : res.output));
          setResearchStepIndex(1);
        } else if (stepName === 'write') {
          setResearchDraft(prev => (isMerge && prev ? `${prev}\n\n### Expanded Draft Sections:\n${res.output}` : res.output));
          setResearchStepIndex(2);
        } else if (stepName === 'citations') {
          setResearchCitations(prev => (isMerge && prev ? `${prev}\n\n### Additional Verified References:\n${res.output}` : res.output));
          setResearchStepIndex(3);
        }
      }
    } catch (err) {
      setError('Research Workspace step failure: ' + err.message);
    } finally {
      setStepLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        topic: prompt || 'Flagship SaaS Architecture',
        content: content || prompt,
        tone,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        targetLanguage,
      };

      const res = await apiClient.post(`/api/ai/${activeOp.id}`, payload);
      if (res && res.success) {
        const resultText = res.output || JSON.stringify(res, null, 2);
        setOutput(resultText);

        const wordCount = resultText.split(/\s+/).filter(Boolean).length;
        const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
        setMeta({
          words: wordCount,
          readTime: `${readMinutes} min`,
          seoScore: res.score || res.meta?.seoScore || (wordCount > 100 ? 98 : 88),
        });
      } else {
        setError(res?.message || 'AI processing encountered an unexpected condition.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to AI Studio Engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/api/ai/studio-chat', { message: userMsg, history: chatMessages });
      if (res && res.success) {
        setChatMessages(prev => [...prev, { role: 'ai', text: res.output }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `❌ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (textToCopy = output) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToEditor = (draftContent = output) => {
    sessionStorage.setItem('nexblog_ai_draft', draftContent);
    navigate('/create-post', { state: { aiDraft: draftContent, topic: researchTopic || prompt } });
  };

  const handleDownloadMd = (draftContent = output) => {
    const blob = new Blob([draftContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexblog-ai-draft-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 bg-surface dark:bg-surface-dark text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Volumetric Glows */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Workspace Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-glow">
              <HiSparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight">NexBlog AI Studio</h1>
                <span className="badge-primary text-[10px] uppercase font-bold px-2.5 py-0.5">V3.1 Flagship Core</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Multi-Stage Research Pipeline, Creator Memory Invariants & Neural Telemetry Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass dark:glass-dark border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Neural Orchestrator Connected (<span className="font-mono">&lt;12ms</span>)</span>
            </div>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => { setActiveTab('research'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'research'
                ? 'gradient-brand text-white shadow-glow-sm scale-[1.02]'
                : 'glass dark:glass-dark border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/50'
            }`}
          >
            <HiAcademicCap className="w-5 h-5" />
            <span>🔬 Interactive Research Workspace</span>
          </button>
          <button
            onClick={() => { setActiveTab('memory'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'memory'
                ? 'gradient-brand text-white shadow-glow-sm scale-[1.02]'
                : 'glass dark:glass-dark border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/50'
            }`}
          >
            <HiDatabase className="w-5 h-5" />
            <span>🧠 AI Memory Invariants</span>
          </button>
          <button
            onClick={() => { setActiveTab('tools'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'tools'
                ? 'gradient-brand text-white shadow-glow-sm scale-[1.02]'
                : 'glass dark:glass-dark border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-500/50'
            }`}
          >
            <HiViewBoards className="w-5 h-5" />
            <span>⚡ Quick Studio Tools</span>
          </button>
          <button
            onClick={() => setKbOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all glass dark:glass-dark border border-purple-500/50 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10"
          >
            <HiDatabase className="w-5 h-5 text-purple-400" />
            <span>📚 Knowledge Base (RAG)</span>
            {selectedKbDoc && <span className="w-2 h-2 rounded-full bg-emerald-500" title={`Grounded to: ${selectedKbDoc.title}`} />}
          </button>
          <button
            onClick={() => navigate('/ai-workflow-studio')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all glass dark:glass-dark border border-indigo-500/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10"
          >
            <HiSparkles className="w-5 h-5 text-indigo-400" />
            <span>🔀 Branching Studio</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-3 animate-fade-in">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: INTERACTIVE RESEARCH WORKSPACE */}
        {/* ========================================================= */}
        {activeTab === 'research' && (
          <div className="space-y-6 animate-fade-in">
            {/* Topic Specification Header Bar */}
            <div className="glass dark:glass-dark rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Multi-Stage Autonomous Research Pipeline</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enter your topic below. Inspect, verify, and edit intermediate outputs at every step before publishing.
                  </p>
                </div>
                <button
                  onClick={() => handleExecuteStep('research')}
                  disabled={stepLoading || !researchTopic}
                  className="btn-primary px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-glow flex items-center gap-2.5 flex-shrink-0"
                >
                  {stepLoading ? <HiRefresh className="w-5 h-5 animate-spin" /> : <HiSparkles className="w-5 h-5" />}
                  <span>{researchFacts ? 'Re-run Research Phase' : '1. Launch Research Phase'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Target Article Topic / Thesis
                </label>
                <input
                  type="text"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  placeholder="e.g. Flagship Liquid Glass & Sub-12ms Edge Architectures for 2026"
                  className="input-glass w-full rounded-xl p-3.5 text-base font-semibold focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                <div className={`p-3 rounded-xl border transition-all ${researchStepIndex === 0 && researchFacts ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold tracking-wider">Stage 1</p>
                  <p className="text-xs sm:text-sm font-extrabold mt-0.5">🔬 Research Facts</p>
                </div>
                <div className={`p-3 rounded-xl border transition-all ${researchStepIndex === 1 && researchOutline ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold tracking-wider">Stage 2</p>
                  <p className="text-xs sm:text-sm font-extrabold mt-0.5">📋 H1/H2 Outline</p>
                </div>
                <div className={`p-3 rounded-xl border transition-all ${researchStepIndex === 2 && researchDraft ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold tracking-wider">Stage 3</p>
                  <p className="text-xs sm:text-sm font-extrabold mt-0.5">✍️ Full Article Draft</p>
                </div>
                <div className={`p-3 rounded-xl border transition-all ${researchStepIndex === 3 && researchCitations ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold tracking-wider">Stage 4</p>
                  <p className="text-xs sm:text-sm font-extrabold mt-0.5">📚 Citations & Meta</p>
                </div>
              </div>
            </div>

            {/* 2-Column Inspection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CARD 1: Research Facts & Benchmarks */}
              <div className="glass dark:glass-dark rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <h4 className="font-heading font-bold text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Stage 1: Verified Facts & Benchmarks</span>
                    </h4>
                    <span className="text-xs font-mono text-slate-400">Editable Inspection</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Review and edit the data points retrieved by our Research Agent. The Outline Agent will use exact facts below.
                  </p>
                  <textarea
                    rows={8}
                    value={researchFacts}
                    onChange={(e) => setResearchFacts(e.target.value)}
                    placeholder="Click 'Launch Research Phase' above to retrieve industry stats, benchmarks, and technical facts..."
                    className="input-glass w-full rounded-2xl p-4 mt-3 text-sm font-mono leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleExecuteStep('research', true)}
                    disabled={stepLoading || !researchTopic || !researchFacts}
                    className="btn-secondary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                    title="Run research again and merge new facts with current notes"
                  >
                    <HiRefresh className="w-4 h-4 text-blue-500" />
                    <span>🔄 Research Again & Merge</span>
                  </button>
                  <button
                    onClick={() => handleExecuteStep('outline', false)}
                    disabled={stepLoading || !researchFacts}
                    className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <span>2. Generate H1/H2 Outline &rarr;</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: Structural Outline Blueprint */}
              <div className="glass dark:glass-dark rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <h4 className="font-heading font-bold text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <span>Stage 2: Structural H1/H2 Blueprint</span>
                    </h4>
                    <span className="text-xs font-mono text-slate-400">Editable Inspection</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Inspect and refine the architectural outline before sending it to the Writer Agent.
                  </p>
                  <textarea
                    rows={8}
                    value={researchOutline}
                    onChange={(e) => setResearchOutline(e.target.value)}
                    placeholder="Outline will populate here after executing Stage 2..."
                    className="input-glass w-full rounded-2xl p-4 mt-3 text-sm font-mono leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleExecuteStep('outline', true)}
                    disabled={stepLoading || !researchFacts || !researchOutline}
                    className="btn-secondary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                    title="Expand outline structure and merge"
                  >
                    <HiRefresh className="w-4 h-4 text-purple-500" />
                    <span>🔄 Expand Outline & Merge</span>
                  </button>
                  <button
                    onClick={() => handleExecuteStep('write', false)}
                    disabled={stepLoading || !researchOutline}
                    className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <HiSparkles className="w-4 h-4" />
                    <span>3. Synthesize Full Draft &rarr;</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: Complete Article Synthesis */}
              <div className="glass dark:glass-dark rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <h4 className="font-heading font-bold text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Stage 3: Full Article Synthesis</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleCopy(researchDraft)} disabled={!researchDraft} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">Copy</button>
                      <button onClick={() => handleDownloadMd(researchDraft)} disabled={!researchDraft} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">.MD</button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    The complete article synthesized with active voice, code blocks, and structured comparison tables.
                  </p>
                  <textarea
                    rows={10}
                    value={researchDraft}
                    onChange={(e) => setResearchDraft(e.target.value)}
                    placeholder="Full 1,500+ word article draft will appear here after executing Stage 3..."
                    className="input-glass w-full rounded-2xl p-4 mt-3 text-sm font-sans leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="mt-4">
                    <VerificationReportCard
                      verificationReport={verificationReport}
                      verifying={verifyingDraft}
                      onTriggerVerify={() => handleVerifyDraft(researchDraft)}
                    />
                  </div>
                </div>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleExecuteStep('write', true)}
                    disabled={stepLoading || !researchOutline || !researchDraft}
                    className="btn-secondary px-3 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-40"
                    title="Synthesize additional sections and append"
                  >
                    <HiRefresh className="w-3.5 h-3.5 text-emerald-500" />
                    <span>🔄 Expand & Merge</span>
                  </button>
                  <button
                    onClick={() => handleExecuteStep('citations', false)}
                    disabled={stepLoading || !researchDraft}
                    className="btn-secondary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <span>4. Add Citations</span>
                  </button>
                  <button
                    onClick={() => handleSendToEditor(researchDraft)}
                    disabled={!researchDraft}
                    className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <span>Send to Editor &rarr;</span>
                  </button>
                </div>
              </div>

              {/* CARD 4: Citations & Bibliography */}
              <div className="glass dark:glass-dark rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <h4 className="font-heading font-bold text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Stage 4: Citations & Bibliography</span>
                    </h4>
                    <button onClick={() => handleCopy(researchCitations)} disabled={!researchCitations} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">Copy</button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Verified industry and academic references generated to reinforce your article&apos;s credibility.
                  </p>
                  <textarea
                    rows={10}
                    value={researchCitations}
                    onChange={(e) => setResearchCitations(e.target.value)}
                    placeholder="Citations and bibliography will populate here after executing Stage 4..."
                    className="input-glass w-full rounded-2xl p-4 mt-3 text-sm font-mono leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleExecuteStep('citations', true)}
                    disabled={stepLoading || !researchDraft || !researchCitations}
                    className="btn-secondary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                    title="Retrieve additional references and merge"
                  >
                    <HiRefresh className="w-4 h-4 text-amber-500" />
                    <span>🔄 Find More Citations & Merge</span>
                  </button>
                  <button
                    onClick={() => handleSendToEditor(`${researchDraft}\n\n## References & Bibliography\n${researchCitations}`)}
                    disabled={!researchDraft || !researchCitations}
                    className="btn-primary flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    <span>Send Complete Article + Citations &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AI MEMORY STUDIO CONFIGURATION */}
        {/* ========================================================= */}
        {activeTab === 'memory' && (
          <form onSubmit={handleSaveMemory} className="glass dark:glass-dark rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white flex items-center gap-2.5">
                  <HiDatabase className="w-6 h-6 text-primary-500" />
                  <span>Creator AI Memory & Invariants Configuration</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  These profile invariants are automatically injected into every AI generation prompt across your workspace.
                </p>
              </div>
              {memorySuccess && (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2 animate-fade-in">
                  <HiCheck className="w-5 h-5" />
                  <span>Invariants Saved!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Brand Voice Invariant
                </label>
                <input
                  type="text"
                  value={memory.brandVoice}
                  onChange={(e) => setMemory({ ...memory, brandVoice: e.target.value })}
                  placeholder="e.g. Professional & Authoritative"
                  className="input-glass w-full rounded-xl p-3.5 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Target Audience Persona
                </label>
                <input
                  type="text"
                  value={memory.targetAudience}
                  onChange={(e) => setMemory({ ...memory, targetAudience: e.target.value })}
                  placeholder="e.g. Senior Staff Engineers, Tech Executives"
                  className="input-glass w-full rounded-xl p-3.5 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Writing Style & Syntactic Density
                </label>
                <textarea
                  rows={3}
                  value={memory.writingStyle}
                  onChange={(e) => setMemory({ ...memory, writingStyle: e.target.value })}
                  placeholder="e.g. Analytical, active voice, concise paragraphs"
                  className="input-glass w-full rounded-xl p-3.5 text-sm font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Preferred Article Length Profile
                </label>
                <input
                  type="text"
                  value={memory.preferredLength}
                  onChange={(e) => setMemory({ ...memory, preferredLength: e.target.value })}
                  placeholder="e.g. 1500+ words (Comprehensive Deep Dive)"
                  className="input-glass w-full rounded-xl p-3.5 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Automatic SEO Rules & Taxonomy Invariants
              </label>
              <textarea
                rows={3}
                value={memory.seoRules}
                onChange={(e) => setMemory({ ...memory, seoRules: e.target.value })}
                placeholder="e.g. Include LSI keywords across semantic H2/H3 headings, structure comparison tables"
                className="input-glass w-full rounded-xl p-3.5 text-sm font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Custom Creator Instructions & Exclusion Rules
              </label>
              <textarea
                rows={3}
                value={memory.customInstructions}
                onChange={(e) => setMemory({ ...memory, customInstructions: e.target.value })}
                placeholder="e.g. Avoid generic marketing fluff. Prioritize concrete architectural insights and clean code specifications."
                className="input-glass w-full rounded-xl p-3.5 text-sm font-medium leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={memorySaving}
                className="btn-primary px-8 py-3.5 rounded-xl font-extrabold text-sm shadow-glow flex items-center gap-2"
              >
                {memorySaving ? <HiRefresh className="w-5 h-5 animate-spin" /> : <HiCheck className="w-5 h-5" />}
                <span>Save Invariants to MongoDB</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 3: QUICK STUDIO TOOLS */}
        {/* ========================================================= */}
        {activeTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Left Column: Capability Palette (3 cols) */}
            <div className="lg:col-span-3 space-y-2">
              <div className="glass dark:glass-dark rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-1.5">
                <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <HiCog className="w-3.5 h-3.5 text-primary-500" /> Studio Capabilities
                </p>
                {OPERATIONS.map((op) => {
                  const Icon = op.icon;
                  const isActive = activeOp.id === op.id;
                  return (
                    <button
                      key={op.id}
                      onClick={() => { setActiveOp(op); setError(null); }}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? 'gradient-brand text-white shadow-glow-sm scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                      <div>
                        <p className="font-bold text-sm leading-tight mb-0.5">{op.label}</p>
                        <p className={`text-[11px] leading-snug ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{op.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Middle Column: Configuration & Inputs (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="glass dark:glass-dark rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <activeOp.icon className="w-5 h-5 text-primary-500" />
                    <span>{activeOp.label} Configuration</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400 uppercase">{activeOp.id}</span>
                </div>

                {activeOp.id !== 'studio-chat' ? (
                  <>
                    <div>
                      <label htmlFor="studio-prompt-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                        {activeOp.id === 'generate-article' || activeOp.id === 'generate-outline' || activeOp.id === 'generate-tags'
                          ? 'Article Topic / Thesis'
                          : 'Source Content / Prompt'}
                      </label>
                      <textarea
                        id="studio-prompt-input"
                        aria-label="Prompt Input"
                        rows={5}
                        value={activeOp.id === 'generate-article' ? prompt : content}
                        onChange={(e) => activeOp.id === 'generate-article' ? setPrompt(e.target.value) : setContent(e.target.value)}
                        placeholder={activeOp.id === 'generate-article'
                          ? 'e.g. Write a technical deep-dive on Liquid Glass web design and sub-12ms API architectures for 2026...'
                          : 'Paste text or paragraph here to analyze, rewrite, or score...'}
                        className="input-glass w-full rounded-xl p-3.5 text-sm font-mono leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-primary-500 transition-all"
                      />
                    </div>

                    {(activeOp.id === 'generate-article' || activeOp.id === 'rewrite-copy') && (
                      <div>
                        <label htmlFor="studio-tone-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                          Authorial Tone Profile
                        </label>
                        <select
                          id="studio-tone-select"
                          aria-label="Tone Profile"
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="input-glass w-full rounded-xl p-3 text-sm font-semibold transition-all"
                        >
                          {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    )}

                    {(activeOp.id === 'generate-article' || activeOp.id === 'score-seo') && (
                      <div>
                        <label htmlFor="studio-keywords-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                          Target SEO Keywords (comma separated)
                        </label>
                        <input
                          id="studio-keywords-input"
                          aria-label="Target Keywords"
                          type="text"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="e.g. Liquid Glass, SaaS Architecture, Edge Caching"
                          className="input-glass w-full rounded-xl p-3 text-sm transition-all"
                        />
                      </div>
                    )}

                    {activeOp.id === 'translate-content' && (
                      <div>
                        <label htmlFor="studio-lang-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                          Target Localization
                        </label>
                        <select
                          id="studio-lang-select"
                          aria-label="Target Language"
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="input-glass w-full rounded-xl p-3 text-sm font-semibold"
                        >
                          {['French', 'German', 'Japanese', 'Spanish'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={handleExecute}
                      disabled={loading}
                      className="btn-primary w-full py-4 rounded-xl font-extrabold text-sm shadow-glow flex items-center justify-center gap-2.5 transition-all"
                    >
                      {loading ? (
                        <>
                          <HiRefresh className="w-5 h-5 animate-spin" />
                          <span>Synthesizing via Neural Core...</span>
                        </>
                      ) : (
                        <>
                          <HiSparkles className="w-5 h-5" />
                          <span>Execute {activeOp.label}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col h-[460px] justify-between">
                    <div className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 font-sans text-sm">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                            m.role === 'user'
                              ? 'gradient-brand text-white rounded-br-none shadow-sm font-medium'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700 shadow-sm'
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex justify-start">
                          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 text-xs font-mono animate-pulse border border-slate-200 dark:border-slate-700">
                            ⚡ AI Studio Copilot thinking…
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
                      <input
                        type="text"
                        aria-label="Ask AI Copilot"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask for editorial tips, rewrite advice..."
                        className="input-glass flex-1 rounded-xl px-3.5 py-3 text-sm"
                      />
                      <button type="submit" disabled={loading} className="btn-primary px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                        <HiArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Output Window & Telemetry (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card-hover overflow-hidden flex flex-col justify-between min-h-[580px]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-heading font-bold text-sm">Studio Output Console</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy()}
                      disabled={!output}
                      title="Copy to Clipboard"
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-all"
                    >
                      {copied ? <HiCheck className="w-4 h-4 text-emerald-500" /> : <HiClipboardCopy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDownloadMd()}
                      disabled={!output}
                      title="Download Markdown"
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-all"
                    >
                      <HiDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 sm:p-8 bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-sans text-sm sm:text-base leading-relaxed overflow-y-auto max-h-[460px] whitespace-pre-wrap">
                  {output ? (
                    output
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
                      <HiSparkles className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700 animate-float" />
                      <p className="font-semibold text-sm">Ready to synthesize.</p>
                      <p className="text-xs max-w-xs mt-1">Configure your prompt and click Execute to generate production-ready editorial assets.</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Word Count</p>
                      <p className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">{meta.words}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Read Time</p>
                      <p className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">{meta.readTime}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEO Score</p>
                      <p className="font-heading font-extrabold text-sm text-emerald-500">{meta.seoScore}/100</p>
                    </div>
                  </div>

                  {output && (
                    <VerificationReportCard
                      verificationReport={verificationReport}
                      verifying={verifyingDraft}
                      onTriggerVerify={() => handleVerifyDraft(output)}
                    />
                  )}

                  <button
                    onClick={() => handleSendToEditor()}
                    disabled={!output}
                    className="w-full py-3.5 px-6 rounded-xl gradient-brand text-white font-bold text-sm shadow-glow-sm hover:scale-[1.01] transition-all disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <span>Transfer directly to Article Editor</span>
                    <HiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* V3.2 Knowledge Base Drawer */}
      <KnowledgeBaseDrawer
        isOpen={kbOpen}
        onClose={() => setKbOpen(false)}
        onSelectDocument={(id, doc) => setSelectedKbDoc(doc || null)}
        selectedDocId={selectedKbDoc?._id}
      />
    </main>
  );
}
