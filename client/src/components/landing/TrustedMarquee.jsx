import React from 'react';
import { HiShieldCheck, HiSparkles } from 'react-icons/hi';

const TRUSTED_BRANDS = [
  { name: 'Next.js Ecosystem', category: 'Web Framework' },
  { name: 'Vercel Enterprise', category: 'Cloud Infrastructure' },
  { name: 'Linear Design Standard', category: 'Product Workflow' },
  { name: 'OpenAI GPT-4o Core', category: 'Intelligence Engine' },
  { name: 'Grammarly Pro Shield', category: 'Linguistic Audit' },
  { name: 'Notion AI Protocol', category: 'Workspace Architecture' },
  { name: 'Stripe Global Vault', category: 'Creator Monetization' },
  { name: 'MongoDB Atlas Vector', category: 'Semantic Storage' },
  { name: 'Tailwind Liquid Glass', category: 'Design Tokens' },
  { name: 'GSAP ScrollTrigger', category: 'Kinetic Motion' },
];

export default function TrustedMarquee() {
  return (
    <section className="py-14 border-y border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-lg overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <HiShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Trusted by Engineering Leads, Creators & Brands Across 140+ Countries</span>
        </div>
      </div>

      {/* Marquee Wrapper with Gradient Mask */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
        <div className="flex w-max animate-marquee gap-8 items-center py-2">
          {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl glass dark:glass-dark border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:border-primary-500/40 transition-colors flex-shrink-0 group"
            >
              <div className="w-7 h-7 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiSparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-left">
                <p className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200">{brand.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{brand.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
