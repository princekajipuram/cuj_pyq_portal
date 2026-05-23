import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { CardSkeleton } from '../components/common/Skeleton.jsx';
import { BookOpen, Calendar, ArrowRight, Bookmark } from 'lucide-react';

export const Subjects = () => {
  const { branchId } = useParams();
  const [searchParams] = useSearchParams();
  const branchName = searchParams.get('name') || 'Branch Catalog';

  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await api.get('/academic/semesters');
        const semData = res.data?.data || [];
        setSemesters(semData);
        // Default select 3rd semester or 1st if empty
        if (semData.length > 0) {
          // If BTech, 3rd semester is a great default, otherwise 1st
          const defaultSem = semData.find(s => s.number === 3) || semData[0];
          setSelectedSemester(defaultSem._id);
        }
      } catch (err) {
        console.error('Failed to load semesters list', err);
      }
    };
    fetchSemesters();
  }, []);

  // 2. Fetch subjects for selected branch & semester
  useEffect(() => {
    if (!branchId || !selectedSemester) return;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/academic/branches/${branchId}/subjects?semesterId=${selectedSemester}`);
        setSubjects(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [branchId, selectedSemester]);

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
      {/* Title Header */}
      <div className="space-y-2 text-center sm:text-left">
        <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full">
          Branches Selection
        </span>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
          {branchName}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a semester level below to list specific academic subjects.
        </p>
      </div>

      {/* Semesters slidable horizontal tabs bar */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none sm:mx-0 sm:px-0">
        {semesters.map((sem) => {
          const isActive = selectedSemester === sem._id;
          return (
            <button
              key={sem._id}
              onClick={() => setSelectedSemester(sem._id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950'
              }`}
            >
              {sem.name}
            </button>
          );
        })}
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton count={3} />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Subjects Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            We haven't added subjects for this semester level yet.
          </p>
          {/* Quick link to seed if they need it */}
          <span className="text-xs text-indigo-500 font-semibold uppercase">CUJ Academic Catalog</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="hover-lift p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-lg">
                    Code: {sub.code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Semester {sub.semester?.number}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-850 dark:text-white leading-snug">
                  {sub.name}
                </h3>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-6">
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Annual Papers</span>
                </div>
                <Link
                  to={`/subject-details/${sub._id}?name=${encodeURIComponent(sub.name)}&code=${encodeURIComponent(sub.code)}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-indigo-650 dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 group"
                >
                  <span>Explore Papers</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
