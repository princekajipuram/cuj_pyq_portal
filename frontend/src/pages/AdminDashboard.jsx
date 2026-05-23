import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { StatsSkeleton } from '../components/common/Skeleton.jsx';
import { Users, FileText, Sparkles, AlertTriangle, Clock, ArrowUpRight, GraduationCap } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        setStats(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <StatsSkeleton />;
  }

  const { stats: counts, branchStats, recentUploads } = stats || {
    stats: { users: 0, papers: 0, questions: 0, pendingReports: 0 },
    branchStats: [],
    recentUploads: []
  };

  const statCards = [
    { title: 'Total Users', value: counts.users, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Total Papers', value: counts.papers, icon: FileText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { title: 'Extracted Questions', value: counts.questions, icon: Sparkles, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { title: 'Pending Reports', value: counts.pendingReports, icon: AlertTriangle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-indigo-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="relative space-y-2 z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CUJ PYQ Administration Panel</h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-md">
            Monitor papers publishing streams, approve reported issues, organize academic catalogs, and manage registrations.
          </p>
        </div>
      </div>

      {/* Numerical Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850/80 rounded-2xl shadow-sm flex items-center justify-between transition-colors"
            >
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{c.title}</p>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white leading-none">{c.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphical Branch splits & Recent uploads split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Branch papers counts distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1 text-left mb-6">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              <span>Academic Distributions</span>
            </h3>
            <p className="text-xs text-slate-400">Total verified question papers grouped by majors</p>
          </div>

          <div className="space-y-4">
            {branchStats.map((branch) => {
              // Calculate width percentages safely
              const maxPapers = Math.max(...branchStats.map(b => b.papers), 1);
              const percentage = Math.round((branch.papers / maxPapers) * 100);

              return (
                <div key={branch.code} className="space-y-1 text-left">
                  <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                    <span>{branch.name} ({branch.code})</span>
                    <span>{branch.papers} papers</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Uploads list */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span>Recent Upload streams</span>
              </h3>
              <p className="text-xs text-slate-400">Review newly uploaded materials published on the website</p>
            </div>
            <Link
              to="/admin/papers"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              <span>Manage all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUploads.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No uploaded papers in progress.</p>
          ) : (
            <div className="space-y-3.5">
              {recentUploads.map((paper) => (
                <div
                  key={paper._id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-2xl transition-colors hover:border-slate-350"
                >
                  <div className="text-left space-y-1 truncate pr-4">
                    <p className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight truncate">
                      {paper.subject?.name}
                    </p>
                    <p className="text-xs text-slate-400 font-semibold truncate">
                      Code: {paper.subject?.code} | Branch: {paper.subject?.branch?.code} | Year: {paper.year}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      paper.isVerified 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {paper.isVerified ? 'Verified' : 'Pending'}
                    </span>
                    <Link
                      to={`/viewer/${paper._id}`}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-400"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
