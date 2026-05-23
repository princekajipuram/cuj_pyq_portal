import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { ListSkeleton } from '../components/common/Skeleton.jsx';
import { AlertTriangle, ShieldCheck, XCircle, ArrowUpRight } from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReports(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, nextStatus) => {
    try {
      const res = await api.put(`/reports/${reportId}`, { status: nextStatus });
      if (res.data.success) {
        setReports(prev =>
          prev.map(r => (r._id === reportId ? { ...r, status: nextStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update report status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-left">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-indigo-505" />
          <span>Active Flag Reports</span>
        </h2>
        <p className="text-xs text-slate-400">Review student reported file errors and coordinate adjustments.</p>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-8 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Database Healthy</h3>
          <p className="text-xs text-slate-500">There are currently no reported papers in the queue!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Reported Paper</th>
                  <th className="px-6 py-4">Flagged Reason</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-slate-750 dark:text-slate-350 text-xs">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-850 dark:text-white max-w-[180px] truncate">
                      {r.paper?.subject?.name || 'Deleted Paper'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-600 dark:text-rose-455">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate" title={r.description}>
                      {r.description || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                          : r.status === 'resolved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 flex items-center justify-end">
                      {r.paper && (
                        <Link
                          to={`/viewer/${r.paper._id}`}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-indigo-650 transition-colors"
                          title="View Flagged Paper"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      )}
                      
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'resolved')}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg text-slate-400 hover:text-emerald-555 transition-colors cursor-pointer"
                            title="Mark as Resolved"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r._id, 'dismissed')}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Dismiss Report"
                          >
                            <XCircle className="w-4 h-4 text-rose-455" />
                          </button>
                        </>
                      )}
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

export default ReportsPage;
