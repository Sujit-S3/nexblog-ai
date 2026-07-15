import { Link } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import { BsTwitterX, BsGithub, BsLinkedin, BsRss } from 'react-icons/bs';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/about' },
    { label: 'Explore', href: '/search' },
    { label: 'Pricing', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className='border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-12'>

          {/* Brand Column */}
          <div className='lg:col-span-2'>
            <Link to='/' className='flex items-center gap-2 group mb-4' aria-label='NexBlog AI'>
              <div className='w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-md'>
                <span className='text-white font-bold font-heading'>N</span>
              </div>
              <span className='font-heading font-bold text-lg text-slate-900 dark:text-white'>
                NexBlog <span className='gradient-brand-text'>AI</span>
              </span>
            </Link>
            <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mb-6'>
              Write smarter. Publish faster. NexBlog AI is the premium AI-powered blogging platform for modern creators.
            </p>

            {/* Newsletter */}
            <div>
              <p className='text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3'>
                Get AI writing tips
              </p>
              <form className='flex gap-2' onSubmit={(e) => e.preventDefault()}>
                <div className='relative flex-1'>
                  <HiMail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <input
                    type='email'
                    placeholder='you@example.com'
                    className='input-field pl-9 py-2.5 text-xs'
                    id='newsletter-email'
                  />
                </div>
                <button type='submit' className='btn-primary text-xs px-4 py-2.5 whitespace-nowrap'>
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className='font-heading font-semibold text-sm text-slate-900 dark:text-white mb-4'>{section}</h3>
              <ul className='space-y-3'>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href}
                      className='text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200'>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className='mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p className='text-sm text-slate-400 dark:text-slate-500'>
            © {new Date().getFullYear()} NexBlog AI. All rights reserved.
          </p>
          <div className='flex items-center gap-4'>
            {[
              { icon: BsTwitterX,  href: '#', label: 'Twitter' },
              { icon: BsGithub,    href: '#', label: 'GitHub' },
              { icon: BsLinkedin, href: '#', label: 'LinkedIn' },
              { icon: BsRss,       href: '#', label: 'RSS' },
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className='w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200'>
                <Icon className='w-4 h-4' />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
