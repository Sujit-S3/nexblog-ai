import { HiSparkles, HiShieldCheck, HiUsers, HiAnnotation, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';

export default function About() {
  const milestones = [
    { year: '2023', event: 'Founded with a mission to democratize AI writing tools' },
    { year: 'Early 2024', event: 'Launched beta with 500 early access writers' },
    { year: 'Mid 2024', event: 'Reached 10,000 articles published on the platform' },
    { year: '2025', event: 'Introduced AI Assistant panel and SEO scoring engine' },
    { year: 'Today', event: 'Powering thousands of creators across 40+ countries' },
  ];

  const values = [
    { icon: HiSparkles, title: 'AI-First', desc: 'We believe AI should augment human creativity, not replace it. Every feature starts with a writer\'s real need.' },
    { icon: HiShieldCheck, title: 'Privacy & Trust', desc: 'Your content, your data. We never train models on your writing without explicit permission.' },
    { icon: HiUsers, title: 'Community', desc: 'Writing is better together. We\'re building tools that foster collaboration and meaningful conversations.' },
    { icon: HiAnnotation, title: 'Clarity', desc: 'Great writing communicates clearly. We build tools that help writers find their most precise words.' },
  ];

  return (
    <main className='pt-16'>
      {/* Hero */}
      <section className='relative py-24 gradient-hero dark:gradient-hero-dark overflow-hidden'>
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-0 right-1/3 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl' />
          <div className='absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-secondary-400/10 blur-3xl' />
        </div>
        <div className='relative max-w-4xl mx-auto px-4 sm:px-6 text-center'>
          <span className='badge-primary mb-6 inline-flex'>About NexBlog AI</span>
          <h1 className='font-heading text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6'>
            We&apos;re building the future<br />
            <span className='gradient-brand-text'>of intelligent writing.</span>
          </h1>
          <p className='text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed'>
            NexBlog AI is a premium AI-powered blogging platform built for modern creators who demand speed, quality, and intelligent tools that adapt to their voice.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className='py-20 bg-white dark:bg-slate-900'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6 text-center'>
          <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white mb-6'>Our Mission</h2>
          <p className='text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6'>
            We believe every person has stories worth sharing — but the tools to share them well shouldn&apos;t require years of SEO expertise, design skills, or a publishing budget. NexBlog AI makes world-class content creation accessible to everyone.
          </p>
          <p className='text-slate-600 dark:text-slate-400 text-lg leading-relaxed'>
            By combining an elegant writing experience with powerful AI assistance, we help creators write smarter, publish faster, and grow their audience more effectively than ever before.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className='py-20 bg-slate-50 dark:bg-slate-950'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <div className='text-center mb-14'>
            <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white'>What we stand for</h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className='p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card'>
                <div className='w-12 h-12 gradient-brand rounded-2xl flex items-center justify-center mb-4 shadow-glow-sm'>
                  <Icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='font-heading text-xl font-semibold text-slate-900 dark:text-white mb-2'>{title}</h3>
                <p className='text-slate-500 dark:text-slate-400 leading-relaxed'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className='py-20 bg-white dark:bg-slate-900'>
        <div className='max-w-3xl mx-auto px-4 sm:px-6'>
          <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white text-center mb-14'>Our journey</h2>
          <div className='relative'>
            <div className='absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary-300 via-secondary-300 to-transparent' />
            <div className='space-y-10'>
              {milestones.map(({ year, event }) => (
                <div key={year} className='flex gap-6 items-start'>
                  <div className='relative flex-shrink-0 w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-glow-sm text-white text-xs font-bold font-heading text-center leading-tight'>
                    {year}
                  </div>
                  <div className='flex-1 pt-4'>
                    <p className='text-slate-700 dark:text-slate-300 leading-relaxed'>{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 bg-slate-50 dark:bg-slate-950'>
        <div className='max-w-3xl mx-auto px-4 text-center'>
          <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white mb-4'>Ready to join us?</h2>
          <p className='text-slate-500 dark:text-slate-400 mb-8'>Start writing with AI superpowers today. It&apos;s free forever.</p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/sign-up' className='btn-primary px-8 py-4 text-base justify-center' id='about-cta-btn'>
              Start for free <HiArrowRight className='w-4 h-4' />
            </Link>
            <Link to='/search' className='btn-secondary px-8 py-4 text-base justify-center dark:text-primary-300 dark:border-primary-700'>
              Explore articles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}