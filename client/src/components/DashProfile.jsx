import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart, updateSuccess, updateFailure,
  deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutSuccess,
} from '../redux/user/userSlice';
import { HiCamera, HiTrash, HiLogout, HiPencil, HiExclamation } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/apiClient';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImageFileUrl(URL.createObjectURL(file)); }
  };

  useEffect(() => {
    if (imageFile) uploadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const uploadImage = async () => {
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const uploadTask = uploadBytesResumable(ref(storage, fileName), imageFile);
    uploadTask.on('state_changed',
      (snapshot) => setImageFileUploadProgress(((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)),
      () => { setImageFileUploadError('File must be less than 2MB'); setImageFileUploadProgress(null); setImageFile(null); setImageFileUrl(null); setImageFileUploading(false); },
      () => { getDownloadURL(uploadTask.snapshot.ref).then((url) => { setImageFileUrl(url); setFormData({ ...formData, profilePicture: url }); setImageFileUploading(false); }); }
    );
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null); setUpdateUserSuccess(null);
    if (Object.keys(formData).length === 0) return setUpdateUserError('No changes made');
    if (imageFileUploading) return setUpdateUserError('Please wait for image upload');
    try {
      dispatch(updateStart());
      const data = await apiClient.put(`/api/user/update/${currentUser._id}`, formData);
      dispatch(updateSuccess(data));
      setUpdateUserSuccess('Profile updated successfully!');
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const data = await apiClient.delete(`/api/user/delete/${currentUser._id}`);
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      await apiClient.post('/api/user/signout');
      dispatch(signoutSuccess());
    } catch (error) {
      console.error('Signout error:', error.message);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6 animate-fade-in'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='font-heading text-2xl font-bold text-slate-900 dark:text-white'>Your Profile</h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-0.5'>Manage your personal information, avatar, and studio settings</p>
      </div>

      {/* Avatar & Profile Card */}
      <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-8 mb-6'>
        <div className='flex items-center gap-6 mb-6'>
          <div className='relative cursor-pointer group' onClick={() => filePickerRef.current.click()}>
            <input type='file' accept='image/*' aria-label='Change profile avatar' onChange={handleImageChange} ref={filePickerRef} hidden />
            {imageFileUploadProgress && (
              <CircularProgressbar
                value={imageFileUploadProgress || 0}
                text={`${imageFileUploadProgress}%`}
                strokeWidth={5}
                styles={{ root: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }, path: { stroke: '#4F46E5' } }}
              />
            )}
            <img
              src={imageFileUrl || currentUser.profilePicture}
              alt={currentUser.username}
              className={`w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-500/20 dark:ring-primary-500/30 shadow-md ${imageFileUploadProgress && imageFileUploadProgress < 100 ? 'opacity-50' : ''}`}
            />
            <div className='absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
              <HiCamera className='w-6 h-6 text-white' />
            </div>
          </div>
          <div>
            <p className='font-heading font-bold text-lg text-slate-900 dark:text-white'>@{currentUser.username}</p>
            <p className='text-sm text-slate-500 dark:text-slate-400'>{currentUser.email}</p>
            {currentUser.isAdmin && <span className='mt-1.5 inline-flex badge-primary text-xs font-semibold px-2.5 py-0.5 rounded-full'>✨ Admin Creator</span>}
          </div>
        </div>

        {imageFileUploadError && (
          <div role='alert' className='mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium'>
            {imageFileUploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4' id='profile-update-form'>
          <div>
            <label htmlFor='username' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Username</label>
            <input type='text' id='username' aria-label='Username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange} className='input-field pl-4 pr-4 py-3.5 shadow-glass' />
          </div>
          <div>
            <label htmlFor='email' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Email Address</label>
            <input type='email' id='email' aria-label='Email Address' placeholder='email' defaultValue={currentUser.email} onChange={handleChange} className='input-field pl-4 pr-4 py-3.5 shadow-glass' />
          </div>
          <div>
            <label htmlFor='password' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>New Password</label>
            <input type='password' id='password' aria-label='New Password' placeholder='Leave blank to keep current password' onChange={handleChange} className='input-field pl-4 pr-4 py-3.5 shadow-glass' />
          </div>
          <button type='submit' disabled={loading || imageFileUploading} className='btn-primary w-full justify-center py-3.5 text-base shadow-glow mt-2' id='profile-save-btn'>
            {loading ? 'Saving Changes…' : 'Save Profile Changes'}
          </button>
        </form>

        {updateUserSuccess && (
          <div role='status' className='mt-4 p-3.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-semibold'>
            ✓ {updateUserSuccess}
          </div>
        )}
        {(updateUserError || error) && (
          <div role='alert' className='mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-semibold'>
            ⚠️ {updateUserError || error}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {currentUser.isAdmin && (
        <div className='glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 mb-6'>
          <h3 className='font-heading font-bold text-sm text-slate-900 dark:text-white mb-4'>Studio Quick Actions</h3>
          <Link to='/create-post' id='profile-create-post-btn'
            className='flex items-center justify-between px-5 py-3.5 rounded-xl border border-primary-500/20 dark:border-primary-500/30 bg-primary-500/5 text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 transition-all text-sm font-semibold shadow-sm'>
            <span className='flex items-center gap-3'><HiPencil className='w-5 h-5' /> Write a new flagship article</span>
            <span>&rarr;</span>
          </Link>
        </div>
      )}

      {/* Danger Zone */}
      <div className='glass dark:glass-dark rounded-2xl border border-red-200/80 dark:border-red-900/40 shadow-card p-6'>
        <h3 className='font-heading font-bold text-sm text-red-600 dark:text-red-400 mb-4'>Danger Zone</h3>
        <div className='flex flex-col sm:flex-row gap-3'>
          <button
            onClick={() => setShowModal(true)}
            className='flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-semibold'
            id='delete-account-btn'
          >
            <HiTrash className='w-4 h-4' /> Delete Account
          </button>
          <button
            onClick={handleSignout}
            className='flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold'
            id='profile-signout-btn'
          >
            <HiLogout className='w-4 h-4' /> Sign Out
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm' onClick={() => setShowModal(false)}>
          <div className='glass dark:glass-dark rounded-2xl shadow-card-hover border border-slate-200/80 dark:border-slate-800 p-8 max-w-sm w-full mx-4 animate-fade-up' onClick={e => e.stopPropagation()}>
            <div className='w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4'>
              <HiExclamation className='w-7 h-7 text-red-600 dark:text-red-400' />
            </div>
            <h3 className='font-heading text-lg font-bold text-slate-900 dark:text-white text-center mb-2'>Delete Account</h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed'>
              This action is permanent and cannot be undone. All your posts, comments, and data will be permanently deleted.
            </p>
            <div className='flex gap-3'>
              <button onClick={() => setShowModal(false)} className='flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors' id='cancel-delete-btn'>
                Cancel
              </button>
              <button onClick={handleDeleteUser} className='flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm' id='confirm-delete-btn'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
