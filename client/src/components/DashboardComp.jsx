import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  HiOutlineUserGroup, HiArrowNarrowUp, HiDocumentText,
  HiAnnotation, HiSparkles, HiLightningBolt, HiTrendingUp,
  HiPlusCircle, HiOutlineExternalLink
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { apiClient } from '../lib/apiClient';

function StatCard({ icon: Icon, color, label, value, growth, href, subtitle }) {
  return (
    <Link to={href} className='group block'>
      <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 hover:shadow-card-hover hover:border-primary-500/50 transition-all duration-300'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1'>{label}</p>
            <p className='font-heading text-3xl font-extrabold text-slate-900 dark:text-white'>{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform`}>
            <Icon className='w-6 h-6 text-white' />
          </div>
        </div>
        <div className='flex items-center justify-between text-xs'>
          <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold'>
            <HiArrowNarrowUp className='w-3.5 h-3.5' /> +{growth || 12}%
          </span>
          <span className='text-slate-400 font-medium'>{subtitle || 'vs last month'}</span>
        </div>
      </div>
    </Link>
  );
}

function DataTable({ title, href, children, icon: Icon }) {
  return (
    <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden flex flex-col'>
      <div className='flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60'>
        <div className='flex items-center gap-2'>
          {Icon && <Icon className='w-4 h-4 text-primary-500' />}
          <h3 className='font-heading font-bold text-sm text-slate-900 dark:text-white'>{title}</h3>
        </div>
        <Link to={href} className='text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1'>
          <span>See all</span> <HiOutlineExternalLink className='w-3 h-3' />
        </Link>
      </div>
      <div className='overflow-x-auto flex-1'>{children}</div>
    </div>
  );
}

export default function DashboardComp() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  // Simulated AI usage credits & telemetry
  const [aiCreditsUsed, setAiCreditsUsed] = useState(380);
  const totalAiCredits = 1000;
  const creditPercent = Math.round(((totalAiCredits - aiCreditsUsed) / totalAiCredits) * 100);

  useEffect(() => {
    if (!currentUser.isAdmin) return;
    const fetchAll = async () => {
      const [uRes, pRes, cRes] = await Promise.allSettled([
        apiClient.get('/api/user/getusers?limit=5'),
        apiClient.get('/api/post/getposts?limit=5'),
        apiClient.get('/api/comment/getcomments?limit=5'),
      ]);
      if (uRes.status === 'fulfilled') { setUsers(uRes.value.users); setTotalUsers(uRes.value.totalUsers); setLastMonthUsers(uRes.value.lastMonthUsers); }
      else console.error(uRes.reason?.message);
      if (pRes.status === 'fulfilled') { setPosts(pRes.value.posts); setTotalPosts(pRes.value.totalPosts); setLastMonthPosts(pRes.value.lastMonthPosts); }
      else console.error(pRes.reason?.message);
      if (cRes.status === 'fulfilled') { setComments(cRes.value.comments); setTotalComments(cRes.value.totalComments); setLastMonthComments(cRes.value.lastMonthComments); }
      else console.error(cRes.reason?.message);
    };
    fetchAll();
  }, [currentUser]);

  return (
    <div className='p-6 space-y-8 animate-fade-in'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800'>
        <div>
          <div className='flex items-center gap-2.5'>
            <h1 className='font-heading text-2xl font-extrabold text-slate-900 dark:text-white'>SaaS Command Center</h1>
            <span className='badge-primary text-[10px] uppercase font-bold px-2.5 py-0.5 shadow-sm'>Flagship V2</span>
          </div>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            Welcome back, <span className='font-bold text-slate-800 dark:text-slate-200'>@{currentUser.username}</span>. Here is your platform intelligence overview.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/ai-workspace')}
            className='btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sm border border-primary-500/30'
          >
            <HiSparkles className='w-4 h-4 text-primary-500' />
            <span>Open AI Studio</span>
          </button>
          <button
            onClick={() => navigate('/create-post')}
            className='btn-primary px-5 py-2 text-xs font-bold shadow-glow-sm flex items-center gap-2'
          >
            <HiPlusCircle className='w-4 h-4' />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        <StatCard
          icon={HiOutlineUserGroup} color='bg-gradient-to-br from-primary-500 to-primary-700'
          label='Total Workspace Users' value={totalUsers} growth={lastMonthUsers}
          href='/dashboard?tab=users' subtitle='Active Creators'
        />
        <StatCard
          icon={HiDocumentText} color='bg-gradient-to-br from-secondary-500 to-secondary-700'
          label='Published Articles' value={totalPosts} growth={lastMonthPosts}
          href='/dashboard?tab=posts' subtitle='Across categories'
        />
        <StatCard
          icon={HiAnnotation} color='bg-gradient-to-br from-accent-500 to-accent-600'
          label='Community Interactions' value={totalComments} growth={lastMonthComments}
          href='/dashboard?tab=comments' subtitle='Reader feedback'
        />
      </div>

      {/* Analytics Visualization & AI Telemetry Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* SVG Animated Spline Chart Card (8 cols) */}
        <div className='lg:col-span-8 glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 flex flex-col justify-between relative overflow-hidden'>
          <div className='flex items-center justify-between mb-6 z-10'>
            <div>
              <div className='flex items-center gap-2'>
                <HiTrendingUp className='w-5 h-5 text-primary-500' />
                <h3 className='font-heading font-bold text-base text-slate-900 dark:text-white'>Platform Reader Velocity & AI Generation Output</h3>
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>30-day continuous real-time synthetic traffic telemetry</p>
            </div>
            <span className='px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-emerald-500 animate-ping' /> Live Sync
            </span>
          </div>

          {/* SVG Spline Graph */}
          <div className='h-52 w-full relative z-10 my-2'>
            <svg viewBox='0 0 800 200' className='w-full h-full overflow-visible'>
              {/* Grid lines */}
              <line x1='0' y1='40' x2='800' y2='40' stroke='currentColor' className='text-slate-200 dark:text-slate-800' strokeDasharray='4 4' />
              <line x1='0' y1='100' x2='800' y2='100' stroke='currentColor' className='text-slate-200 dark:text-slate-800' strokeDasharray='4 4' />
              <line x1='0' y1='160' x2='800' y2='160' stroke='currentColor' className='text-slate-200 dark:text-slate-800' strokeDasharray='4 4' />

              {/* Area Gradient under curve */}
              <defs>
                <linearGradient id='splineGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#3b82f6' stopOpacity='0.35' />
                  <stop offset='100%' stopColor='#3b82f6' stopOpacity='0.0' />
                </linearGradient>
              </defs>
              <path
                d='M 0 170 C 120 150, 200 90, 320 110 C 440 130, 520 40, 640 60 C 740 80, 780 20, 800 30 L 800 200 L 0 200 Z'
                fill='url(#splineGradient)'
              />

              {/* Smooth Spline Curve */}
              <path
                d='M 0 170 C 120 150, 200 90, 320 110 C 440 130, 520 40, 640 60 C 740 80, 780 20, 800 30'
                fill='none'
                stroke='#3b82f6'
                strokeWidth='4'
                strokeLinecap='round'
                className='drop-shadow-md'
              />

              {/* Data points */}
              <circle cx='320' cy='110' r='6' className='fill-primary-500 stroke-white dark:stroke-slate-900 stroke-2' />
              <circle cx='640' cy='60' r='6' className='fill-primary-500 stroke-white dark:stroke-slate-900 stroke-2' />
              <circle cx='800' cy='30' r='6' className='fill-emerald-500 stroke-white dark:stroke-slate-900 stroke-2 animate-pulse' />
            </svg>
          </div>

          <div className='flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-500 z-10'>
            <span>Week 1 (Baseline)</span>
            <span>Week 2 (+18% SEO boost)</span>
            <span>Week 3 (+42% AI traffic)</span>
            <span className='text-primary-500'>Current (+64% Peak)</span>
          </div>
        </div>

        {/* AI Writing Credits Gauge & Quick Recharge (4 cols) */}
        <div className='lg:col-span-4 glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 flex flex-col justify-between'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-sm'>
                <HiSparkles className='w-4 h-4 text-white' />
              </div>
              <h3 className='font-heading font-bold text-sm text-slate-900 dark:text-white'>AI Telemetry & Quota</h3>
            </div>
            <span className='badge-primary text-[10px] uppercase font-bold'>Pro Tier</span>
          </div>

          {/* Circular Gauge */}
          <div className='flex items-center justify-center py-4'>
            <div className='w-36 h-36'>
              <CircularProgressbar
                value={creditPercent}
                text={`${totalAiCredits - aiCreditsUsed}`}
                styles={buildStyles({
                  textSize: '18px',
                  pathTransitionDuration: 1.2,
                  pathColor: creditPercent > 50 ? '#10b981' : creditPercent > 20 ? '#3b82f6' : '#f59e0b',
                  textColor: 'currentColor',
                  trailColor: 'rgba(148, 163, 184, 0.2)',
                })}
              />
            </div>
          </div>
          <p className='text-center text-xs font-bold text-slate-600 dark:text-slate-300 mb-4'>
            Available AI Word & Token Credits Remaining Today
          </p>

          <div className='space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800'>
            <div className='flex items-center justify-between text-xs font-medium text-slate-500'>
              <span>Generation Speed:</span>
              <span className='font-mono font-bold text-emerald-500'>Ultra-Fast (Edge)</span>
            </div>
            <div className='flex items-center justify-between text-xs font-medium text-slate-500'>
              <span>Neural Models:</span>
              <span className='font-mono font-bold text-slate-700 dark:text-slate-300'>Dual GPT-4o / Claude</span>
            </div>
            <button
              onClick={() => setAiCreditsUsed(Math.max(0, aiCreditsUsed - 200))}
              className='w-full mt-2 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-glow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2'
            >
              <HiLightningBolt className='w-4 h-4' />
              <span>Refill / Refresh AI Quota</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Tables Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Users */}
        <DataTable title='Recent Creators' href='/dashboard?tab=users' icon={HiOutlineUserGroup}>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                <th className='text-left px-5 py-3'>Creator Profile</th>
                <th className='text-left px-5 py-3'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {users.map(user => (
                <tr key={user._id} className='hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors'>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-3'>
                      <img src={user.profilePicture} alt={user.username} className='w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-primary-500/20' />
                      <div>
                        <p className='font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[110px]'>@{user.username}</p>
                        <p className='text-[10px] text-slate-400'>{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>

        {/* Recent Posts */}
        <DataTable title='Recent Flagship Posts' href='/dashboard?tab=posts' icon={HiDocumentText}>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                <th className='text-left px-5 py-3'>Article Title</th>
                <th className='text-left px-5 py-3'>Category</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {posts.map(post => (
                <tr key={post._id} className='hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors'>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center gap-3'>
                      <img src={post.image} alt={post.title} className='w-10 h-7 rounded-lg object-cover flex-shrink-0 shadow-sm' />
                      <span className='font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[140px]'>{post.title}</span>
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='badge-primary text-[10px] font-bold px-2 py-0.5 uppercase'>{post.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>

        {/* Recent Comments */}
        <DataTable title='Community Feedback' href='/dashboard?tab=comments' icon={HiAnnotation}>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                <th className='text-left px-5 py-3'>Comment Excerpt</th>
                <th className='text-left px-5 py-3'>Engagement</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {comments.map(comment => (
                <tr key={comment._id} className='hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors'>
                  <td className='px-5 py-3.5 max-w-[170px]'>
                    <p className='text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-snug'>{comment.content}</p>
                  </td>
                  <td className='px-5 py-3.5'>
                    <span className='flex items-center gap-1 text-xs font-bold text-primary-500'>
                      ❤️ {comment.numberOfLikes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      </div>
    </div>
  );
}
