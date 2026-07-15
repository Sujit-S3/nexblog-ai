import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import {
  HiChartPie, HiUser, HiDocumentText, HiOutlineUserGroup,
  HiAnnotation, HiLogout, HiPencil, HiSparkles,
} from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const t = urlParams.get('tab');
    if (t) setTab(t);
  }, [location.search]);

  const handleSignout = async () => {
    try {
      await apiClient.post('/api/user/signout');
      dispatch(signoutSuccess());
    } catch (error) {
      console.error('Signout error:', error.message);
    }
  };

  const navItems = [
    ...(currentUser?.isAdmin ? [{ to: '?tab=dash', icon: HiChartPie, label: 'Overview', tab: 'dash' }] : []),
    { to: '?tab=profile', icon: HiUser, label: 'Profile', tab: 'profile', badge: currentUser?.isAdmin ? 'Admin' : 'User' },
    { to: '/ai-workspace', icon: HiSparkles, label: 'AI Studio', tab: 'ai-studio', badge: 'Flagship', isPath: true },
    ...(currentUser?.isAdmin ? [
      { to: '?tab=posts',    icon: HiDocumentText,     label: 'Posts',    tab: 'posts' },
      { to: '?tab=users',    icon: HiOutlineUserGroup, label: 'Users',    tab: 'users' },
      { to: '?tab=comments', icon: HiAnnotation,       label: 'Comments', tab: 'comments' },
    ] : []),
  ];

  const isActive = (itemTab, isPath) => isPath ? location.pathname === itemTab : (tab === itemTab || (!tab && itemTab === 'dash'));

  return (
    <nav className='h-full flex flex-col p-4'>
      {/* Branding */}
      <div className='flex items-center gap-2.5 px-4 py-3 mb-6'>
        <div className='w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-glow-sm'>
          <span className='text-white font-bold font-heading text-sm'>N</span>
        </div>
        <span className='font-heading font-bold text-slate-900 dark:text-white text-base'>
          NexBlog <span className='gradient-brand-text'>AI</span>
        </span>
      </div>

      {/* Nav Items */}
      <div className='flex-1 space-y-1.5'>
        {navItems.map(({ to, icon: Icon, label, tab: itemTab, badge, isPath }) => (
          <Link key={itemTab} to={isPath ? to : `/dashboard${to}`} id={`dash-nav-${itemTab}`}>
            <div className={`nexblog-sidebar-item ${isActive(isPath ? to : itemTab, isPath) ? 'active shadow-glass' : ''}`}>
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(isPath ? to : itemTab, isPath) ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
              <span className='flex-1 font-semibold text-sm'>{label}</span>
              {badge && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${badge === 'Flagship' ? 'gradient-brand text-white shadow-glow-sm' : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'}`}>
                  {badge}
                </span>
              )}
            </div>
          </Link>
        ))}

        {/* Create Post (admin only) */}
        {currentUser?.isAdmin && (
          <Link to='/create-post' id='dash-create-post-btn'>
            <div className='nexblog-sidebar-item mt-3 border border-primary-500/20 bg-primary-500/5 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 shadow-sm'>
              <HiPencil className='w-4 h-4 flex-shrink-0' />
              <span className='font-semibold text-sm'>New Article</span>
            </div>
          </Link>
        )}
      </div>

      {/* AI Badge */}
      <div className='my-4 p-4 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card'>
        <div className='flex items-center gap-2 mb-1.5'>
          <HiSparkles className='w-4 h-4 text-primary-500' />
          <span className='text-xs font-bold text-slate-900 dark:text-white'>AI Studio Credits</span>
        </div>
        <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-3'>Flagship multi-model generation suite ready.</p>
        <Link
          to="/ai-workspace"
          className="w-full py-2 px-3 rounded-xl gradient-brand text-white text-xs font-bold shadow-glow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Open AI Studio</span>
          <HiSparkles className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignout}
        className='nexblog-sidebar-item w-full text-red-500 hover:bg-red-500/10 hover:text-red-600 font-semibold text-sm transition-colors'
        id='dash-signout-btn'
      >
        <HiLogout className='w-4 h-4 flex-shrink-0' />
        <span>Sign Out</span>
      </button>
    </nav>
  );
}
