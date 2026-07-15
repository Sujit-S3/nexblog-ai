import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi';

const FAQ_ITEMS = [
  {
    q: 'How does NexBlog AI ensure my generated content ranks well on Google and avoids AI penalties?',
    a: 'NexBlog AI utilizes a multi-stage semantic indexing architecture. Our real-time SEO scoring engine evaluates over 40 ranking factors simultaneously while generating content, ensuring ideal keyword density, semantic entity structure, and active human-centered phrasing that adheres strictly to Google helpful content guidelines.',
  },
  {
    q: 'Can I connect my own custom domain to my NexBlog AI workspace?',
    a: 'Yes! On Pro and Enterprise tiers, you can map your custom domain (e.g., blog.yourcompany.com) in under 60 seconds with automated SSL provisioning and edge CDN caching across 280+ global server nodes.',
  },
  {
    q: 'What underlying AI models power the autonomous drafting engine?',
    a: 'Our platform intelligently orchestrates across multiple state-of-the-art models including OpenAI GPT-4o, Claude 3.5 Sonnet, and custom fine-tuned domain models depending on the specific task (e.g., technical code synthesis vs. conversational narrative hooks).',
  },
  {
    q: 'Is my proprietary data and editorial intellectual property secure?',
    a: 'Absolutely. All user payloads are encrypted at rest with hardware security modules and in transit via TLS 1.3. We operate under strict zero-data-retention agreements with our underlying model providers, meaning your drafts and data are never used to train external public AI models.',
  },
  {
    q: 'Can I export my articles or migrate from WordPress/Medium?',
    a: 'Yes. Our one-click migration suite imports existing articles with zero downtime. You can export any draft or published post at any time in raw Markdown, structured HTML, or clean PDF formats.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
            <HiQuestionMarkCircle className="w-4 h-4 text-primary-500" />
            <span>Got Questions?</span>
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Frequently Asked <span className="gradient-brand-text">Questions</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Everything you need to know about the NexBlog AI architecture and publishing suite.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full gradient-brand flex-shrink-0" />
                    {item.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOpen ? 'gradient-brand text-white shadow-glow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <HiChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-slate-800">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
