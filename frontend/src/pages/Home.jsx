import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Search, GraduationCap, Cpu, ShieldAlert, Binary, Rocket, HelpCircle } from 'lucide-react';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ departments: 2, branches: 5, papers: 1, questions: 10 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // Fetch statistics from public endpoints or mock if backend is down/seeding
        const res = await api.get('/papers');
        const papersCount = res.data?.data?.length || 1;
        setStats(prev => ({ ...prev, papers: papersCount }));
      } catch (err) {
        console.warn('Could not load statistics, using defaults.');
      }
    };
    fetchQuickStats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/departments?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularBranches = [
    { name: 'Computer Science', code: 'CSE', icon: Cpu, color: 'from-blue-500 to-indigo-600' },
    { name: 'Electronics & Comm.', code: 'ECE', icon: Binary, color: 'from-purple-500 to-indigo-600' },
    { name: 'Cyber Security', code: 'CYS', icon: ShieldAlert, color: 'from-rose-500 to-red-650' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Banner Grid Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 px-6 py-16 sm:px-12 sm:py-24 text-center shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl translate-y-12 -translate-x-12"></div>

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-semibold tracking-wide uppercase">
            <Rocket className="w-4 h-4 animate-bounce" />
            <span>Smart Student Resource Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-none">
            Unlock University <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">Previous Year Papers</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-medium">
            Search, study, download, and browse previous years question papers department-wise, complete with OCR text questions extraction.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-lg group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject names (e.g., Data Structures, Operating Systems)..."
                className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none text-sm font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Numerical Metrics Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-900/60 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-900 shadow-sm backdrop-blur-md">
          <div className="text-center space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.departments}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Schools/Depts</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200 dark:border-slate-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.branches}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Branches</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200 dark:border-slate-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.papers}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total papers</p>
          </div>
          <div className="text-center space-y-1 border-l border-slate-200 dark:border-slate-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.questions}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Extracted questions</p>
          </div>
        </div>
      </section>

      {/* Main Browse Gateways */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Browse Popular Branches</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Direct shortcuts to exam papers grouped semester-wise</p>
          </div>
          <Link
            to="/departments"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm font-bold flex items-center gap-1 group"
          >
            <span>View All Departments</span>
            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularBranches.map((branch) => {
            const Icon = branch.icon;
            return (
              <div
                key={branch.code}
                className="hover-lift relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between min-h-[180px]"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${branch.color} text-white flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{branch.name}</h3>
                  <p className="text-xs font-semibold text-indigo-500 tracking-wider">{branch.code} Department</p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-4">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Multiple Papers</span>
                  <Link
                    to={`/departments`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Browse Catalogs &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Info / Value proposition section */}
      <section className="max-w-7xl mx-auto px-4 py-8 bg-indigo-50/40 dark:bg-slate-900/30 rounded-3xl border border-indigo-100/50 dark:border-slate-900/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 text-center sm:text-left">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-850 dark:text-white">Curated Syllabus</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Organized directly by Department, Degree branches, Semester level, and Examination Year.
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
              <Binary className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-850 dark:text-white">AI-Powered OCR Extractions</h4>
            <p className="text-sm text-slate-550 dark:text-slate-400">
              Scans PDFs or photos, converts them into copyable digital text questions automatically for direct search.
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto sm:mx-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-850 dark:text-white">Bookmarks & Reports</h4>
            <p className="text-sm text-slate-550 dark:text-slate-400">
              Save papers to your customized workspace or report duplicates and blurry uploads to admins.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
