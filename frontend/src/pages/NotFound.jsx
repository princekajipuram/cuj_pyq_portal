import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      
      <div className="max-w-md w-full text-center space-y-6 glass p-8 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <HelpCircle className="w-9 h-9 stroke-[2]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h2>
          <h3 className="text-xl font-bold text-slate-805 dark:text-white">Page Not Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
            The link you followed might be broken, or the page could have been relocated.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 justify-center w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
