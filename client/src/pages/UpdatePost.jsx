import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiPhotograph, HiSparkles, HiClock, HiSave,
  HiOutlineBookOpen, HiCheckCircle, HiPlusCircle
} from 'react-icons/hi';
import { apiClient } from '../lib/apiClient';

// Editor Components
import AISidebar from '../components/editor/AISidebar';
import SEOPanel from '../components/editor/SEOPanel';
import SlashCommandMenu from '../components/editor/SlashCommandMenu';
import AIChatSidePanel from '../components/editor/AIChatSidePanel';

const CATEGORIES = [
  { value: 'uncategorized', label: 'Select a category' },
  { value: 'javascript',    label: 'JavaScript' },
  { value: 'reactjs',       label: 'React.js' },
  { value: 'nextjs',        label: 'Next.js' },
  { value: 'typescript',    label: 'TypeScript' },
  { value: 'devops',        label: 'DevOps' },
  { value: 'ai',            label: 'AI & Machine Learning' },
];

export default function UpdatePost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  // Editor features state
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'split', 'toc'
  const [isSlashOpen, setIsSlashOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [historySnapshots, setHistorySnapshots] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await apiClient.get(`/api/post/getposts?postId=${postId}`);
        if (data.posts && data.posts[0]) {
          setFormData(data.posts[0]);
        }
      } catch (error) {
        setPublishError(error.message || 'Failed to fetch article details.');
      }
    };
    if (postId) fetchPost();
  }, [postId]);

  // Autosave loop every 10 seconds for edits
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData._id && (formData.title || formData.content)) {
        localStorage.setItem(`nexblog_autosave_update_${formData._id}`, JSON.stringify(formData));
        const now = new Date();
        setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [formData]);

  const handleTakeSnapshot = () => {
    if (!formData.content) return;
    const snap = {
      id: Date.now(),
      title: formData.title || 'Untitled Snapshot',
      content: formData.content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistorySnapshots(prev => [snap, ...prev.slice(0, 4)]);
  };

  const handleUploadImage = async () => {
    try {
      if (!file) return setImageUploadError('Please select an image');
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const uploadTask = uploadBytesResumable(ref(storage, fileName), file);
      uploadTask.on('state_changed',
        (snapshot) => setImageUploadProgress(((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)),
        () => { setImageUploadError('Image upload failed'); setImageUploadProgress(null); },
        () => { getDownloadURL(uploadTask.snapshot.ref).then((url) => { setImageUploadProgress(null); setFormData({ ...formData, image: url }); }); }
      );
    } catch { setImageUploadError('Image upload failed'); setImageUploadProgress(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.put(`/api/post/updatepost/${formData._id}/${currentUser._id}`, formData);
      setPublishError(null);
      if (formData._id) localStorage.removeItem(`nexblog_autosave_update_${formData._id}`);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError(error.message || 'Something went wrong while updating.');
    }
  };

  // AI Helpers
  const handleApplyContent = (newHtml, isAppend) => {
    setFormData(prev => ({
      ...prev,
      content: isAppend ? `${prev.content || ''}${newHtml}` : newHtml,
    }));
    handleTakeSnapshot();
  };

  const handleApplyMeta = (seoTitle, metaDesc, _tags) => {
    setFormData(prev => ({
      ...prev,
      title: seoTitle || prev.title,
      metaDescription: metaDesc || prev.metaDescription,
    }));
  };

  const extractHeadings = (contentHtml) => {
    if (!contentHtml) return [];
    const matches = contentHtml.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi) || [];
    return matches.map((m, idx) => ({
      id: `heading-${idx}`,
      text: m.replace(/<[^>]*>/g, ''),
      level: m.startsWith('<h1') ? 1 : m.startsWith('<h2') ? 2 : 3,
    }));
  };

  const headings = extractHeadings(formData.content);
  const wordCount = formData.content
    ? formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className='min-h-screen pt-20 pb-24 bg-surface dark:bg-surface-dark'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Top Header Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200/60 dark:border-slate-800'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='font-heading text-3xl font-bold text-slate-900 dark:text-white'>Flagship Editor Studio (Edit Mode)</h1>
              <span className='badge-primary text-[10px] uppercase font-bold px-2 py-0.5'>Notion AI + Medium</span>
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2'>
              <span>Update article content, SEO metadata, and multi-model settings</span>
              {lastSaved && (
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <HiCheckCircle className="w-3.5 h-3.5" /> Auto-saved {lastSaved}
                </span>
              )}
            </p>
          </div>

          <div className='flex items-center gap-2.5'>
            <button
              type='button'
              onClick={() => setIsChatOpen(true)}
              className='gradient-brand text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-glow-sm hover:scale-105 transition-all'
            >
              <HiSparkles className='w-4 h-4 animate-pulse' />
              <span>AI Copilot</span>
            </button>
            <button
              type='button'
              onClick={() => setIsSlashOpen(true)}
              className='btn-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm border border-primary-500/30'
            >
              <HiPlusCircle className='w-4 h-4 text-primary-500' />
              <span>/ Quick Commands</span>
            </button>
            <button
              type='button'
              onClick={handleTakeSnapshot}
              className='btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5'
              title='Take Version Snapshot'
            >
              <HiSave className='w-4 h-4 text-slate-500' />
              <span className='hidden md:inline'>Snapshot</span>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-12 gap-8 items-start'>
          {/* Main Editor Column (8 cols) */}
          <div className='xl:col-span-8 space-y-6'>
            <form onSubmit={handleSubmit} className='space-y-6' id='update-post-form'>
              <div className='flex flex-col sm:flex-row gap-4'>
                <input
                  type='text'
                  placeholder='Post title…'
                  required
                  aria-label='Article Title'
                  className='input-field flex-1 text-lg font-heading font-semibold pl-4 pr-4 py-3.5 shadow-glass'
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <select
                  aria-label='Article Category'
                  className='input-field sm:w-56 pl-4 pr-8 py-3.5 font-medium shadow-glass'
                  value={formData.category || 'uncategorized'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Image Upload Box */}
              <div className='glass dark:glass-dark rounded-2xl p-5 shadow-card'>
                <div className='flex items-center gap-3 mb-3'>
                  <HiPhotograph className='w-5 h-5 text-primary-500' />
                  <span className='font-heading font-semibold text-sm text-slate-800 dark:text-slate-200'>Cover Image</span>
                </div>
                <div className='flex items-center gap-3'>
                  <input
                    type='file'
                    accept='image/*'
                    id='update-cover-image-input'
                    aria-label='Select cover image'
                    onChange={(e) => setFile(e.target.files[0])}
                    className='flex-1 text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-500/10 file:text-primary-600 dark:file:text-primary-400 hover:file:bg-primary-500/20 cursor-pointer transition-colors'
                  />
                  <button
                    type='button'
                    onClick={handleUploadImage}
                    disabled={!!imageUploadProgress}
                    className='btn-secondary px-5 py-2 text-xs font-semibold whitespace-nowrap flex items-center gap-2'
                    id='update-upload-image-btn'
                  >
                    {imageUploadProgress ? (
                      <div className='w-5 h-5'><CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress}%`} /></div>
                    ) : 'Upload Cover'}
                  </button>
                </div>
                {imageUploadError && <p className='text-xs font-medium text-red-500 mt-2'>{imageUploadError}</p>}
                {formData.image && (
                  <div className='mt-4 rounded-xl overflow-hidden shadow-md border border-slate-200/60 dark:border-slate-800'>
                    <img src={formData.image} alt='Cover preview' className='w-full max-h-64 object-cover' />
                  </div>
                )}
              </div>

              {/* Editor Tabs (Write / Split / TOC) */}
              <div className='glass dark:glass-dark rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden'>
                <div className='flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800'>
                  <div className='flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-xl'>
                    <button
                      type='button'
                      onClick={() => setActiveTab('editor')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Write & Edit
                    </button>
                    <button
                      type='button'
                      onClick={() => setActiveTab('split')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'split' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Split Preview
                    </button>
                    <button
                      type='button'
                      onClick={() => setActiveTab('toc')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'toc' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Outline ({headings.length})
                    </button>
                  </div>

                  <div className='text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-3'>
                    <span>📝 {wordCount} words</span>
                    <span>·</span>
                    <span>⏱️ {readingTime} min</span>
                  </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'editor' && (
                  <div className='p-1'>
                    <ReactQuill
                      theme='snow'
                      placeholder='Write your story or type / to launch AI quick commands…'
                      className='min-h-[460px]'
                      required
                      value={formData.content || ''}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                    />
                  </div>
                )}

                {activeTab === 'split' && (
                  <div className='grid grid-cols-1 md:grid-cols-2 min-h-[480px] divide-y md:divide-y-0 md:divide-x divide-slate-200/60 dark:divide-slate-800'>
                    <div className='p-2'>
                      <ReactQuill
                        theme='snow'
                        className='h-[420px]'
                        value={formData.content || ''}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                      />
                    </div>
                    <div className='p-6 bg-white/40 dark:bg-slate-950/40 overflow-y-auto max-h-[480px] prose dark:prose-invert max-w-none text-sm'>
                      <h2 className='text-2xl font-bold mb-4'>{formData.title || 'Untitled Draft'}</h2>
                      <div dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-slate-400">Preview content will appear here...</p>' }} />
                    </div>
                  </div>
                )}

                {activeTab === 'toc' && (
                  <div className='p-8 min-h-[460px] bg-white/40 dark:bg-slate-950/40 space-y-4'>
                    <h3 className='font-heading font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white'>
                      <HiOutlineBookOpen className='w-5 h-5 text-primary-500' />
                      <span>Article Table of Contents (Outline)</span>
                    </h3>
                    {headings.length > 0 ? (
                      <ul className='space-y-2 border-l-2 border-primary-500/30 pl-4'>
                        {headings.map((h, i) => (
                          <li key={i} className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${h.level === 2 ? 'pl-4' : h.level === 3 ? 'pl-8 text-xs' : ''}`}>
                            {h.text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-sm text-slate-500'>No H1/H2/H3 headings detected yet. Use the editor or `/ Quick Commands` to insert sections.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Snapshots Bar if any */}
              {historySnapshots.length > 0 && (
                <div className='glass dark:glass-dark rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 overflow-x-auto'>
                  <span className='text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0'>
                    <HiClock className='w-4 h-4 text-primary-500' /> History Snapshots:
                  </span>
                  <div className='flex items-center gap-2'>
                    {historySnapshots.map((s) => (
                      <button
                        key={s.id}
                        type='button'
                        onClick={() => setFormData({ ...formData, title: s.title, content: s.content })}
                        className='px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white text-xs font-semibold transition-all whitespace-nowrap'
                      >
                        Restore ({s.time})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {publishError && (
                <div role='alert' className='p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium'>
                  ⚠️ {publishError}
                </div>
              )}

              <button type='submit' className='btn-primary px-10 py-4 text-base font-semibold shadow-glow flex items-center gap-2' id='update-post-btn'>
                <HiSparkles className='w-5 h-5' />
                <span>Update Article & Save Changes</span>
              </button>
            </form>
          </div>

          {/* Right Column: AI Sidebar & SEO Panel (4 cols) */}
          <div className='xl:col-span-4 space-y-6'>
            <div className='sticky top-24 space-y-6'>
              <SEOPanel
                content={formData.content}
                title={formData.title}
                onOptimizeTitleMeta={() => {
                  apiClient.post('/api/ai/generate-meta', { topic: formData.title, content: formData.content })
                    .then(res => { if (res?.success) handleApplyMeta(res.seoTitle, res.metaDescription); });
                }}
              />

              <AISidebar
                content={formData.content}
                title={formData.title}
                onApplyContent={handleApplyContent}
                onApplyMeta={handleApplyMeta}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slash Command Popup Modal */}
      <SlashCommandMenu
        isOpen={isSlashOpen}
        onClose={() => setIsSlashOpen(false)}
        topic={formData.title || 'Flagship Architecture'}
        onInsertHtml={(html) => handleApplyContent(html, true)}
      />

      {/* Floating AI Copilot Action Button */}
      <button
        type='button'
        onClick={() => setIsChatOpen(true)}
        aria-label="Open AI Copilot Drawer"
        className='fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-2xl gradient-brand text-white font-extrabold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-white/20'
      >
        <HiSparkles className='w-5 h-5 animate-pulse' />
        <span className='text-sm'>AI Copilot</span>
      </button>

      {/* Slide-out AI Copilot Drawer */}
      <AIChatSidePanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentDraft={formData.content}
        currentTitle={formData.title}
        onInsertText={(text) => handleApplyContent(text.includes('<') ? text : `<p>${text.replace(/\n\n/g, '</p><p>')}</p>`, true)}
      />
    </main>
  );
}
