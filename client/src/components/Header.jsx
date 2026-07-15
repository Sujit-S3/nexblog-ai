import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState, useRef } from 'react';
import { HiSearch, HiMoon, HiSun, HiMenuAlt3, HiX, HiChevronDown, HiUser, HiLogout, HiViewGrid, HiPencil } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';
import VersionBadge from './common/VersionBadge';

// ─── Luxury Faceted Prism Logo ──────────────────────────────────────────────
function NexBlogLogo({ compact = false }) {
  return (
    <Link to='/' className='flex items-center gap-2.5 group' aria-label='AI Operating System Home'>
      <div className='relative w-9 h-9 rounded-2xl flex items-center justify-center gradient-brand shadow-glow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-105'>
        <div className='absolute inset-0.5 rounded-[14px] bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center'>
          <span className='text-white font-bold text-base font-heading tracking-tighter'>AI</span>
        </div>
      </div>
      {!compact && (
        <div className='flex items-center gap-2'>
          <span className='font-heading font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5'>
            Knowledge <span className='gradient-brand-text font-extrabold'>OS</span>
          </span>
          <VersionBadge />
        </div>
      )}
    </Link>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────
function ProfileDropdown({ currentUser, onSignout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(!open)}
        className='flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200'
        aria-label='Profile menu'
        id='profile-menu-btn'
      >
        <img
          src={currentUser.profilePicture}
          alt={currentUser.username}
          className='w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30 dark:ring-primary-400/40'
        />
        <HiChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute right-0 top-12 w-64 rounded-2xl shadow-card-hover border border-slate-200/80 dark:border-slate-800 glass dark:glass-dark overflow-hidden z-50 animate-fade-in'>
          {/* Header */}
          <div className='px-4 py-3.5 border-b border-slate-200/60 dark:border-slate-800'>
            <div className='flex items-center gap-3'>
              <img src={currentUser.profilePicture} alt={currentUser.username} className='w-10 h-10 rounded-full object-cover ring-2 ring-primary-500/20' />
              <div className='min-w-0'>
                <p className='font-semibold text-slate-900 dark:text-white text-sm truncate'>@{currentUser.username}</p>
                <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>{currentUser.email}</p>
              </div>
            </div>
            {currentUser.isAdmin && (
              <span className='mt-2.5 inline-block badge-primary text-xs font-semibold px-2.5 py-0.5 rounded-full'>
                ✨ Admin Workspace
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className='p-2 space-y-0.5'>
            <Link to='/dashboard?tab=profile' onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
              <HiUser className='w-4 h-4 text-slate-400' /> Profile & Settings
            </Link>
            <Link to='/ai-workspace' onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
              <span className='text-primary-500 font-bold'>✨</span> AI Workspace Studio
            </Link>
            <Link to='/ai-workflow-studio' onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
              <span className='text-accent-500 font-bold'>🔀</span> AI Workflow Studio
            </Link>
            <Link to='/dashboard?tab=dash' onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
              <HiViewGrid className='w-4 h-4 text-slate-400' /> SaaS Dashboard
            </Link>
            <Link to='/create-post' onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>
              <HiPencil className='w-4 h-4 text-slate-400' /> Write New Article
            </Link>
          </div>
          <div className='p-2 border-t border-slate-200/60 dark:border-slate-800'>
            <button
              onClick={() => { setOpen(false); onSignout(); }}
              className='flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors'
              id='signout-btn'
            >
              <HiLogout className='w-4 h-4' /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────
export default function Header() {
  const path = useLocation().pathname;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const s = urlParams.get('searchTerm');
    if (s) setSearchTerm(s);
  }, [location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignout = async () => {
    try {
      await apiClient.post('/api/user/signout');
      dispatch(signoutSuccess());
    } catch (error) {
      console.error('Signout error:', error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    params.set('searchTerm', searchTerm);
    navigate(`/search?${params.toString()}`);
    setSearchOpen(false);
  };

  const navLinks = currentUser
    ? [
        { to: '/ai-workspace', label: '✨ AI Workspace' },
        { to: '/ai-workflow-studio', label: '🔀 Workflow Studio' },
        { to: '/dashboard?tab=dash', label: '📊 Dashboard' },
        { to: '/search', label: 'Explore' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/search', label: 'Explore' },
      ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'glass dark:glass-dark shadow-card border-b border-white/30 dark:border-white/10'
        : 'bg-transparent backdrop-blur-xs'
    }`}>
      <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>

          {/* Logo */}
          <NexBlogLogo />

          {/* Desktop Nav Links */}
          <div className='hidden md:flex items-center gap-1.5'>
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  path === to
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className='flex items-center gap-2.5'>
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className='p-2.5 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              aria-label='Search articles and creators'
              id='search-toggle-btn'
            >
              <HiSearch className='w-5 h-5' />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className='p-2.5 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              aria-label='Toggle theme'
              id='theme-toggle-btn'
            >
              {theme === 'light' ? <HiMoon className='w-5 h-5 text-indigo-600' /> : <HiSun className='w-5 h-5 text-amber-400' />}
            </button>

            {/* Auth */}
            {currentUser ? (
              <ProfileDropdown currentUser={currentUser} onSignout={handleSignout} />
            ) : (
              <div className='hidden sm:flex items-center gap-2.5'>
                <Link to='/sign-in' id='sign-in-nav-btn'
                  className='px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'>
                  Sign In
                </Link>
                <Link to='/sign-up' id='get-started-nav-btn'
                  className='btn-primary text-xs px-4 py-2.5 shadow-glow-sm'>
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className='md:hidden p-2.5 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label='Toggle navigation menu'
              id='mobile-menu-btn'
            >
              {mobileOpen ? <HiX className='w-6 h-6' /> : <HiMenuAlt3 className='w-6 h-6' />}
            </button>
          </div>
        </div>

        {/* Search Bar (slide-down) */}
        {searchOpen && (
          <div className='py-3 pb-4 animate-fade-up'>
            <form onSubmit={handleSearch} className='relative max-w-2xl mx-auto'>
              <HiSearch className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
              <input
                id='header-search-input'
                type='text'
                placeholder='Search articles, topics, AI models, authors…'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='input-field pl-11 pr-4 py-3 shadow-glass'
                aria-label='Search articles'
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className='md:hidden pb-4 animate-fade-up border-t border-slate-200/60 dark:border-slate-800 pt-3'>
            <div className='flex flex-col gap-1.5'>
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    path === to
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {label}
                </Link>
              ))}
              {!currentUser && (
                <div className='flex gap-2.5 pt-3'>
                  <Link to='/sign-in' className='flex-1 text-center px-4 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300' onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to='/sign-up' className='flex-1 text-center btn-primary py-3' onClick={() => setMobileOpen(false)}>Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
