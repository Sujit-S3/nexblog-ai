import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle, HiTrash, HiShieldCheck } from 'react-icons/hi';
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
          <button onClick={onConfirm} className='flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm' id='confirm-delete-user-btn'>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');

  useEffect(() => {
    if (!currentUser.isAdmin) return;
    const fetchUsers = async () => {
      try {
        const data = await apiClient.get('/api/user/getusers');
        setUsers(data.users || []);
        if (data.users?.length < 9) setShowMore(false);
      } catch (error) { console.error('Fetch users error:', error.message); }
    };
    fetchUsers();
  }, [currentUser._id, currentUser.isAdmin]);

  const handleShowMore = async () => {
    try {
      const data = await apiClient.get(`/api/user/getusers?startIndex=${users.length}`);
      setUsers(prev => [...prev, ...(data.users || [])]);
      if (data.users?.length < 9) setShowMore(false);
    } catch (error) { console.error('Show more users error:', error.message); }
  };

  const handleDeleteUser = async () => {
    try {
      await apiClient.delete(`/api/user/delete/${userIdToDelete}`);
      setUsers(prev => prev.filter(u => u._id !== userIdToDelete));
      setShowModal(false);
    } catch (error) { console.error('Delete user error:', error.message); }
  };

  return (
    <div className='p-6 animate-fade-in'>
      <div className='mb-6'>
        <h1 className='font-heading text-2xl font-bold text-slate-900 dark:text-white'>Community Members</h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>{users.length} registered creator{users.length !== 1 ? 's' : ''} in the NexBlog AI network</p>
      </div>

      {currentUser.isAdmin && users.length > 0 ? (
        <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Creator</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Email</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Joined</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Role</th>
                  <th className='text-left px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {users.map(user => (
                  <tr key={user._id} className='hover:bg-primary-500/5 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <img src={user.profilePicture} alt={user.username} className='w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700' />
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>@{user.username}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 font-medium text-slate-600 dark:text-slate-400'>{user.email}</td>
                    <td className='px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400'>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className='px-6 py-4'>
                      {user.isAdmin ? (
                        <span className='inline-flex items-center gap-1.5 badge-primary font-semibold px-3 py-1'><HiShieldCheck className='w-4 h-4' /> Admin</span>
                      ) : (
                        <span className='inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>Creator</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => { setShowModal(true); setUserIdToDelete(user._id); }}
                        aria-label={`Delete user ${user.username}`}
                        className='p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all'
                        id={`delete-user-${user._id}`}
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
              <button onClick={handleShowMore} className='text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline' id='load-more-users-btn'>
                Load more community members →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className='text-center py-24 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800'>
          <p className='text-slate-500 dark:text-slate-400 font-medium'>No community members discovered.</p>
        </div>
      )}

      {showModal && (
        <ConfirmModal
          message='Are you sure you want to delete this creator? This action cannot be undone and will remove their access.'
          onConfirm={handleDeleteUser}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
