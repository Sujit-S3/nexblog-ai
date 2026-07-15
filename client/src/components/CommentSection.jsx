import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { HiOutlineExclamationCircle, HiPaperAirplane } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm' onClick={onCancel}>
      <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-card-hover border border-slate-100 dark:border-slate-800 p-8 max-w-sm w-full mx-4 animate-fade-up' onClick={e => e.stopPropagation()}>
        <div className='w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4'>
          <HiOutlineExclamationCircle className='w-7 h-7 text-red-600 dark:text-red-400' />
        </div>
        <h3 className='font-heading text-lg font-bold text-slate-900 dark:text-white text-center mb-2'>Delete Comment</h3>
        <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6'>{message}</p>
        <div className='flex gap-3'>
          <button onClick={onCancel} className='flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'>Cancel</button>
          <button onClick={onConfirm} className='flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors' id='confirm-delete-comment-section-btn'>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) return;
    try {
      const data = await apiClient.post('/api/comment/create', { content: comment, postId, userId: currentUser._id });
      setComment(''); setCommentError(null); setComments([data, ...comments]);
    } catch (error) { setCommentError(error.message); }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const data = await apiClient.get(`/api/comment/getPostComments/${postId}`);
        setComments(data);
      } catch (error) { console.error(error.message); }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) { navigate('/sign-in'); return; }
      const data = await apiClient.put(`/api/comment/likeComment/${commentId}`);
      setComments(comments.map(c => c._id === commentId ? { ...c, likes: data.likes, numberOfLikes: data.likes.length } : c));
    } catch (error) { console.error(error.message); }
  };

  const handleEdit = (comment, editedContent) => {
    setComments(comments.map(c => c._id === comment._id ? { ...c, content: editedContent } : c));
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) { navigate('/sign-in'); return; }
      await apiClient.delete(`/api/comment/deleteComment/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) { console.error(error.message); }
  };

  return (
    <section className='mt-8'>
      {/* Section Header */}
      <div className='flex items-center gap-2 mb-6'>
        <h3 className='font-heading text-lg font-bold text-slate-900 dark:text-white'>Discussion</h3>
        {comments.length > 0 && (
          <span className='badge-primary'>{comments.length}</span>
        )}
      </div>

      {/* Auth Prompt */}
      {!currentUser ? (
        <div className='p-5 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 mb-6'>
          <p className='text-sm text-slate-700 dark:text-slate-300'>
            <Link to='/sign-in' className='font-semibold text-primary-600 dark:text-primary-400 hover:underline'>Sign in</Link>{' '}
            to join the discussion and share your thoughts.
          </p>
        </div>
      ) : (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400'>
            <img src={currentUser.profilePicture} alt={currentUser.username} className='w-6 h-6 rounded-lg object-cover' />
            <span>Commenting as <Link to='/dashboard?tab=profile' className='font-semibold text-primary-600 dark:text-primary-400 hover:underline'>@{currentUser.username}</Link></span>
          </div>
          <form onSubmit={handleSubmit} id='comment-form'>
            <div className='relative'>
              <textarea
                rows='3'
                placeholder='Share your thoughts on this article…'
                maxLength='200'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='input-field resize-none pr-12'
                id='comment-textarea'
              />
              <button type='submit' className='absolute bottom-3 right-3 p-2 rounded-lg gradient-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50'
                disabled={!comment.trim()} id='submit-comment-btn'>
                <HiPaperAirplane className='w-4 h-4 rotate-90' />
              </button>
            </div>
            <p className='text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-right'>{200 - comment.length} characters remaining</p>
            {commentError && (
              <p className='text-xs text-red-500 mt-1.5'>⚠️ {commentError}</p>
            )}
          </form>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-slate-400 text-sm'>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className='divide-y divide-slate-100 dark:divide-slate-800'>
          {comments.map(c => (
            <Comment
              key={c._id}
              comment={c}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={(id) => { setShowModal(true); setCommentToDelete(id); }}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ConfirmModal
          message='Are you sure you want to delete this comment?'
          onConfirm={() => handleDelete(commentToDelete)}
          onCancel={() => setShowModal(false)}
        />
      )}
    </section>
  );
}
