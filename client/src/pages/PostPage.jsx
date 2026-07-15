import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { HiArrowLeft, HiClock, HiCalendar, HiTag, HiSparkles } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/api/post/getposts?slug=${postSlug}`);
        setPost(data.posts[0]); setLoading(false);
      } catch { setError(true); setLoading(false); }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const data = await apiClient.get('/api/post/getposts?limit=3');
        setRecentPosts(data.posts);
      } catch {
        // Recent posts are a non-critical enhancement; ignore failures.
      }
    };
    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen pt-16 flex items-center justify-center bg-background dark:bg-background-dark'>
        <div className='text-center'>
          <div className='w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow'>
            <HiSparkles className='w-8 h-8 text-white' />
          </div>
          <p className='text-slate-400 text-sm'>Loading article…</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className='min-h-screen pt-16 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-slate-500 dark:text-slate-400'>Article not found.</p>
          <Link to='/' className='btn-primary mt-4 inline-flex'>Go Home</Link>
        </div>
      </div>
    );
  }

  const readingTime = Math.max(1, Math.ceil(post.content.length / 1000));

  return (
    <main className='min-h-screen pt-16 bg-background dark:bg-background-dark'>
      {/* Back Navigation */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4'>
        <Link to='/' className='inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
          <HiArrowLeft className='w-4 h-4' /> Back to articles
        </Link>
      </div>

      {/* Article Header */}
      <header className='max-w-4xl mx-auto px-4 sm:px-6 pb-8'>
        {/* Category */}
        <Link to={`/search?category=${post.category}`}
          className='inline-flex items-center gap-1.5 badge-primary mb-4' id='post-category-badge'>
          <HiTag className='w-3 h-3' /> {post.category}
        </Link>

        {/* Title */}
        <h1 className='font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6'>
          {post.title}
        </h1>

        {/* Meta */}
        <div className='flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400'>
          <div className='flex items-center gap-1.5'>
            <HiCalendar className='w-4 h-4' />
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className='flex items-center gap-1.5'>
            <HiClock className='w-4 h-4' />
            {readingTime} min read
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.image && (
        <div className='max-w-5xl mx-auto px-4 sm:px-6 pb-10'>
          <div className='rounded-3xl overflow-hidden shadow-card-hover'>
            <img
              src={post.image}
              alt={post.title}
              className='w-full max-h-[560px] object-cover'
            />
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className='max-w-3xl mx-auto px-4 sm:px-6 pb-16'>
        <article
          className='post-content'
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* AI Notice */}
        <div className='mt-12 p-5 ai-panel rounded-2xl flex items-start gap-4'>
          <div className='w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0'>
            <HiSparkles className='w-4 h-4 text-white' />
          </div>
          <div>
            <p className='font-heading font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1'>AI-Enhanced Content</p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              This article was written on NexBlog AI — a platform that helps creators produce better content with AI assistance.{' '}
              <Link to='/sign-up' className='text-primary-600 dark:text-primary-400 hover:underline'>Start writing for free →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className='max-w-3xl mx-auto px-4 sm:px-6 pb-16'>
        <CommentSection postId={post._id} />
      </div>

      {/* Recent Articles */}
      {recentPosts.length > 0 && (
        <section className='bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='font-heading text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center'>More articles you might like</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recentPosts.map(p => <PostCard key={p._id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
