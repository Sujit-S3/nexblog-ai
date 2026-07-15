import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { apiClient } from '../lib/apiClient';
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiSparkles } from 'react-icons/hi';

function FeaturePill({ text }) {
  return (
    <span className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/90 backdrop-blur-md border border-white/20 shadow-sm'>
      <HiSparkles className='w-3.5 h-3.5 text-accent-400' /> {text}
    </span>
  );
}

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value.trim() });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return dispatch(signInFailure('Please fill all required fields'));
    try {
      dispatch(signInStart());
      const data = await apiClient.post('/api/auth/signin', formData);
      if (data.success === false) return dispatch(signInFailure(data.message));
      dispatch(signInSuccess(data));
      navigate('/ai-workspace');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='min-h-screen flex pt-16'>
      {/* Left — Luxury Liquid Glass Brand Panel */}
      <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-brand flex-col justify-center px-16 py-24'>
        {/* Ambient Volumetric Lighting Orbs */}
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse-slow' />
          <div className='absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl animate-pulse-slow' style={{ animationDelay: '1.5s' }} />
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-secondary-400/10 blur-2xl' />
        </div>

        <div className='relative z-10 max-w-lg'>
          <div className='flex items-center gap-3 mb-12'>
            <div className='w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-glass'>
              <span className='text-white font-bold font-heading text-xl'>N</span>
            </div>
            <span className='text-white font-heading font-bold text-2xl tracking-tight'>NexBlog AI</span>
          </div>

          <h1 className='text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-5 tracking-tight'>
            Write smarter.<br />
            <span className='text-white/70'>Publish faster.</span>
          </h1>
          <p className='text-white/75 text-lg leading-relaxed mb-10'>
            Experience world-class AI content creation. Crafted with Liquid Glass depth, intelligent automation, and SEO precision.
          </p>
          <div className='flex flex-wrap gap-2.5 mb-14'>
            <FeaturePill text='26 AI Tools' />
            <FeaturePill text='Real-Time SEO Score' />
            <FeaturePill text='Liquid Glass Studio' />
            <FeaturePill text='Notion AI + Medium' />
          </div>

          {/* 3D Floating Glass Mockup Card */}
          <div className='glass rounded-2xl p-6 bg-white/15 border border-white/25 backdrop-blur-xl max-w-sm shadow-liquid animate-float'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <div className='w-2.5 h-2.5 rounded-full bg-rose-400/80 shadow-sm' />
                <div className='w-2.5 h-2.5 rounded-full bg-amber-400/80 shadow-sm' />
                <div className='w-2.5 h-2.5 rounded-full bg-emerald-400/80 shadow-sm' />
              </div>
              <span className='text-white/70 text-xs font-mono font-medium uppercase tracking-wider'>AI Copilot Active</span>
            </div>
            <div className='space-y-2.5'>
              <div className='h-2.5 bg-white/30 rounded-full w-4/5' />
              <div className='h-2.5 bg-white/30 rounded-full w-full' />
              <div className='h-2.5 bg-white/25 rounded-full w-3/5' />
              <div className='h-2.5 bg-accent-300/60 rounded-full w-2/5 animate-pulse' />
            </div>
          </div>
        </div>
      </div>

      {/* Right — Accessible Liquid Glass Auth Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center px-6 py-16 lg:px-16 bg-surface dark:bg-surface-dark'>
        <div className='w-full max-w-md animate-fade-up'>
          {/* Mobile Brand Header */}
          <div className='lg:hidden flex items-center gap-2.5 mb-10'>
            <div className='w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md'>
              <span className='text-white font-bold font-heading text-lg'>N</span>
            </div>
            <span className='font-heading font-bold text-xl text-slate-900 dark:text-white'>NexBlog <span className='gradient-brand-text'>AI</span></span>
          </div>

          <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2'>Welcome back</h2>
          <p className='text-slate-500 dark:text-slate-400 text-sm mb-8'>Sign in to continue to your AI workspace and studio</p>

          {errorMessage && (
            <div role='alert' className='mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5 animate-fade-in'>
              <span className='mt-0.5 text-base'>⚠️</span>
              <span className='font-medium'>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5' id='signin-form'>
            {/* Email Input */}
            <div>
              <label htmlFor='email' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <HiMail className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                <input
                  type='email'
                  id='email'
                  placeholder='you@example.com'
                  className='input-field pl-11 pr-4 py-3.5'
                  onChange={handleChange}
                  required
                  aria-label='Email Address'
                  autoComplete='email'
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <label htmlFor='password' className='block text-sm font-semibold text-slate-700 dark:text-slate-300'>
                  Password
                </label>
                <a href='#' className='text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline'>
                  Forgot password?
                </a>
              </div>
              <div className='relative'>
                <HiLockClosed className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  placeholder='Enter your password'
                  className='input-field pl-11 pr-12 py-3.5'
                  onChange={handleChange}
                  required
                  aria-label='Password'
                  autoComplete='current-password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1'
                >
                  {showPassword ? <HiEyeOff className='w-5 h-5' /> : <HiEye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className='flex items-center gap-2.5 cursor-pointer select-none pt-1'>
              <input
                type='checkbox'
                className='w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-colors'
                id='remember-me'
              />
              <span className='text-sm text-slate-600 dark:text-slate-400 font-medium'>Remember me for 30 days</span>
            </label>

            <button type='submit' disabled={loading} className='btn-primary w-full justify-center py-3.5 text-base font-semibold shadow-glow' id='signin-submit-btn'>
              {loading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z'/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In to Studio'}
            </button>
          </form>

          {/* Divider */}
          <div className='relative my-7'>
            <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-slate-200 dark:border-slate-800' /></div>
            <div className='relative flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400 bg-surface dark:bg-surface-dark px-4'>
              Or continue with
            </div>
          </div>

          <OAuth />

          <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400'>
            Don&apos;t have an account yet?{' '}
            <Link to='/sign-up' className='font-semibold text-primary-600 dark:text-primary-400 hover:underline'>
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
