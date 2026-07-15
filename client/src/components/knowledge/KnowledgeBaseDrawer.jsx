import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Upload, Globe, FileText, Trash2, CheckCircle2, AlertCircle, Loader2, X, Tag } from 'lucide-react';

export default function KnowledgeBaseDrawer({ isOpen, onClose, onSelectDocument, selectedDocId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'url' | 'paste'
  
  // Form states
  const [fileInput, setFileInput] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/list-knowledge');
      if (res.ok) {
        const data = await res.json();
        if (data.success) setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load knowledge documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const handleFileUploadChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleSubmitIngestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      let payload = {};

      if (activeTab === 'file' && fileInput) {
        const ext = fileInput.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });
        reader.readAsDataURL(fileInput);
        const base64Data = await base64Promise;

        payload = {
          title: fileInput.name,
          source: `Upload (${ext.toUpperCase()})`,
          fileType: ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'md',
          fileBase64: base64Data,
        };
      } else if (activeTab === 'url' && urlInput.trim()) {
        payload = {
          sourceUrl: urlInput.trim(),
          source: 'Web Scrape',
          fileType: 'url',
        };
      } else if (activeTab === 'paste' && pasteContent.trim()) {
        payload = {
          title: pasteTitle.trim() || 'Pasted Knowledge Snippet',
          source: 'Direct Paste',
          fileType: 'txt',
          rawTextInput: pasteContent.trim(),
        };
      } else {
        throw new Error('Please complete all required fields before indexing.');
      }

      const res = await fetch('/api/ai/ingest-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to ingest document into knowledge base.');
      }

      // Reset fields
      setFileInput(null);
      setUrlInput('');
      setPasteTitle('');
      setPasteContent('');
      fetchDocuments();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this knowledge source and all its vector embeddings?')) return;
    try {
      const res = await fetch(`/api/ai/delete-knowledge/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d._id !== docId));
        if (selectedDocId === docId && onSelectDocument) onSelectDocument(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white tracking-wide">Knowledge Base (RAG)</h3>
                  <p className="text-xs text-slate-400">Index sources for hybrid vector grounded writing</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingestion Tabs */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${activeTab === 'file' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <Upload className="w-3.5 h-3.5" /> File Upload
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${activeTab === 'url' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <Globe className="w-3.5 h-3.5" /> Scrape URL
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`py-2 rounded-md flex items-center justify-center gap-1.5 transition ${activeTab === 'paste' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Paste Text
                </button>
              </div>

              {/* Ingestion Form */}
              <form onSubmit={handleSubmitIngestion} className="mt-4 space-y-3">
                {activeTab === 'file' && (
                  <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 text-center transition bg-slate-900/40">
                    <input
                      type="file"
                      accept=".pdf,.docx,.md,.txt"
                      onChange={handleFileUploadChange}
                      className="hidden"
                      id="kb-file-upload"
                    />
                    <label htmlFor="kb-file-upload" className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <span className="text-sm font-medium text-slate-200 block">
                        {fileInput ? fileInput.name : 'Choose PDF, DOCX, MD, or TXT file'}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block">
                        Auto-chunks into ~250 word semantic vector blocks
                      </span>
                    </label>
                  </div>
                )}

                {activeTab === 'url' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Web Page URL</label>
                    <input
                      type="url"
                      placeholder="https://docs.example.com/guide/architecture"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {activeTab === 'paste' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Snippet Title (e.g., Q3 Technical Specs)"
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <textarea
                      placeholder="Paste clean text, facts, or raw notes here..."
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Indexing & Chunking...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" /> Index into Vector Knowledge Base
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Indexed Sources ({documents.length})</span>
                {selectedDocId && (
                  <button
                    onClick={() => onSelectDocument && onSelectDocument(null)}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Clear Active Grounding
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading vector knowledge...
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 px-4 border border-slate-800/80 rounded-xl bg-slate-900/30">
                  <Database className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-400">No knowledge sources indexed yet</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a document above to ground your AI writing</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDocId === doc._id;
                  return (
                    <div
                      key={doc._id}
                      className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                        isSelected
                          ? 'bg-purple-900/20 border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{doc.title}</span>
                            {doc.status === 'ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>{doc.source}</span>
                            <span>•</span>
                            <span>{doc.chunkCount} chunks</span>
                            <span>•</span>
                            <span>{(doc.metadata?.wordCount || 0).toLocaleString()} words</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onSelectDocument && onSelectDocument(isSelected ? null : doc._id, doc)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-purple-600/30 hover:text-purple-300'
                            }`}
                          >
                            {isSelected ? 'Active Grounding' : 'Use for Grounding'}
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Keywords */}
                      {doc.metadata?.keywords && doc.metadata.keywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/60">
                          <Tag className="w-3 h-3 text-slate-500 mr-1" />
                          {doc.metadata.keywords.slice(0, 6).map((kw, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-400 px-1.5 py-0.5 rounded">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Hybrid Cosine/Lexical Reranking Active
              </span>
              <span>{documents.length} sources total</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
