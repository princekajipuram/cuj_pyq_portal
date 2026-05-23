import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { CardSkeleton } from '../components/common/Skeleton.jsx';
import { Bookmark, FileText, Trash2, ArrowRight } from 'lucide-react';

export const SavedPapers = () => {
  const [savedPapers, setSavedPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved');
      setSavedPapers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load bookmarked papers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (paperId, e) => {
    e.preventDefault(); // Stop click propagation to link
    try {
      await api.post(`/saved/${paperId}`);
      // Filter out of current state list
      setSavedPapers(prev => prev.filter(p => p._id !== paperId));
    } catch (err) {
      console.error('Failed to remove bookmark', err);
    }
  };

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
      {/* Title Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
          <Bookmark className="w-8 h-8 text-indigo-500 fill-indigo-500/10" />
          <span>My Bookmarked Papers</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quickly access and study your saved university question sheets.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton count={3} />
        </div>
      ) : savedPapers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <Bookmark className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Bookmarks Saved</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Bookmark question sheets in the browser viewer to keep them visible here for offline learning reference!
          </p>
          <Link
            to="/departments"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all"
          >
            <span>Browse Papers Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPapers.map((paper) => (
            <Link
              key={paper._id}
              to={`/viewer/${paper._id}`}
              className="hover-lift p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    {paper.year}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{paper.examType}</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-850 dark:text-white leading-snug">
                    {paper.subject?.name}
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                    Code: {paper.subject?.code} | Sem {paper.subject?.semester?.number}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center mt-5">
                <button
                  onClick={(e) => handleRemoveBookmark(paper._id, e)}
                  className="p-2 border border-slate-200 hover:border-rose-250 dark:border-slate-800 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group">
                  <span>Study Paper</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPapers;
