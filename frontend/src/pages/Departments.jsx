import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { CardSkeleton, ListSkeleton } from '../components/common/Skeleton.jsx';
import { GraduationCap, ArrowRight, Library, Search, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useContext } from 'react';

export const Departments = () => {
  const { isAdmin } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState({}); // Mapped by deptId
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        // If there is a search query in the URL, fetch matching subjects
        if (searchQuery) {
          setSearching(true);
          const res = await api.get(`/papers?search=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data?.data || []);
          setLoading(false);
          return;
        }

        setSearching(false);
        const res = await api.get('/academic/departments');
        const deptData = res.data?.data || [];
        setDepartments(deptData);

        // Fetch branches for each department in parallel
        const branchPromises = deptData.map(async (dept) => {
          try {
            const bRes = await api.get(`/academic/departments/${dept._id}/branches`);
            return { deptId: dept._id, data: bRes.data?.data || [] };
          } catch (e) {
            return { deptId: dept._id, data: [] };
          }
        });

        const branchResults = await Promise.all(branchPromises);
        const branchMap = {};
        branchResults.forEach((item) => {
          branchMap[item.deptId] = item.data;
        });

        setBranches(branchMap);
      } catch (err) {
        console.error('Failed to load academic catalog', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
        <div className="w-1/3 h-10 rounded animate-skeleton"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ListSkeleton count={4} />
          <ListSkeleton count={4} />
        </div>
      </div>
    );
  }

  // Render Search Results Screen if querying
  if (searching) {
    return (
      <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Search className="w-7 h-7 text-indigo-500" />
            <span>Search Results for "{searchQuery}"</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Found {searchResults.length} matching question papers.</p>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8">
            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Papers Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {isAdmin ? "We couldn't find any papers matching your search term. You can contribute by uploading one yourself!" : "We couldn't find any papers matching your search term. Check back later when admins upload more papers."}
            </p>
            {isAdmin && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md"
              >
                Upload Paper
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((paper) => (
              <div
                key={paper._id}
                className="hover-lift p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {paper.year}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold">{paper.examType}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-850 dark:text-white leading-snug">
                    {paper.subject.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Code: {paper.subject.code} | {paper.subject.branch.code}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-4">
                  <span className="text-xs text-slate-400">Uploaded by {paper.uploadedBy?.name || 'Admin'}</span>
                  <Link
                    to={`/viewer/${paper._id}`}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>View Paper</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
      {/* Title Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-2.5">
          <GraduationCap className="w-8 h-8 text-indigo-500" />
          <span>Academic Catalog</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a school department and branch major to view subjects and course papers.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8">
          <Library className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Departments Seeded</h3>
          <p className="text-sm text-slate-500 dark:text-slate-450 max-w-md mx-auto mb-6">
            The database appears to be empty. Please run the seeding script to populate departments and branches!
          </p>
          <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            npm run seed
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-3xl shadow-sm p-6 space-y-4"
            >
              <div className="space-y-1">
                <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-lg tracking-wider uppercase">
                  {dept.code}
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  {dept.name}
                </h3>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                  Branches / Degree Majors
                </h4>
                {branches[dept._id]?.length === 0 ? (
                  <p className="text-xs text-slate-400">No branches added to this department.</p>
                ) : (
                  <div className="space-y-2">
                    {branches[dept._id]?.map((branch) => (
                      <Link
                        key={branch._id}
                        to={`/subjects/${branch._id}?name=${encodeURIComponent(branch.name)}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-850/60 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:border-slate-200 dark:hover:border-slate-800 group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100/60 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {branch.code}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {branch.name}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
