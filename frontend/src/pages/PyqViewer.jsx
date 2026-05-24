import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { ViewerSkeleton } from '../components/common/Skeleton.jsx';
import {
  Download,
  Bookmark,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  FileText,
  Copy,
  Check,
  Flag,
  X,
  Trash2
} from 'lucide-react';

export const PyqViewer = () => {
  const { paperId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDeletePaperDirect = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this question paper and all its extracted OCR questions? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/papers/${paperId}`);
      alert('Question paper deleted successfully.');
      // Redirect back to subject details page or catalog
      if (paper?.subject) {
        navigate(`/subject-details/${paper.subject._id}?name=${encodeURIComponent(paper.subject.name)}&code=${encodeURIComponent(paper.subject.code)}`);
      } else {
        navigate('/departments');
      }
    } catch (err) {
      console.error('Delete paper error', err);
      alert('Failed to delete paper');
    }
  };

  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Tabs on the right-hand panel
  const [activeRightTab, setActiveRightTab] = useState('structured'); // 'structured' or 'raw'
  const [copiedId, setCopiedId] = useState(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!paperId) return;

    const fetchPaperDetails = async () => {
      try {
        setLoading(true);
        // 1. Fetch paper details
        const res = await api.get(`/papers/${paperId}`);
        setPaper(res.data?.data?.paper);
        setQuestions(res.data?.data?.questions || []);

        // 2. If user is logged in, check if paper is bookmarked/saved
        if (user) {
          const sRes = await api.get('/saved');
          const savedPapers = sRes.data?.data || [];
          const matched = savedPapers.some(p => p._id === paperId);
          setIsSaved(matched);
        }
      } catch (err) {
        console.error('Failed to load paper details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaperDetails();
  }, [paperId, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      alert('Authentication required. Please log in to bookmark papers.');
      return;
    }

    try {
      const res = await api.post(`/saved/${paperId}`);
      setIsSaved(res.data.isSaved);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  const handleCopyQuestion = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRawText = () => {
    if (!paper?.extractedText) return;
    navigator.clipboard.writeText(paper.extractedText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Authentication required. Please log in to file a report.');
      return;
    }

    if (!reportReason) {
      alert('Please select a reason.');
      return;
    }

    try {
      setReportSubmitting(true);
      await api.post('/reports', {
        paperId,
        reason: reportReason,
        description: reportDesc
      });
      setReportSuccess(true);
      setReportReason('');
      setReportDesc('');
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error('Report submission failed', err);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return <ViewerSkeleton />;
  }

  if (!paper) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center px-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Paper Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested question paper does not exist or may have been deleted by administrators.
        </p>
        <Link to="/departments" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Safety filter for verifying PDF URL validity
  const isValidPdf = (url) => {
    return typeof url === 'string' && url.includes('http');
  };

  const embedUrl = paper.pdfUrl;

  return (
    <div className="space-y-6 py-4 px-2 sm:px-4 max-w-[1600px] mx-auto">
      {/* Dynamic Header Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        <div className="flex items-center gap-4 text-left w-full sm:w-auto">
          <Link
            to={`/subject-details/${paper.subject?._id}?name=${encodeURIComponent(paper.subject?.name)}&code=${encodeURIComponent(paper.subject?.code)}`}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-950 rounded-xl text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-850 dark:text-white leading-tight">
              {paper.subject?.name}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
              {paper.year} Exam | {paper.examType} | {paper.subject?.code} | Sem {paper.subject?.semester?.number}
            </p>
          </div>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto border-t border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:border-t-0">
          <button
            onClick={handleToggleBookmark}
            className={`h-11 px-4 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSaved
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/60'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          
          <button
            onClick={() => setReportModalOpen(true)}
            className="h-11 px-4 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Flag className="w-4 h-4" />
            <span>Report Error</span>
          </button>

          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="h-11 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>

          {user?.role === 'admin' && (
            <button
              onClick={handleDeletePaperDirect}
              className="h-11 px-4 bg-rose-600 hover:bg-rose-505 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md shadow-rose-600/10"
              title="Delete Paper"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Paper</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Grid viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)]">
        {/* Left Side Panel: PDF Embedded iframe */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-850 p-2 overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Full Paper View</span>
            </span>
            <span className="text-[10px] text-slate-400">PDF Reader mode</span>
          </div>
          <div className="flex-1 min-h-[500px] lg:min-h-0 relative bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden mt-2">
            {isValidPdf(embedUrl) ? (
              <iframe
                src={`${embedUrl}#view=FitH`}
                title={`${paper.subject?.name} PDF`}
                className="w-full h-full border-none min-h-[550px] lg:h-full rounded-2xl bg-white"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Invalid PDF Link</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  This question paper's file storage URL is unsupported, corrupt, or could not be loaded.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel: Extracted text/OCR lists */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-850 p-4 shadow-sm">
          {/* Subtabs controls */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-250/40 dark:border-slate-900/60">
            <button
              onClick={() => setActiveRightTab('structured')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'structured'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Extracted Questions ({questions.length})</span>
            </button>
            <button
              onClick={() => setActiveRightTab('raw')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeRightTab === 'raw'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Full Raw Text OCR</span>
            </button>
          </div>

          {/* Structured Questions View */}
          {activeRightTab === 'structured' && (
            <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 scrollbar-none max-h-[600px]">
              {questions.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No structured questions found. Click the "Raw Text OCR" tab to read the raw extracted text.
                  </p>
                </div>
              ) : (
                questions.map((q) => (
                  <div
                    key={q._id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-xl space-y-2 relative group hover:border-indigo-500/20"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-1.5">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded">
                          {q.type}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-400 rounded">
                          {q.marks} Marks
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyQuestion(q.questionText, q._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all cursor-pointer text-slate-400"
                        title="Copy Question"
                      >
                        {copiedId === q._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Raw Text OCR view */}
          {activeRightTab === 'raw' && (
            <div className="flex-1 flex flex-col space-y-4 mt-4 overflow-hidden">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-slate-400 font-medium">Extracted raw document strings</span>
                <button
                  onClick={handleCopyRawText}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-955 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-550" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Full Text</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={paper.extractedText || 'No text extracted. PDF might be scanned or blurry.'}
                readOnly
                className="flex-1 w-full bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-900 rounded-2xl p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none min-h-[400px] max-h-[600px] overflow-y-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* REPORT FLAG MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportModalOpen(false)}></div>
          
          <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-850 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-105 dark:hover:bg-slate-850 rounded-xl text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Report Paper Issues</h3>
                <p className="text-xs text-slate-500 dark:text-slate-450">
                  Help the academic community by reporting blurred, duplicate, or incorrectly cataloged sheets.
                </p>
              </div>

              {reportSuccess ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  Report submitted successfully. We will review this paper shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
                      required
                    >
                      <option value="">Select Reason...</option>
                      <option value="Incorrect Subject / Code">Incorrect Subject / Code</option>
                      <option value="Incorrect Exam Year">Incorrect Exam Year</option>
                      <option value="Incorrect Semester Level">Incorrect Semester Level</option>
                      <option value="Blurry / Unreadable Pages">Blurry / Unreadable Pages</option>
                      <option value="Duplicate File Upload">Duplicate File Upload</option>
                      <option value="Incomplete Pages">Incomplete Pages</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Please add specific details (e.g. Page 3 missing, or year is 2022 not 2024)..."
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-900 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none h-24 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="w-full h-11 bg-indigo-650 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-bold flex items-center justify-center shadow"
                  >
                    {reportSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PyqViewer;
