import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiLightningBolt, HiAnnotation, HiTranslate, HiTag, HiDocumentText, HiCheck, HiClipboardCopy, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const DEMO_MODES = [
  {
    id: 'generate',
    icon: HiSparkles,
    label: 'Generate Article',
    prompt: 'Write an executive technical exploration on Liquid Glass UI and volumetric web architecture for 2026 SaaS applications.',
    output: `# The Architectural Paradigm of Liquid Glass in Modern Web Ecosystems\n\nAs digital product design matures beyond flat minimalisms and rigid Neumorphic approximations, **Liquid Glass** emerges as the definitive standard for high-density SaaS interfaces. By combining real-time background refraction, volumetric ambient lighting, and physics-driven micro-interactions, engineers create interfaces that feel tactile, spatial, and fundamentally alive.\n\n## Core Principles of Volumetric UI\n1. **Dynamic Refraction Depth:** Unlike static backdrop blurs, Liquid Glass utilizes differential chromatic aberration and specular border highlights to communicate vertical layering.\n2. **Kinetic Responsive Physics:** Surfaces react organically to cursor gravity and scroll momentum using continuous spring dynamics.\n3. **Zero-Latency Content Flow:** High-performance GPU shaders and CSS backdrop filters ensure stable 60+ FPS rendering across devices.`,
    stats: { words: 142, readTime: '1 min', seo: 99, readability: 'Executive Pro' },
  },
  {
    id: 'rewrite',
    icon: HiLightningBolt,
    label: 'Rewrite & Polish',
    prompt: 'Rewrite this casual note into authoritative, high-converting copy: "Our blog tool is really good with AI and makes stuff faster."',
    output: `### Transforming Editorial Velocity with Enterprise AI Architecture\n\nTraditional content production pipelines suffer from systemic friction between ideation, drafting, and technical SEO optimization. **NexBlog AI** re-engineers this workflow by embedding autonomous multi-model copilots directly inside a high-speed Liquid Glass editor.\n\nBy unifying generative drafting, real-time linguistic verification, and keyword saturation scoring into a single unified workspace, editorial teams achieve a **500% acceleration in publishing velocity** while elevating structural quality across every article published.`,
    stats: { words: 98, readTime: '1 min', seo: 100, readability: 'SaaS Grade A+' },
  },
  {
    id: 'seo',
    icon: HiDocumentText,
    label: 'Live SEO Scoring',
    prompt: 'Audit and score the SEO metadata for our new technical release on Next.js 16 server components and distributed caching.',
    output: `## Real-Time Technical SEO Audit Report\n\n**Overall Optimization Score: 98 / 100 (Flagship Rank)**\n\n### ✔️ Keyword Density & Semantic Entities\n- Target Phrase: **Next.js 16 Server Components** (Density: 2.8% — Ideal Range)\n- LSI Entities Detected: *Distributed Edge Caching, Server Actions, Suspense Boundary, Streaming SSR*\n\n### ✔️ Structural Hierarchy & Accessibility\n- Single authoritative \`<h1>\` verified with exact primary keyword prefixing.\n- \`<h2>\` and \`<h3>\` tags maintain logical syntactic progression.\n- Meta description exact length: **156 characters** (Optimized for Google SERP display).`,
    stats: { words: 114, readTime: '1 min', seo: 98, readability: 'Technical Audit' },
  },
  {
    id: 'grammar',
    icon: HiAnnotation,
    label: 'Grammar Shield',
    prompt: 'Verify grammar, syntax, and tone consistency for our enterprise security release note.',
    output: `### Linguistic Verification & Structural Audit\n\n**Grammar Integrity: 100% Verified** | **Tone: Professional & Authoritative**\n\n*All passive constructions and redundant modifiers have been eliminated. Active voice verified across 100% of sentences for maximum clarity and user comprehension.*\n\n> **Corrected Excerpt:** "NexBlog AI encrypts all creator payloads at rest utilizing AES-256-GCM hardware security modules, ensuring zero-knowledge isolation across multi-tenant database clusters."`,
    stats: { words: 86, readTime: '1 min', seo: 96, readability: 'Zero Errors' },
  },
  {
    id: 'translate',
    icon: HiTranslate,
    label: 'Auto-Translate',
    prompt: 'Translate our flagship Liquid Glass release announcement into idiomatic French, German, and Japanese.',
    output: `### Multi-Lingual Omni-Channel Localization\n\n**🇫🇷 French (Français):**\n> *L'architecture de « Verre Liquide » de NexBlog AI redéfinit les standards de l'expérience utilisateur pour les plateformes SaaS de nouvelle génération, offrant une immersion visuelle et une rapidité d'exécution sans précédent.*\n\n**🇩🇪 German (Deutsch):**\n> *Die Liquid-Glass-Architektur von NexBlog AI setzt neue Maßstäbe für professionelle SaaS-Benutzeroberflächen durch volumetrische Tiefe und blitzschnelle KI-Integration.*\n\n**🇯🇵 Japanese (日本語):**\n> *NexBlog AIの「リキッドグラス」アーキテクチャは、次世代SaaSプラットフォームのユーザーエクスペリエンスを再定義し、かつてない視覚的没入感と高速なAI編集を実現します。*`,
    stats: { words: 135, readTime: '1 min', seo: 97, readability: 'Native Fluency' },
  },
  {
    id: 'tags',
    icon: HiTag,
    label: 'Smart Tagging',
    prompt: 'Generate viral categorization tags and semantic schema entities for a post on AI Agent Coding and Deep Learning.',
    output: `## Automated Taxonomy & Semantic Schema Generation\n\n### Primary Categorization Tags\n\`#ArtificialIntelligence\` \`#AgenticCoding\` \`#MachineLearning\` \`#LiquidGlassUI\` \`#NextJS\` \`#DevOps\` \`#SaaSArchitecture\` \`#WebDevelopment\`\n\n### JSON-LD Article Schema Entities\n\`\`\`json\n{\n  "@context": "https://schema.org",\n  "@type": "TechArticle",\n  "headline": "The Rise of Autonomous AI Coding Agents",\n  "keywords": ["Agentic AI", "DeepMind Architecture", "LLM Copilot", "Volumetric UI"],\n  "author": { "@type": "Organization", "name": "NexBlog AI" }\n}\n\`\`\``,
    stats: { words: 92, readTime: '1 min', seo: 100, readability: 'Schema Ready' },
  },
];

export default function InteractiveAIDemo() {
  const [activeMode, setActiveMode] = useState(DEMO_MODES[0]);
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsStreaming(true);
    setDisplayedText('');
    const fullText = activeMode.output;
    let currentIdx = 0;

    const interval = setInterval(() => {
      currentIdx += 4;
      if (currentIdx >= fullText.length) {
        setDisplayedText(fullText);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIdx));
      }
    }, 15);

    return () => clearInterval(interval);
  }, [activeMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMode.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 bg-surface dark:bg-surface-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
            <HiSparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Live Flagship AI Simulation</span>
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Test our AI Studio Copilot right here
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
            Select a capability below to experience how NexBlog AI instantly transforms prompts into production-grade editorial assets.
          </p>
        </div>

        {/* Studio Demo Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Mode Selector Tabs & Prompt Display */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass dark:glass-dark rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
              <p className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                AI Capability Engine
              </p>
              {DEMO_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode.id === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'gradient-brand text-white shadow-glow-sm scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt Card */}
            <div className="glass dark:glass-dark rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Simulated Prompt Input</span>
                <span className="badge-coming-soon text-[10px]">Real-Time Execution</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-100/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 leading-relaxed">
                &quot;{activeMode.prompt}&quot;
              </p>
            </div>
          </div>

          {/* Right Column: Live Streaming Output & Analytics Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card-hover overflow-hidden">
              {/* Studio Output Header */}
              <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-sm">
                    <HiSparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">{activeMode.label} Output Studio</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {isStreaming ? '⚡ AI Neural Engine streaming at 180 words/sec…' : '✓ Generation Complete & Verified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  <button
                    onClick={handleCopy}
                    className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <HiCheck className="w-4 h-4 text-emerald-500" /> : <HiClipboardCopy className="w-4 h-4 text-slate-500" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
                  </button>
                  <Link
                    to="/create-post"
                    className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-glow-sm"
                  >
                    <span>Launch in Studio</span>
                    <HiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Streaming Content Window */}
              <div className="p-6 sm:p-8 min-h-[340px] bg-white/40 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-sans text-sm sm:text-base leading-relaxed overflow-x-auto whitespace-pre-wrap">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMode.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {displayedText}
                    {isStreaming && (
                      <span className="inline-block w-2.5 h-5 ml-1 bg-primary-500 animate-pulse align-middle rounded-sm" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Live Analytics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Word Count</p>
                  <p className="font-heading font-extrabold text-base text-slate-900 dark:text-white">{activeMode.stats.words} words</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated Read</p>
                  <p className="font-heading font-extrabold text-base text-slate-900 dark:text-white">{activeMode.stats.readTime}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SEO Score</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-heading font-extrabold text-base text-emerald-500">{activeMode.stats.seo}/100</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Readability Level</p>
                  <p className="font-heading font-extrabold text-base gradient-brand-text">{activeMode.stats.readability}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
