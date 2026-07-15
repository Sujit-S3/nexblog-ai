import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const PostCard = memo(function PostCard({ post }) {
  const readingTime = post.content ? Math.max(1, Math.ceil(post.content.length / 1000)) : 1;
  const categoryColor = {
    javascript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    reactjs:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    nextjs:     'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <article className='group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-card card-hover overflow-hidden flex flex-col'>
      {/* Cover Image */}
      <Link to={`/post/${post.slug}`} className='block overflow-hidden aspect-[16/9]' id={`post-card-image-${post._id}`}>
        <img
          src={post.image}
          alt={post.title}
          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
        />
      </Link>

      {/* Content */}
      <div className='flex flex-col flex-1 p-5'>
        {/* Category + Reading Time */}
        <div className='flex items-center justify-between mb-3'>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor[post.category] || 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'}`}>
            {post.category}
          </span>
          <span className='text-xs text-slate-400 dark:text-slate-500'>{readingTime} min read</span>
        </div>

        {/* Title */}
        <h3 className='font-heading font-semibold text-base text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200'>
          <Link to={`/post/${post.slug}`} id={`post-card-title-${post._id}`}>{post.title}</Link>
        </h3>

        <div className='flex-1' />

        {/* Footer */}
        <div className='flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4'>
          <span className='text-xs text-slate-400'>
            {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Link
            to={`/post/${post.slug}`}
            className='text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1'
            id={`post-card-read-${post._id}`}
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
});

export default PostCard;
