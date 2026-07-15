import React from 'react';
import { HiStar, HiCheckCircle } from 'react-icons/hi';

const REVIEWS = [
  {
    name: 'Sarah Jenkins',
    role: 'VP of Product Content',
    company: 'CloudMatrix SaaS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    quote: 'NexBlog AI Version 2.0 has completely replaced our fragmented writing stack. The real-time SEO scoring combined with the Liquid Glass editor increased our weekly output by 400% with zero loss of editorial tone.',
  },
  {
    name: 'Marcus Vance',
    role: 'Senior Staff Engineer',
    company: 'DevScale Systems',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    quote: 'The dual-mode LLM drafting is on another level. We feed our architecture specs into the terminal copilot and get production-ready technical articles in under 5 seconds. Absolute game changer.',
  },
  {
    name: 'Elena Rostova',
    role: 'Editor-in-Chief',
    company: 'TechInsider Quarterly',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    quote: 'Our writers love the distraction-free Liquid Glass workspace. The live grammar verification catches subtle structural redundancy without flattening the authorial voice.',
  },
  {
    name: 'David Chen',
    role: 'Founder & CEO',
    company: 'HyperGrowth Media',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    quote: 'One-click omni-channel syndication alone saved our team 15 hours every single week. When you add the AI SEO rankings, our organic traffic doubled within 45 days.',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
          <HiCheckCircle className="w-4 h-4 text-primary-500" />
          <span>Verified Creator Authority</span>
        </span>
        <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Loved by the World&apos;s <br />
          <span className="gradient-brand-text">Most Demanding Editorial Teams</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          See why tech leads, creators, and editors rely on NexBlog AI to dominate organic search.
        </p>
      </div>

      {/* Marquee Wrapper */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] py-4">
        <div className="flex w-max animate-marquee gap-8 items-stretch">
          {[...REVIEWS, ...REVIEWS].map((review, idx) => (
            <div
              key={idx}
              className="w-[380px] sm:w-[440px] p-8 rounded-3xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 mb-6 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} className="w-5 h-5" />
                ))}
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal mb-8 italic">
                &ldquo;{review.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/30"
                />
                <div>
                  <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    {review.name}
                    <HiCheckCircle className="w-4 h-4 text-primary-500" />
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {review.role} · <span className="text-primary-600 dark:text-primary-400">{review.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
