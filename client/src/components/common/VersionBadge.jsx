import React from 'react';

/**
 * VersionBadge Component
 * Displays the current architecture milestone and stability status.
 */
export default function VersionBadge() {
  return (
    <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-xs' title='Version 3.2.7: Production Validation Program & Readiness Gates'>
      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
      <span className='text-xs font-bold tracking-tight'>v3.2.7</span>
      <span className='text-[10px] font-medium opacity-80 uppercase tracking-wider hidden sm:inline-block border-l border-emerald-500/20 pl-1.5'>
        Validation & Gates
      </span>
    </div>
  );
}
