import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiSparkles, HiShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Creator Starter',
    badge: 'Free Forever',
    desc: 'Ideal for independent writers exploring AI copilots and establishing their initial audience.',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: 'forever',
    features: [
      '5 AI-Drafted Articles per month',
      'Standard Liquid Glass Editor',
      'Real-Time Grammar Shield',
      'Basic SEO Keyword Scoring',
      'Community Discussion & Comments',
      '1 GB High-Speed Media Storage',
    ],
    cta: 'Launch Starter Free',
    href: '/sign-up',
    primary: false,
  },
  {
    name: 'Pro Flagship Suite',
    badge: 'Most Popular',
    desc: 'For serious creators and tech founders scaling high-converting newsletters and viral authority.',
    monthlyPrice: '$19',
    annualPrice: '$15',
    period: 'per month, billed annually',
    features: [
      'Unlimited Autonomous AI Articles',
      'Full Multi-Model AI Suite (GPT-4o & Claude 3.5)',
      'Real-Time 0-100 Technical SEO Scoring',
      'Custom Domain & Brand Customization',
      'One-Click Omni-Channel Syndication',
      'Priority AI Studio Compute & Latency (< 12ms)',
      '50 GB High-Speed Media & Asset Vault',
    ],
    cta: 'Start 14-Day Flagship Trial',
    href: '/sign-up',
    primary: true,
  },
  {
    name: 'Enterprise Agency',
    badge: 'Dedicated Scale',
    desc: 'For editorial teams, content agencies, and scaling SaaS organizations requiring governance.',
    monthlyPrice: '$59',
    annualPrice: '$49',
    period: 'per month, billed annually',
    features: [
      'Everything in Pro Flagship Suite',
      'Up to 10 Team Members & Role Governance',
      'Custom Fine-Tuned Brand Voice AI Model',
      'Automated Editorial Content Calendar API',
      'Dedicated Hardware Security Module Encryption',
      '24/7 Priority VIP Engineering Support',
      'Unlimited High-Speed Media Storage',
    ],
    cta: 'Contact Enterprise Team',
    href: '/sign-up',
    primary: false,
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      {/* Volumetric Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-secondary-500/10 dark:bg-secondary-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
            <HiSparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Transparent Investment</span>
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Predictable Pricing for <br />
            <span className="gradient-brand-text">Unstoppable Publishing Velocity</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-10">
            Start completely free or unlock flagship multi-model intelligence and unlimited publishing.
          </p>

          {/* Annual Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-2xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card">
            <span className={`text-sm font-bold pl-3 transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-label="Toggle annual billing discount"
              className="relative w-14 h-8 rounded-full gradient-brand p-1 transition-all shadow-inner flex items-center"
            >
              <motion.div
                layout
                animate={{ x: isAnnual ? 24 : 0 }}
                className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
              />
            </button>
            <div className="flex items-center gap-2 pr-3">
              <span className={`text-sm font-bold transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                Annual Billing
              </span>
              <span className="badge-coming-soon text-[11px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                plan.primary
                  ? 'gradient-brand text-white shadow-glow-lg scale-105 z-20'
                  : 'glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card card-hover'
              }`}
            >
              {/* Top Badge Accent */}
              {plan.badge && (
                <div className="mb-6 flex items-center justify-between">
                  <span className={`text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
                    plan.primary
                      ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md'
                      : 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20'
                  }`}>
                    {plan.badge}
                  </span>
                  {plan.primary && <HiShieldCheck className="w-6 h-6 text-white/80 animate-pulse" />}
                </div>
              )}

              <div>
                <h3 className={`font-heading text-2xl font-black mb-2 ${plan.primary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-8 leading-relaxed font-normal ${plan.primary ? 'text-white/80' : 'text-slate-600 dark:text-slate-400'}`}>
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-white/20 dark:border-slate-800/60">
                  <span className={`font-heading text-5xl font-black ${plan.primary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className={`text-xs font-semibold ${plan.primary ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.primary ? 'bg-white text-primary-600' : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      }`}>
                        <HiCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className={plan.primary ? 'text-white/95' : 'text-slate-700 dark:text-slate-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                to={plan.href}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-center text-sm shadow-md transition-all duration-200 block ${
                  plan.primary
                    ? 'bg-white text-primary-700 hover:bg-slate-100 hover:scale-[1.02]'
                    : 'btn-primary'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
