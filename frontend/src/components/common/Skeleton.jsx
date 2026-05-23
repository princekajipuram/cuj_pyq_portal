import React from 'react';

// Shimmer card loading grid items
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4"
          >
            <div className="w-1/3 h-4 rounded animate-skeleton"></div>
            <div className="w-full h-7 rounded animate-skeleton"></div>
            <div className="w-2/3 h-4 rounded animate-skeleton"></div>
            <div className="flex gap-2 pt-2">
              <div className="w-16 h-6 rounded-full animate-skeleton"></div>
              <div className="w-16 h-6 rounded-full animate-skeleton"></div>
            </div>
          </div>
        ))}
    </>
  );
};

// Shimmer rows for table lists
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3 w-full">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-xl space-x-4"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-10 h-10 rounded-lg animate-skeleton flex-shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="w-1/4 h-4 rounded animate-skeleton"></div>
                <div className="w-1/2 h-3 rounded animate-skeleton"></div>
              </div>
            </div>
            <div className="w-20 h-8 rounded-lg animate-skeleton"></div>
          </div>
        ))}
    </div>
  );
};

// Shimmer side-by-side split screen
export const ViewerSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-100px)] p-6">
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-3 w-full max-w-sm px-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto animate-skeleton"></div>
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded mx-auto animate-skeleton"></div>
          <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto animate-skeleton"></div>
        </div>
      </div>
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="w-1/3 h-7 rounded animate-skeleton"></div>
        <div className="flex gap-2">
          <div className="w-24 h-8 rounded animate-skeleton"></div>
          <div className="w-24 h-8 rounded animate-skeleton"></div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-1/5 h-4 rounded animate-skeleton"></div>
                <div className="w-full h-5 rounded animate-skeleton"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Shimmer dashboard grid statistics cards
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <div className="w-16 h-4 rounded animate-skeleton"></div>
              <div className="w-10 h-7 rounded animate-skeleton"></div>
            </div>
            <div className="w-12 h-12 rounded-xl animate-skeleton"></div>
          </div>
        ))}
    </div>
  );
};
