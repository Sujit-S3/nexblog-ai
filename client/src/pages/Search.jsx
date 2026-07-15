import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { HiSearch, HiAdjustments, HiX, HiFilter } from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({ searchTerm: '', sort: 'desc', category: 'uncategorized' });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData(prev => ({ ...prev, searchTerm: searchTermFromUrl || '', sort: sortFromUrl || 'desc', category: categoryFromUrl || 'uncategorized' }));
    }
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get(`/api/post/getposts?${urlParams.toString()}`);
        setPosts(data.posts || []);
        setShowMore(data.posts?.length === 9);
      } catch (error) {
        console.error('Fetch posts error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData(prev => ({ ...prev, [id]: value || (id === 'sort' ? 'desc' : 'uncategorized') }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    params.set('searchTerm', sidebarData.searchTerm);
    params.set('sort', sidebarData.sort);
    params.set('category', sidebarData.category);
    navigate(`/search?${params.toString()}`);
    setFilterOpen(false);
  };

  const handleShowMore = async () => {
    const params = new URLSearchParams(location.search);
    params.set('startIndex', posts.length);
    try {
      const data = await apiClient.get(`/api/post/getposts?${params.toString()}`);
      setPosts(prev => [...prev, ...(data.posts || [])]);
      setShowMore(data.posts?.length === 9);
    } catch (error) {
      console.error('Show more error:', error);
    }
  };

  const categories = ['uncategorized', 'javascript', 'reactjs', 'nextjs', 'typescript', 'devops', 'ai'];

  const FilterForm = () => (
    <form onSubmit={handleSubmit} className='space-y-5' id='search-filter-form'>
      <div>
        <label htmlFor='searchTerm' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Keyword</label>
        <div className='relative'>
          <HiSearch className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
          <input
            type='text'
            id='searchTerm'
            placeholder='Search articles & topics…'
            aria-label='Search keyword'
            value={sidebarData.searchTerm || ''}
            onChange={handleChange}
            className='input-field pl-11 pr-4 py-3.5 shadow-glass'
          />
        </div>
      </div>
      <div>
        <label htmlFor='sort' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Sort by</label>
        <select id='sort' aria-label='Sort order' value={sidebarData.sort || 'desc'} onChange={handleChange} className='input-field pl-4 pr-8 py-3.5 font-medium shadow-glass'>
          <option value='desc'>Newest first</option>
          <option value='asc'>Oldest first</option>
        </select>
      </div>
      <div>
        <label htmlFor='category' className='block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'>Category</label>
        <div className='flex flex-wrap gap-2'>
          {categories.map(cat => (
            <button key={cat} type='button'
              onClick={() => setSidebarData(prev => ({ ...prev, category: cat }))}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 capitalize ${
                sidebarData.category === cat
                  ? 'bg-primary-600 text-white shadow-glow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <button type='submit' className='btn-primary w-full justify-center py-3.5 shadow-glow'>Apply Filters</button>
    </form>
  );

  return (
    <main className='min-h-screen pt-20 bg-surface dark:bg-surface-dark'>
      {/* Page Header */}
      <div className='border-b border-slate-200/60 dark:border-slate-800 glass dark:glass-dark py-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h1 className='font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2'>Explore AI Articles</h1>
          <p className='text-slate-500 dark:text-slate-400 text-sm font-medium'>
            {!loading && `${posts.length} article${posts.length !== 1 ? 's' : ''} matched your exploration`}
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex gap-8'>
          {/* Desktop Sidebar */}
          <aside className='hidden lg:block w-72 flex-shrink-0'>
            <div className='sticky top-24 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6'>
              <div className='flex items-center gap-2 mb-6'>
                <HiFilter className='w-5 h-5 text-primary-500' />
                <h2 className='font-heading font-bold text-base text-slate-900 dark:text-white'>Filter Exploration</h2>
              </div>
              <FilterForm />
            </div>
          </aside>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            {/* Mobile Filter Button */}
            <div className='lg:hidden mb-6'>
              <button onClick={() => setFilterOpen(!filterOpen)}
                className='flex items-center gap-2 btn-secondary px-5 py-3 shadow-sm' id='mobile-filter-btn'>
                <HiAdjustments className='w-5 h-5' />
                Filter Exploration
                {filterOpen && <HiX className='w-4 h-4 ml-1' />}
              </button>
              {filterOpen && (
                <div className='mt-4 glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 animate-fade-up'>
                  <FilterForm />
                </div>
              )}
            </div>

            {/* Results */}
            {loading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden glass dark:glass-dark'>
                    <div className='skeleton aspect-[16/9]' />
                    <div className='p-5 space-y-3'>
                      <div className='skeleton h-3 rounded-full w-1/4' />
                      <div className='skeleton h-5 rounded-lg' />
                      <div className='skeleton h-4 rounded-full w-3/4' />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className='text-center py-24 glass dark:glass-dark rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 max-w-lg mx-auto'>
                <div className='w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow'>
                  <HiSearch className='w-10 h-10 text-white' />
                </div>
                <h3 className='font-heading text-xl font-bold text-slate-800 dark:text-slate-200 mb-2'>No articles discovered</h3>
                <p className='text-slate-500 dark:text-slate-400 font-medium'>Try adjusting your search criteria or switching categories.</p>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {posts.map(post => <PostCard key={post._id} post={post} />)}
                </div>
                {showMore && (
                  <div className='text-center mt-12'>
                    <button onClick={handleShowMore} id='show-more-posts-btn'
                      className='btn-secondary px-10 py-3.5 font-semibold'>
                      Load More Articles
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
