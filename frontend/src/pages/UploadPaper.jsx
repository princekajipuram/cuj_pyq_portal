import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

export const UploadPaper = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedType, setSelectedType] = useState('EndSem');

  // File states
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Statuses
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // 1. Initial Load: Depts and Semesters
  useEffect(() => {
    const fetchInitials = async () => {
      try {
        setLoadingConfig(true);
        const [dRes, sRes] = await Promise.all([
          api.get('/academic/departments'),
          api.get('/academic/semesters')
        ]);
        setDepartments(dRes.data?.data || []);
        setSemesters(sRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load catalog configs', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchInitials();
  }, []);

  // 2. Cascade: Dept -> Branches
  useEffect(() => {
    if (!selectedDept) {
      setBranches([]);
      setSelectedBranch('');
      return;
    }
    const fetchBranches = async () => {
      try {
        const res = await api.get(`/academic/departments/${selectedDept}/branches`);
        setBranches(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranches();
  }, [selectedDept]);

  // 3. Cascade: Branch + Semester -> Subjects
  useEffect(() => {
    if (!selectedBranch || !selectedSem) {
      setSubjects([]);
      setSelectedSub('');
      return;
    }
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/academic/branches/${selectedBranch}/subjects?semesterId=${selectedSem}`);
        setSubjects(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, [selectedBranch, selectedSem]);

  // Drag & Drop event bindings
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setErrorMsg('');
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    setErrorMsg('');
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (targetFile) => {
    if (!targetFile) return;

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(targetFile.type)) {
      setErrorMsg('Invalid file type. Please upload a PDF or an Image (PNG/JPG).');
      return;
    }

    if (targetFile.size > 15 * 1024 * 1024) { // 15MB
      setErrorMsg('File exceeds 15MB limit. Please compress your document.');
      return;
    }

    setFile(targetFile);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessData(null);

    if (!selectedSub || !selectedYear || !file) {
      setErrorMsg('Please complete all selection inputs and drop your paper file.');
      return;
    }

    // Prepare Multipart Form Data
    const formData = new FormData();
    formData.append('subjectId', selectedSub);
    formData.append('year', selectedYear);
    formData.append('examType', selectedType);
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/papers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res?.data?.success) {
        setSuccessData(res.data.data || {});
        // Clear file
        setFile(null);
        setSelectedSub('');
      } else {
        setErrorMsg(res?.data?.message || 'Server processed the upload but returned an unexpected response.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'File upload failed. Ensure server is online.');
    } finally {
      setUploading(false);
    }
  };

  const yearsRange = Array.from({ length: 9 }, (_, i) => 2018 + i).reverse();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Title Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <UploadCloud className="w-8 h-8 text-indigo-500" />
          <span>Upload Question Paper</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload PDF/Image and our AI-OCR engine will parse the questions automatically.
        </p>
      </div>

      {successData && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-left">
            <h4 className="text-base font-extrabold text-emerald-800 dark:text-emerald-400">Upload Processed Successfully!</h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-350">
              The PDF has been stored in Cloudinary and registered. 
              Our OCR successfully parsed **{successData?.questionsCount || 0}** individual questions automatically!
            </p>
            <div className="pt-2 flex gap-3">
              {successData?.paper?._id && (
                <Link
                  to={`/viewer/${successData.paper._id}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Open in Viewer
                </Link>
              )}
              <button
                onClick={() => setSuccessData(null)}
                className="px-4 py-2 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100/30"
              >
                Upload Another
              </button>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900 rounded-3xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-455 text-left">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleUploadSubmit} className="glass p-6 sm:p-8 border border-slate-200/60 dark:border-slate-850 rounded-3xl shadow-xl space-y-6">
        {/* Cascade selections grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Department Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">1. School / Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              required
            >
              <option value="">Select Department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Branch Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">2. Academic Major</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none disabled:opacity-50"
              disabled={!selectedDept}
              required
            >
              <option value="">Select Major...</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">3. Semester Level</label>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              required
            >
              <option value="">Select Semester...</option>
              {semesters.map((sem) => (
                <option key={sem._id} value={sem._id}>{sem.name}</option>
              ))}
            </select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">4. Course Subject</label>
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none disabled:opacity-50"
              disabled={!selectedBranch || !selectedSem}
              required
            >
              <option value="">Select Subject...</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.name} [{sub.code}]</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">5. Examination Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              required
            >
              {yearsRange.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Exam Type Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">6. Exam Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-xl px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
              required
            >
              <option value="EndSem">End Semester (EndSem)</option>
              <option value="MidSem">Mid Semester (MidSem)</option>
              <option value="Supple">Supplementary (Supple)</option>
            </select>
          </div>
        </div>

        {/* Drag and drop panel upload */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">7. Attach File Document</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              dragging
                ? 'border-indigo-650 bg-indigo-50/20 dark:bg-indigo-950/20'
                : file
                ? 'border-indigo-500 bg-slate-50 dark:bg-slate-950'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,image/png,image/jpeg,image/jpg"
            />

            {file ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate px-4">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="px-4 py-1.5 border border-slate-200 hover:border-rose-250 dark:border-slate-800 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 flex items-center justify-center mx-auto text-slate-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag and drop file here, or click to browse</p>
                  <p className="text-xs text-slate-400">Supports PDF, PNG, JPG, JPEG (Max 15MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !file || !selectedSub}
          className="w-full h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-650/40 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {uploading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading & executing OCR parser...</span>
            </div>
          ) : (
            <span>Publish Question Paper &rarr;</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadPaper;
