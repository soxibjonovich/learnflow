import React from 'react';
import { Progress } from '@/components/ui/progress';

/**
 * StatsBar Component
 * Displays flashcard statistics and progress
 * 
 * @param {Object} props
 * @param {Object} props.stats - Statistics object with total, mastered, learning, new
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {boolean} props.isLoadingFromDb - Whether data is loading from database
 * @param {string} props.dbError - Database error message (if any)
 */
export default function StatsBar({ stats, progress, isLoadingFromDb, dbError }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-200/50 shadow-lg slide-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Total Cards */}
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900">
            {stats.total}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mono">
            Total
          </div>
        </div>
        
        {/* Mastered Cards */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.mastered}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mono">
            Mastered
          </div>
        </div>
        
        {/* Learning Cards */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.learning}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mono">
            Learning
          </div>
        </div>
        
        {/* New Cards */}
        <div className="text-center">
          <div className="text-3xl font-bold text-amber-600">
            {stats.new}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mono">
            New
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-600 mono">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Loading/Error Messages */}
        {(isLoadingFromDb || dbError) && (
          <div className="mt-2 text-xs mono">
            {isLoadingFromDb && (
              <div className="text-slate-500">
                Loading cards from database...
              </div>
            )}
            {dbError && (
              <div className="text-red-600">
                {dbError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Default props
StatsBar.defaultProps = {
  stats: {
    total: 0,
    mastered: 0,
    learning: 0,
    new: 0
  },
  progress: 0,
  isLoadingFromDb: false,
  dbError: null
};