import { Link } from 'react-router-dom';
import { HiArrowLeft, HiSparkles, HiHome } from 'react-icons/hi';

export default function NotFound() {
  return (
    <main className='min-h-screen flex items-center justify-center gradient-hero dark:gradient-hero-dark pt-16'>
      {/* Background Orbs */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-pulse-slow' />
        <div className='absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary-400/10 blur-3xl animate-pulse-slow' style={{ animationDelay: '1.5s' }} />
      </div>

      <div className='relative text-center px-4 animate-fade-up'>
        {/* Glowing 404 */}
        <div className='relative inline-block mb-8'>
          <span className='font-heading text-[160px] sm:text-[200px] font-black leading-none gradient-brand-text opacity-20 select-none'>
            404
          </span>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-24 h-24 gradient-brand rounded-3xl flex items-center justify-center shadow-glow-lg'>
              <HiSparkles className='w-12 h-12 text-white' />
            </div>
          </div>
        </div>

        <h1 className='font-heading text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4'>
          Page not found
        </h1>
        <p className='text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-md mx-auto'>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link to='/' id='404-home-btn' className='btn-primary px-8 py-4 text-base justify-center'>
            <HiHome className='w-4 h-4' /> Go home
          </Link>
          <button onClick={() => window.history.back()} id='404-back-btn' className='btn-secondary px-8 py-4 text-base justify-center dark:text-primary-300 dark:border-primary-700'>
            <HiArrowLeft className='w-4 h-4' /> Go back
          </button>
        </div>

        <p className='mt-10 text-xs text-slate-400 dark:text-slate-600'>
          If you think this is an error, please{' '}
          <a href='#' className='text-primary-500 hover:underline'>contact support</a>.
        </p>
      </div>
    </main>
  );
}
