import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { ListSkeleton } from '../components/common/Skeleton.jsx';
import { FileText, Search, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const ManagePapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/papers');
      setPapers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this question paper and all its extracted OCR questions? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/papers/${paperId}`);
      // Remove from list
      setPapers(prev => prev.filter(p => p._id !== paperId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete paper');
    }
  };

  // Filter papers based on search
  const filteredPapers = papers.filter((paper) => {
    const term = searchQuery.toLowerCase();
    return (
      paper.subject?.name?.toLowerCase().includes(term) ||
      paper.subject?.code?.toLowerCase().includes(term) ||
      paper.year?.toString().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-505" />
            <span>Manage Academic Papers</span>
          </h2>
          <p className="text-xs text-slate-400">Total papers indexed: {papers.length}</p>
        </div>

        {/* Search filter */}
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by subject name or code..."
            className="w-full bg-transparent pl-2.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-8 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">No Papers Found</h3>
          <p className="text-xs text-slate-500">We couldn't find any papers matching your search query.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Code / Branch</th>
                  <th className="px-6 py-4">Year / Semester</th>
                  <th className="px-6 py-4">Exam Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-750 dark:text-slate-300 text-xs">
                {filteredPapers.map((paper) => (
                  <tr key={paper._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-white max-w-[200px] truncate">
                      {paper.subject?.name}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {paper.subject?.code} / {paper.subject?.branch?.code}
                    </td>
                    <td className="px-6 py-4">
                      {paper.year} Exam / Sem {paper.subject?.semester?.number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100/20">
                        {paper.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/viewer/${paper._id}`}
                        className="inline-flex p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                        title="View Paper Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePaper(paper._id)}
                        className="inline-flex p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Paper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePapers;
