import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { BsGoogle } from 'react-icons/bs';
import { apiClient } from '../lib/apiClient';

export default function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const data = await apiClient.post('/api/auth/google', {
        name: result.user.displayName,
        email: result.user.email,
        googlePhotoUrl: result.user.photoURL,
      });
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  return (
    <button
      type='button'
      onClick={handleGoogleClick}
      id='google-oauth-btn'
      className='w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-surface dark:bg-surface-dark text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md'
    >
      <BsGoogle className='w-4 h-4 text-primary-600 dark:text-primary-400' />
      Continue with Google
    </button>
  );
}
