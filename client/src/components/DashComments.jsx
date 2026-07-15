import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiTrash, HiHeart } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm' onClick={onCancel}>
      <div className='glass dark:glass-dark rounded-2xl shadow-card-hover border border-slate-200/80 dark:border-slate-800 p-8 max-w-sm w-full mx-4 animate-fade-up' onClick={e => e.stopPropagation()}>
        <div className='w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4'>
          <HiOutlineExclamationCircle className='w-7 h-7 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='font-heading text-lg font-bold text-slate-900 dark:text-white text-center mb-2'>Delete Comment</h3>
        <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6'>{message}</p>
        <div className='flex gap-3'>
          <button onClick={onCancel} className='flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'>Cancel</button>
          <button onClick={onConfirm} className='flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors' id='confirm-delete-comment-btn'>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');

  useEffect(() => {
    if (!currentUser.isAdmin) return;
    const fetchComments = async () => {
      try {
        const data = await apiClient.get('/api/comment/getcomments');
        setComments(data.comments); if (data.comments.length < 9) setShowMore(false);
      } catch (error) { console.error(error.message); }
    };
    fetchComments();
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    try {
      const data = await apiClient.get(`/api/comment/getcomments?startIndex=${comments.length}`);
      setComments(prev => [...prev, ...data.comments]); if (data.comments.length < 9) setShowMore(false);
    } catch (error) { console.error(error.message); }
  };

  const handleDeleteComment = async () => {
    setShowModal(false);
    try {
      await apiClient.delete(`/api/comment/deleteComment/${commentIdToDelete}`);
      setComments(prev => prev.filter(c => c._id !== commentIdToDelete));
    } catch (error) { console.error(error.message); }
  };

  return (
    <div className='p-6 animate-fade-in'>
      <div className='mb-6'>
        <h1 className='font-heading text-2xl font-bold text-slate-900 dark:text-white'>Comments</h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>{comments.length} comment{comments.length !== 1 ? 's' : ''} on your posts</p>
      </div>

      {currentUser.isAdmin && comments.length > 0 ? (
        <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>Comment</th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>Likes</th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>Date</th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {comments.map(comment => (
                  <tr key={comment._id} className='hover:bg-primary-500/5 transition-colors'>
                    <td className='px-6 py-4 max-w-xs'>
                      <p className='text-slate-700 dark:text-slate-300 line-clamp-2 text-sm font-medium'>{comment.content}</p>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-1.5 font-bold text-xs text-rose-500'>
                        <HiHeart className='w-4 h-4' />
                        <span>{comment.numberOfLikes}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400'>
                      {new Date(comment.updatedAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => { setShowModal(true); setCommentIdToDelete(comment._id); }}
                        className='p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all'
                        id={`delete-comment-${comment._id}`}
                      >
                        <HiTrash className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showMore && (
            <div className='px-6 py-4 border-t border-slate-200/60 dark:border-slate-800'>
              <button onClick={handleShowMore} className='text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline' id='load-more-comments-btn'>
                Load more comments →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-24 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800'>
          <p className='text-slate-400'>No comments found.</p>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          message='Are you sure you want to delete this comment? This cannot be undone.'
          onConfirm={handleDeleteComment}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
