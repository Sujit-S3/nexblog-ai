import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiPencil, HiTrash } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm' onClick={onCancel}>
      <div className='glass dark:glass-dark rounded-2xl shadow-card-hover border border-slate-200/80 dark:border-slate-800 p-8 max-w-sm w-full mx-4 animate-fade-up' onClick={e => e.stopPropagation()}>
        <div className='w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4'>
          <HiOutlineExclamationCircle className='w-7 h-7 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='font-heading text-lg font-bold text-slate-900 dark:text-white text-center mb-2'>Confirm Deletion</h3>
        <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed'>{message}</p>
        <div className='flex gap-3'>
          <button onClick={onCancel} className='flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors'>Cancel</button>
          <button onClick={onConfirm} className='flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm' id='confirm-delete-post-btn'>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');

  useEffect(() => {
    if (!currentUser.isAdmin) return;
    const fetchPosts = async () => {
      try {
        const data = await apiClient.get(`/api/post/getposts?userId=${currentUser._id}`);
        setUserPosts(data.posts || []);
        if (data.posts?.length < 9) setShowMore(false);
      } catch (error) { console.error('Fetch posts error:', error.message); }
    };
    fetchPosts();
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    try {
      const data = await apiClient.get(`/api/post/getposts?userId=${currentUser._id}&startIndex=${userPosts.length}`);
      setUserPosts(prev => [...prev, ...(data.posts || [])]);
      if (data.posts?.length < 9) setShowMore(false);
    } catch (error) { console.error('Show more error:', error.message); }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      await apiClient.delete(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`);
      setUserPosts(prev => prev.filter(p => p._id !== postIdToDelete));
    } catch (error) { console.error('Delete post error:', error.message); }
  };

  return (
    <div className='p-6 animate-fade-in'>
      <div className='mb-6'>
        <h1 className='font-heading text-2xl font-bold text-slate-900 dark:text-white'>Published Articles & Drafts</h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>Manage, edit, or delete all your articles from your studio workspace</p>
      </div>

      {currentUser.isAdmin && userPosts.length > 0 ? (
        <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Post</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Category</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Updated</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {userPosts.map(post => (
                  <tr key={post._id} className='hover:bg-primary-500/5 transition-colors group'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <Link to={`/post/${post.slug}`}>
                          <img src={post.image} alt={post.title} className='w-14 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm border border-slate-200/60 dark:border-slate-800' />
                        </Link>
                        <Link to={`/post/${post.slug}`} className='font-semibold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 max-w-xs'>
                          {post.title}
                        </Link>
                      </div>
                    </td>
                    <td className='px-6 py-4'><span className='badge-primary font-semibold capitalize px-3 py-1'>{post.category}</span></td>
                    <td className='px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400'>{new Date(post.updatedAt).toLocaleDateString()}</td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <Link to={`/update-post/${post._id}`} aria-label={`Edit post ${post.title}`} id={`edit-post-${post._id}`}
                          className='p-2 rounded-xl text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-500/10 transition-all'>
                          <HiPencil className='w-4 h-4' />
                        </Link>
                        <button
                          onClick={() => { setShowModal(true); setPostIdToDelete(post._id); }}
                          aria-label={`Delete post ${post.title}`}
                          className='p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all'
                          id={`delete-post-${post._id}`}
                        >
                          <HiTrash className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showMore && (
            <div className='px-6 py-4 border-t border-slate-200/60 dark:border-slate-800'>
              <button onClick={handleShowMore} className='text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline' id='load-more-posts-btn'>
                Load more articles →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-24 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800'>
          <div className='w-16 h-16 gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-sm'>
            <span className='text-white text-2xl font-bold'>N</span>
          </div>
          <h3 className='font-heading font-semibold text-slate-800 dark:text-slate-200 mb-2'>No articles published yet</h3>
          <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>Start writing your first flagship article with AI assistance.</p>
          <Link to='/create-post' className='btn-primary px-6 py-3 text-sm inline-flex shadow-glow' id='dash-posts-create-btn'>Write Your First Article</Link>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          message='Are you sure you want to delete this article? This action is permanent and cannot be undone.'
          onConfirm={handleDeletePost}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
