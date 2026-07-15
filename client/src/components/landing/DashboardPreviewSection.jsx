import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiChartBar, HiSparkles, HiArrowNarrowUp, HiUserGroup, HiDocumentText, HiEye, HiCurrencyDollar } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const VIEW_DATA = {
  weekly: {
    label: 'Weekly Studio Velocity',
    stats: [
      { label: 'Total Articles Published', value: '412', growth: '+28.4%', icon: HiDocumentText, color: 'from-primary-500 to-indigo-600' },
      { label: 'Organic SERP Impressions', value: '184.2K', growth: '+42.1%', icon: HiEye, color: 'from-emerald-500 to-teal-600' },
      { label: 'Active Network Readers', value: '18,490', growth: '+19.8%', icon: HiUserGroup, color: 'from-secondary-500 to-purple-600' },
      { label: 'Creator Ad Monetization', value: '$14,290', growth: '+34.0%', icon: HiCurrencyDollar, color: 'from-amber-500 to-orange-600' },
    ],
    bars: [65, 48, 82, 94, 75, 88, 100],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  monthly: {
    label: 'Monthly Enterprise Scale',
    stats: [
      { label: 'Total Articles Published', value: '1,840', growth: '+38.9%', icon: HiDocumentText, color: 'from-primary-500 to-indigo-600' },
      { label: 'Organic SERP Impressions', value: '892.5K', growth: '+64.2%', icon: HiEye, color: 'from-emerald-500 to-teal-600' },
      { label: 'Active Network Readers', value: '64,120', growth: '+31.5%', icon: HiUserGroup, color: 'from-secondary-500 to-purple-600' },
      { label: 'Creator Ad Monetization', value: '$68,410', growth: '+52.1%', icon: HiCurrencyDollar, color: 'from-amber-500 to-orange-600' },
    ],
    bars: [55, 70, 62, 85, 92, 78, 100],
    days: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7'],
  },
  efficiency: {
    label: 'AI Copilot Efficiency Index',
    stats: [
      { label: 'Draft Acceleration Rate', value: '5.2×', growth: '+410%', icon: HiSparkles, color: 'from-primary-500 to-indigo-600' },
      { label: 'Average SEO Optimization Score', value: '99.4/100', growth: '+14.2%', icon: HiChartBar, color: 'from-emerald-500 to-teal-600' },
      { label: 'Time Saved per Article', value: '3.8 hrs', growth: '+85.0%', icon: HiClock, color: 'from-secondary-500 to-purple-600' },
      { label: 'Grammar Verification Pass', value: '100%', growth: '+100%', icon: HiCheck, color: 'from-amber-500 to-orange-600' },
    ],
    bars: [80, 85, 88, 92, 95, 98, 100],
    days: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6', 'Sprint 7'],
  },
};

function HiClock(props) { return <HiChartBar {...props} />; }
function HiCheck(props) { return <HiSparkles {...props} />; }

export default function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState('weekly');
  const currentData = VIEW_DATA[activeTab];

  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
            <HiChartBar className="w-4 h-4 text-primary-500" />
            <span>Command Center Architecture</span>
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Real-Time Intelligence & <br />
            <span className="gradient-brand-text">Omni-Channel Analytics</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            Monitor article growth, SEO indexing velocity, and AI credit efficiency from your high-density Liquid Glass dashboard.
          </p>
        </div>

        {/* Interactive View Toggle Bar */}
        <div className="flex items-center justify-center mb-12">
          <div className="p-1.5 rounded-2xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card inline-flex gap-2">
            {[
              { id: 'weekly', label: 'Weekly Velocity' },
              { id: 'monthly', label: 'Monthly Enterprise Scale' },
              { id: 'efficiency', label: 'AI Efficiency Index' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === id
                    ? 'gradient-brand text-white shadow-glow-sm scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Tilted Dashboard Mockup Frame */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ perspective: 1400 }}
          className="relative max-w-6xl mx-auto"
        >
          <div className="absolute inset-0 gradient-brand opacity-10 rounded-3xl blur-3xl scale-95 pointer-events-none" />

          <div className="relative rounded-3xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card-hover p-6 sm:p-10 overflow-hidden">
            {/* Mockup Window Top Bar */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-400/80" />
                </div>
                <span className="ml-2 font-heading font-bold text-sm text-slate-800 dark:text-slate-200">
                  NexBlog AI Studio Command Center · {currentData.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge-primary text-xs font-bold px-3 py-1">Live Sync Active</span>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {currentData.stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                        <p className="font-heading text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                      <HiArrowNarrowUp className="w-4 h-4" />
                      <span>{stat.growth} vs previous timeframe</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Animated Spline Bar Chart Simulation */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-card">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-heading font-bold text-lg text-white mb-1">{currentData.label} Trajectory</h4>
                  <p className="text-xs text-slate-400 font-medium">Real-time telemetry gathered across your omni-channel syndication nodes</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping" />
                  <span className="text-xs font-bold text-primary-400">GPU Accelerated Visualizer</span>
                </div>
              </div>

              {/* Bars */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-slate-800 px-2 sm:px-6">
                {currentData.bars.map((height, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                      className="w-full rounded-t-xl gradient-brand relative shadow-glow-sm group-hover:brightness-125 transition-all flex items-start justify-center pt-2"
                    >
                      <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {height}%
                      </span>
                    </motion.div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                      {currentData.days[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Dashboard CTA */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-sm">
                  <HiSparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ready to access your own custom AI analytics dashboard?
                </span>
              </div>
              <Link
                to="/sign-up"
                className="btn-primary px-8 py-3.5 text-sm font-bold shadow-glow flex items-center gap-2"
              >
                <span>Enter Studio Dashboard</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
