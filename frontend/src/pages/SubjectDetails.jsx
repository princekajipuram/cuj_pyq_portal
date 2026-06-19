import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { CardSkeleton, ListSkeleton } from '../components/common/Skeleton.jsx';
import { FileText, Database, Calendar, Filter, Sparkles, Copy, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useContext } from 'react';

export const SubjectDetails = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const subjectName = searchParams.get('name') || 'Course Details';
  const subjectCode = searchParams.get('code') || 'CS-XXX';
  const { isAdmin } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('papers'); // 'papers' or 'questions'
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Filter states
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMarks, setSelectedMarks] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // 1. Fetch Question Papers
  useEffect(() => {
    if (!subjectId) return;

    const fetchPapers = async () => {
      try {
        setLoadingPapers(true);
        const res = await api.get(`/papers?subject=${subjectId}`);
        setPapers(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load papers', err);
      } finally {
        setLoadingPapers(false);
      }
    };

    fetchPapers();
  }, [subjectId]);

  // 2. Fetch Extracted Questions
  useEffect(() => {
    if (!subjectId || activeTab !== 'questions') return;

    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        // Build filter parameters
        let url = `/papers/questions?subjectId=${subjectId}`;
        if (selectedYear) url += `&year=${selectedYear}`;
        if (selectedType) url += `&type=${selectedType}`;
        if (selectedMarks) url += `&marks=${selectedMarks}`;

        const res = await api.get(url);
        setQuestions(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load extracted questions', err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [subjectId, activeTab, selectedYear, selectedType, selectedMarks]);

  const handleCopyQuestion = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get distinct list of years from papers for filtering questions
  const uniqueYears = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-lg">
            {subjectCode}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
            {subjectName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View full previous papers or study extracted questions parsed by AI OCR.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-900/60 flex-shrink-0">
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Question Papers</span>
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow'
                : 'text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Extracted Questions</span>
          </button>
        </div>
      </div>

      {/* RENDER PAPERS TAB */}
      {activeTab === 'papers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Yearly Question Papers</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{papers.length} Papers available</span>
          </div>

          {loadingPapers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton count={3} />
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Papers Uploaded</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {isAdmin ? 'Be the first to upload a question paper for this subject!' : 'No papers have been uploaded by admins yet. Check back later!'}
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
              {papers.map((paper) => (
                <div
                  key={paper._id}
                  className="hover-lift p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-lg">
                        {paper.year} Exam
                      </span>
                      <span className="text-xs font-bold text-slate-400">{paper.examType}</span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                      {subjectName} Previous Paper
                    </h4>
                    <p className="text-xs text-slate-400">
                      Auto-parsed questions: {paper.extractedText ? 'Available' : 'Unavailable'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center mt-5">
                    <span className="text-xs text-slate-400 dark:text-slate-550">Uploaded by {paper.uploadedBy?.name || 'Admin'}</span>
                    <Link
                      to={`/viewer/${paper._id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      View & Study &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER QUESTIONS TAB WITH MULTIPLE FILTERS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Filters Bar Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Filter className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold">Quick Filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
              {/* Year Select */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Exam Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year} Exam</option>
                ))}
              </select>

              {/* Type Select */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Question Types</option>
                <option value="Very Short">Very Short</option>
                <option value="Short">Short</option>
                <option value="Long">Long</option>
              </select>

              {/* Marks Select */}
              <select
                value={selectedMarks}
                onChange={(e) => setSelectedMarks(e.target.value)}
                className="h-10 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none"
              >
                <option value="">All Marks levels</option>
                <option value="2">2 Marks</option>
                <option value="5">5 Marks</option>
                <option value="10">10 Marks</option>
                <option value="20">20 Marks</option>
              </select>
            </div>
          </div>

          {/* List Content */}
          {loadingQuestions ? (
            <ListSkeleton count={4} />
          ) : questions.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-3xl p-8 max-w-md mx-auto">
              <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Matching Questions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We couldn't find any pre-parsed questions matching these exact filter parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q._id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850/60 rounded-2xl flex items-start gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-800 group"
                >
                  <div className="flex-1 space-y-2.5">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded">
                        {q.year} Exam
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 rounded">
                        {q.type}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyQuestion(q.questionText, q._id)}
                    className="p-2 text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
                    title="Copy Question Text"
                  >
                    {copiedId === q._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectDetails;
