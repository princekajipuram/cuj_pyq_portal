import React from 'react';
import { Library } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-900 py-8 mt-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-250 font-bold">
            <Library className="w-5 h-5 text-indigo-500" />
            <span>Central University of Jammu PYQs</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span>Prepared by Antigravity AI</span>
            <span className="hidden sm:inline">|</span>
            <span>Resume Grade Application</span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 text-center text-xs text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} Central University of Jammu. All rights reserved. Managed with Cloudinary & MongoDB.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
