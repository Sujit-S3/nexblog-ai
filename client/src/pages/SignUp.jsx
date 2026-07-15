import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { apiClient } from '../lib/apiClient';
import { HiEye, HiEyeOff, HiMail, HiLockClosed, HiUser, HiCheckCircle } from 'react-icons/hi';

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Letter', pass: /[a-zA-Z]/.test(password) },
    { label: 'Special char', pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];

  if (!password) return null;
  return (
    <div className='mt-3 space-y-2.5'>
      <div className='flex gap-1.5'>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-slate-200 dark:bg-slate-800'}`} />
        ))}
      </div>
      <div className='flex flex-wrap gap-2.5'>
        {checks.map(({ label, pass }) => (
          <span key={label} className={`inline-flex items-center gap-1 text-xs font-medium ${pass ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
            <HiCheckCircle className={`w-3.5 h-3.5 ${pass ? 'text-green-500' : 'text-slate-300 dark:text-slate-700'}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value.trim() });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) return setErrorMessage('Please fill out all required fields.');
    try {
      setLoading(true); setErrorMessage(null);
      const data = await apiClient.post('/api/auth/signup', formData);
      if (data.success === false) {
        setLoading(false);
        return setErrorMessage(data.message);
      }
      // Automatically log the user in right after account creation
      try {
        const loginData = await apiClient.post('/api/auth/signin', {
          email: formData.email,
          password: formData.password,
        });
        if (loginData && loginData._id) {
          dispatch(signInSuccess(loginData));
        }
      } catch (loginErr) {
        console.warn('Auto-login fallback:', loginErr.message);
      }
      setLoading(false);
      navigate('/ai-workspace');
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex pt-16'>
      {/* Left — Luxury Liquid Glass Brand Panel */}
      <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-16 py-24 gradient-brand'>
        <div className='absolute inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse-slow' />
          <div className='absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse-slow' style={{ animationDelay: '1s' }} />
        </div>
        <div className='relative z-10 max-w-lg'>
          <div className='flex items-center gap-3 mb-12'>
            <div className='w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-glass'>
              <span className='text-white font-bold font-heading text-xl'>N</span>
            </div>
            <span className='text-white font-heading font-bold text-2xl tracking-tight'>NexBlog AI</span>
          </div>
          <h1 className='text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-5 tracking-tight'>
            Start for free.<br /><span className='text-white/70'>Grow fast.</span>
          </h1>
          <p className='text-white/75 text-lg leading-relaxed mb-10'>
            Create your account to unlock 26 AI writing tools, real-time SEO intelligence, and beautiful custom publication themes.
          </p>
          <div className='space-y-4'>
            {['26 AI-powered writing & SEO assistants', 'Notion AI + Grammarly + Medium editor studio', 'Real-time SEO score & actionable recommendations', 'Liquid Glass custom publication themes'].map(f => (
              <div key={f} className='flex items-center gap-3.5 text-white/90'>
                <div className='w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/30'>
                  <HiCheckCircle className='w-3.5 h-3.5 text-white' />
                </div>
                <span className='text-sm font-medium'>{f}</span>
              </div>
            ))}
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

          <h2 className='font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2'>Create free account</h2>
          <p className='text-slate-500 dark:text-slate-400 text-sm mb-8'>Free forever. No credit card required.</p>

          {errorMessage && (
            <div role='alert' className='mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5 animate-fade-in'>
              <span className='mt-0.5 text-base'>⚠️</span>
              <span className='font-medium'>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5' id='signup-form'>
            {/* Username */}
            <div>
              <label htmlFor='username' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                Username
              </label>
              <div className='relative'>
                <HiUser className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                <input
                  type='text'
                  id='username'
                  placeholder='yourhandle'
                  className='input-field pl-11 pr-4 py-3.5'
                  onChange={handleChange}
                  required
                  aria-label='Username'
                  autoComplete='username'
                />
              </div>
              <p className='text-xs text-slate-400 mt-1.5 font-medium'>7-20 lowercase letters and numbers only</p>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>
                Password
              </label>
              <div className='relative'>
                <HiLockClosed className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  placeholder='Create a strong password'
                  className='input-field pl-11 pr-12 py-3.5'
                  onChange={handleChange}
                  required
                  aria-label='Password'
                  autoComplete='new-password'
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
              <PasswordStrength password={formData.password || ''} />
            </div>

            <button type='submit' disabled={loading} className='btn-primary w-full justify-center py-3.5 text-base font-semibold shadow-glow mt-2' id='signup-submit-btn'>
              {loading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z'/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <div className='relative my-7'>
            <div className='absolute inset-0 flex items-center'><div className='w-full border-t border-slate-200 dark:border-slate-800' /></div>
            <div className='relative flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400 bg-surface dark:bg-surface-dark px-4'>
              Or continue with
            </div>
          </div>

          <OAuth />

          <p className='mt-8 text-center text-sm text-slate-500 dark:text-slate-400'>
            Already have an account?{' '}
            <Link to='/sign-in' className='font-semibold text-primary-600 dark:text-primary-400 hover:underline'>
              Sign in
            </Link>
          </p>
          <p className='mt-4 text-center text-xs text-slate-400 leading-relaxed'>
            By creating an account, you agree to our{' '}
            <a href='#' className='text-primary-500 hover:underline'>Terms</a> and{' '}
            <a href='#' className='text-primary-500 hover:underline'>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
