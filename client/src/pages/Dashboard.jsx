import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) setTab(tabFromUrl);
  }, [location.search]);

  return (
    <div className='min-h-screen pt-16 flex flex-col md:flex-row bg-background dark:bg-background-dark'>
      {/* Sidebar */}
      <div className='md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'>
        <DashSidebar />
      </div>
      {/* Main Content */}
      <main className='flex-1 min-w-0'>
        {tab === 'profile'  && <DashProfile />}
        {tab === 'posts'    && <DashPosts />}
        {tab === 'users'    && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {(tab === 'dash' || !tab) && <DashboardComp />}
      </main>
    </div>
  );
}
