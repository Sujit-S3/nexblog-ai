import { Link } from 'react-router-dom';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function CallToAction() {
  return (
    <div className='my-8 p-8 rounded-2xl gradient-brand text-white overflow-hidden relative'>
      {/* Background effect */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl' />
        <div className='absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-2xl' />
      </div>
      <div className='relative flex flex-col sm:flex-row items-center gap-6'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <HiSparkles className='w-4 h-4 text-white/70' />
            <span className='text-white/70 text-xs font-semibold uppercase tracking-wider'>NexBlog AI</span>
          </div>
          <h3 className='font-heading text-xl font-bold text-white mb-2'>
            Ready to write smarter?
          </h3>
          <p className='text-white/70 text-sm leading-relaxed'>
            Join NexBlog AI and use the power of artificial intelligence to write, optimize, and publish exceptional content.
          </p>
        </div>
        <div className='flex-shrink-0'>
          <Link
            to='/sign-up'
            className='inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold text-sm hover:bg-primary-50 transition-colors shadow-lg'
            id='cta-component-btn'
          >
            Get started free <HiArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </div>
  );
}
