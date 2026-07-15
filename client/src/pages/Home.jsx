import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';
import PostCard from '../components/PostCard';

// Flagship Landing Components
import SmoothScrollProvider from '../components/landing/SmoothScrollProvider';
import HeroSection from '../components/landing/HeroSection';
import TrustedMarquee from '../components/landing/TrustedMarquee';
import FeaturesSection from '../components/landing/FeaturesSection';
import InteractiveAIDemo from '../components/landing/InteractiveAIDemo';
import WorkflowSection from '../components/landing/WorkflowSection';
import DashboardPreviewSection from '../components/landing/DashboardPreviewSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';

// ─── Recent Articles Showcase ─────────────────────────────────────────
function RecentArticlesSection({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <div>
            <span className="badge-primary mb-4 inline-flex items-center gap-1.5">
              <HiSparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>Community & Editorial Feed</span>
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Flagship <span className="gradient-brand-text">Articles</span>
            </h2>
          </div>
          <Link
            to="/search"
            id="home-view-all-articles-link"
            className="btn-secondary px-6 py-3 text-sm font-bold flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Browse Full Library</span>
            <HiArrowRight className="w-4 h-4 text-primary-500" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Flagship CTA Banner ──────────────────────────────────────────────
function FlagshipCTABanner() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <section className="py-28 bg-surface dark:bg-surface-dark relative overflow-hidden border-t border-slate-200/60 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="relative rounded-3xl gradient-brand text-white p-12 sm:p-16 shadow-glow-lg overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/30">
              <HiSparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl font-black mb-6 leading-tight">
              Ready to experience the future of autonomous publishing?
            </h2>
            <p className="text-lg text-white/90 mb-10 font-medium leading-relaxed">
              Launch your free workspace right now. No credit card required. Instant access to our flagship AI drafting and Liquid Glass suite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={currentUser ? "/ai-workspace" : "/sign-up"}
                id="cta-banner-primary-btn"
                className="px-10 py-4 bg-white text-primary-700 rounded-2xl font-black text-base shadow-lg hover:bg-slate-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>{currentUser ? "✨ Open AI Studio Workspace" : "Launch Free Studio"}</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={currentUser ? "/ai-workflow-studio" : "/search"}
                className="px-8 py-4 bg-white/15 text-white rounded-2xl font-bold text-base hover:bg-white/25 transition-colors border border-white/30 backdrop-blur-md flex items-center justify-center"
              >
                <span>{currentUser ? "🔀 AI Workflow Studio" : "Read Creator Stories"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Flagship Home Page ──────────────────────────────────────────
export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiClient.get('/api/post/getPosts?limit=6');
        if (data && data.posts) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error('Failed to fetch home articles:', err.message);
      }
    };
    fetchPosts();
  }, []);

  return (
    <SmoothScrollProvider>
      <main className="min-h-screen bg-surface dark:bg-surface-dark text-slate-900 dark:text-white">
        <HeroSection />
        <TrustedMarquee />
        <FeaturesSection />
        <InteractiveAIDemo />
        <WorkflowSection />
        <DashboardPreviewSection />
        <RecentArticlesSection posts={posts} />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <FlagshipCTABanner />
      </main>
    </SmoothScrollProvider>
  );
}
