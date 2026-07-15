import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiSparkles, HiLightBulb, HiDocumentSearch, HiShare, HiCheckCircle } from 'react-icons/hi';

const STEPS = [
  {
    step: '01',
    title: 'Ideate & Strategic Prompting',
    subtitle: 'Feed the copilot raw notes or outline ideas',
    description: 'Provide a topic, raw bullet points, or paste an existing draft. Select your desired editorial tone (Executive, Conversational, Technical, or Academic) and target keyword strategy.',
    icon: HiLightBulb,
    badge: 'Ideation Phase',
  },
  {
    step: '02',
    title: 'Autonomous Volumetric Drafting',
    subtitle: 'AI neural models generate a structured foundation',
    description: 'Our dual-mode LLM engine constructs a comprehensive 1,500+ word draft complete with engaging introductions, formatted Markdown tables, and structured H2/H3 semantic headers.',
    icon: HiSparkles,
    badge: 'Generation Phase',
  },
  {
    step: '03',
    title: 'Real-Time SEO & Linguistic Polish',
    subtitle: 'Instant keyword saturation & readability verification',
    description: 'Our real-time SEO scoring panel checks entity density, passive voice ratio, and Flesch-Kincaid readability while you make quick personal touches in the Liquid Glass editor.',
    icon: HiDocumentSearch,
    badge: 'Optimization Phase',
  },
  {
    step: '04',
    title: 'Omni-Channel Syndication & Studio Sync',
    subtitle: 'Publish instantly across web and global newsletters',
    description: 'With one click, deploy your flagship article directly to your custom domain, syndicate to developer platforms, and automatically dispatch email notification summaries to subscribed members.',
    icon: HiShare,
    badge: 'Publishing Phase',
  },
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
            <HiCheckCircle className="w-4 h-4 text-primary-500" />
            <span>Autonomous Publishing Pipeline</span>
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            How NexBlog AI transforms <br />
            <span className="gradient-brand-text">Raw Thoughts into Viral Authority</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Experience our streamlined 4-stage kinetic workflow engineered for maximum publishing velocity.
          </p>
        </div>

        {/* Workflow Timeline Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Interactive Step Selector */}
          <div className="lg:col-span-6 space-y-4">
            {STEPS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeStep === idx;
              return (
                <motion.div
                  key={item.step}
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ x: 6 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'glass dark:glass-dark border-primary-500/60 shadow-card scale-[1.02]'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-white dark:hover:bg-slate-900 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-heading font-black text-base shadow-sm ${
                      isActive ? 'gradient-brand text-white shadow-glow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">{item.badge}</span>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : 'text-slate-400'}`} />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{item.subtitle}</p>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800"
                        >
                          {item.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Visual Stage Spotlight */}
          <div className="lg:col-span-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card-hover p-8 sm:p-10 min-h-[440px] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full gradient-brand opacity-20 blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="badge-primary text-xs font-bold px-3 py-1">Stage {STEPS[activeStep].step} Active</span>
                  <span className="text-xs font-mono text-slate-400 uppercase">nexblog-pipeline-v2.engine</span>
                </div>

                <div className="w-16 h-16 gradient-brand rounded-3xl flex items-center justify-center mb-6 shadow-glow">
                  {React.createElement(STEPS[activeStep].icon, { className: 'w-8 h-8 text-white' })}
                </div>

                <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">
                  {STEPS[activeStep].title}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-8">
                  {STEPS[activeStep].description}
                </p>
              </div>

              {/* Step Progress Indicators */}
              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      aria-label={`Go to stage ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeStep === i ? 'w-10 gradient-brand shadow-glow-sm' : 'w-2.5 bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Step {activeStep + 1} of {STEPS.length}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
