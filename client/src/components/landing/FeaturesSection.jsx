import React from 'react';
import { motion } from 'framer-motion';
import {
  HiSparkles, HiChartBar, HiLightningBolt, HiAnnotation,
  HiShieldCheck, HiCollection, HiGlobeAlt
} from 'react-icons/hi';

const FEATURES = [
  {
    icon: HiSparkles,
    gradient: 'from-primary-500 via-indigo-600 to-secondary-500',
    badge: 'AI Neural Core',
    title: 'Multi-Model AI Writing Engine',
    description: 'Switch seamlessly between specialized generative models for authoritative executive drafting, punchy viral hooks, deep technical breakdowns, and academic structural synthesis.',
  },
  {
    icon: HiChartBar,
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    badge: 'Real-Time SEO',
    title: 'Autonomous Keyword & SERP Intelligence',
    description: 'Our real-time scoring engine checks target keyword density, semantic LSI saturation, heading hierarchy, and meta descriptions as you type to guarantee top SERP rankings.',
  },
  {
    icon: HiLightningBolt,
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    badge: 'Blazing Velocity',
    title: 'Liquid Glass Distraction-Free Editor',
    description: 'Engineered for flow state with zero visual clutter. Features instant autosave, Markdown shortcuts, floating command palettes, and custom typographic themes.',
  },
  {
    icon: HiAnnotation,
    gradient: 'from-pink-500 via-rose-600 to-purple-600',
    badge: 'Smart Community',
    title: 'AI-Moderated Discussion & Engagement',
    description: 'Foster vibrant reader communities with threaded responses and automated toxic speech filtering. Reward loyal readers with verified member badges.',
  },
  {
    icon: HiShieldCheck,
    gradient: 'from-blue-600 via-indigo-600 to-primary-600',
    badge: 'Enterprise Grade',
    title: 'Zero-Knowledge Cryptographic Isolation',
    description: 'Every article, draft, and media payload is encrypted with hardware security modules. Strict role-based access control keeps your proprietary intellectual property pristine.',
  },
  {
    icon: HiGlobeAlt,
    gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    badge: 'Omni-Channel',
    title: 'One-Click Global Syndication & Export',
    description: 'Publish simultaneously to your branded domain, Medium, Dev.to, and Hashnode. Export cleanly to PDF, HTML, or raw Markdown with full frontmatter metadata.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden">
      {/* Volumetric Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="badge-primary mb-4 inline-flex items-center gap-1.5"
          >
            <HiCollection className="w-4 h-4 text-primary-500" />
            <span>Architecture & Capabilities</span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight"
          >
            Engineered for the top 1% of <br />
            <span className="gradient-brand-text">Modern Creators & SaaS Brands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
          >
            Every tool in the NexBlog AI flagship suite is built to eliminate technical overhead so you can focus purely on authoritative storytelling and audience growth.
          </motion.p>
        </div>

        {/* 3D Glass Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, gradient, badge, title, description }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative rounded-3xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Top Gradient Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {badge}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                <span>Explore Technical Specs</span>
                <span>&rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
