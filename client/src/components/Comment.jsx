import moment from 'moment';
import { useEffect, useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { HiPencil, HiTrash } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { apiClient } from '../lib/apiClient';

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await apiClient.get(`/api/user/${comment.userId}`);
        setUser(data);
      } catch (error) { console.error(error.message); }
    };
    getUser();
  }, [comment]);

  const handleSave = async () => {
    try {
      await apiClient.put(`/api/comment/editComment/${comment._id}`, { content: editedContent });
      setIsEditing(false); onEdit(comment, editedContent);
    } catch (error) { console.error(error.message); }
  };

  const liked = currentUser && comment.likes.includes(currentUser._id);

  return (
    <div className='flex gap-3 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0'>
      <img
        src={user.profilePicture}
        alt={user.username}
        className='w-9 h-9 rounded-xl object-cover flex-shrink-0'
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          <span className='font-semibold text-xs text-slate-800 dark:text-slate-200'>@{user.username || 'anonymous'}</span>
          <span className='text-xs text-slate-400'>{moment(comment.createdAt).fromNow()}</span>
        </div>

        {isEditing ? (
          <div className='space-y-3'>
            <textarea
              className='input-field resize-none text-sm'
              rows='3'
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className='flex gap-2'>
              <button onClick={handleSave} className='btn-primary text-xs px-4 py-2' id={`save-edit-comment-${comment._id}`}>Save</button>
              <button onClick={() => setIsEditing(false)} className='btn-ghost text-xs px-4 py-2 text-slate-500'>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p className='text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2'>{comment.content}</p>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => onLike(comment._id)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-primary-500'}`}
                id={`like-comment-${comment._id}`}
              >
                <FaThumbsUp className={`w-3 h-3 ${liked ? 'text-primary-500' : ''}`} />
                {comment.numberOfLikes > 0 && comment.numberOfLikes}
              </button>
              {currentUser && (currentUser._id === comment.userId || currentUser.isAdmin) && (
                <>
                  <button onClick={() => setIsEditing(true)} className='flex items-center gap-1 text-xs text-slate-400 hover:text-primary-500 transition-colors' id={`edit-comment-${comment._id}`}>
                    <HiPencil className='w-3 h-3' /> Edit
                  </button>
                  <button onClick={() => onDelete(comment._id)} className='flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors' id={`delete-comment-inline-${comment._id}`}>
                    <HiTrash className='w-3 h-3' /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
