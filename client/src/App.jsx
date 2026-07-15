import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import ScrollToTop from './components/ScrollToTop';

// Lazy load all major route pages to drastically reduce initial JavaScript bundle size (<600KB)
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const UpdatePost = lazy(() => import('./pages/UpdatePost'));
const PostPage = lazy(() => import('./pages/PostPage'));
const Search = lazy(() => import('./pages/Search'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const AIWorkspace = lazy(() => import('./pages/AIWorkspace'));
const AIWorkflowStudio = lazy(() => import('./pages/AIWorkflowStudio'));

// Elegant Liquid Glass Loading Fallback during chunk transitions
function PageLoader() {
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center animate-fade-in'>
      <div className='w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-glow animate-pulse mb-4'>
        <span className='text-white font-bold font-heading text-xl'>AI</span>
      </div>
      <p className='text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide'>Loading AI Knowledge OS…</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/search' element={<Search />} />
          <Route element={<PrivateRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/ai-workspace' element={<AIWorkspace />} />
            <Route path='/ai-workflow-studio' element={<AIWorkflowStudio />} />
          </Route>
          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/update-post/:postId' element={<UpdatePost />} />
          </Route>
          <Route path='/post/:postSlug' element={<PostPage />} />
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
