import React from 'react';
import { Check, ClipboardCheck, Edit2, BookOpen } from 'lucide-react';

export default function TestSelection({
  cards,
  reviewCards,
  selectedUnits,
  testLimit,
  onToggleUnit,
  onStartTest,
  onStartReviewTest,
  onTestLimitChange,
}) {
  const units = [...new Set(cards.map((c) => c.unit || 'General'))].sort();

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
      <div className="text-center mb-8">
        <ClipboardCheck className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Your Knowledge</h2>
        <p className="text-slate-600">Challenge yourself with your vocabulary cards.</p>
      </div>

      {/* Unit filter */}
      {units.length > 1 && (
        <div className="mb-6 pb-6 border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3 mono">Filter by Unit (optional)</label>
          <div className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <button
                key={unit}
                onClick={() => onToggleUnit(unit)}
                className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                  selectedUnits.includes(unit)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {unit}
                {selectedUnits.includes(unit) && <Check className="w-3.5 h-3.5 inline ml-1.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question count */}
      <div className="mb-6 pb-6 border-b border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-3 mono">Questions</label>
        <div className="flex gap-2">
          {[10, 'all'].map((n) => (
            <button
              key={n}
              onClick={() => onTestLimitChange(n)}
              className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                testLimit === n
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {n === 'all' ? 'All' : '10'}
            </button>
          ))}
        </div>
      </div>

      {/* Review due words */}
      {reviewCards.length > 0 && (
        <div className="mb-6 pb-6 border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3 mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            Review Due Words
            <span className="text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 ml-1">
              {reviewCards.length} due
            </span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onStartReviewTest('written', reviewCards)}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
            >
              <Edit2 className="w-5 h-5 text-amber-500 mb-2" />
              <div className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">Written</div>
              <div className="text-xs text-slate-400">Type your answer</div>
            </button>
            <button
              onClick={() => onStartReviewTest('multiple-choice', reviewCards)}
              disabled={reviewCards.length < 4}
              className="p-4 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="w-5 h-5 text-amber-500 mb-2" />
              <div className="font-semibold text-sm text-slate-900 group-hover:text-amber-700">Multiple Choice</div>
              <div className="text-xs text-slate-400">Pick the right answer</div>
            </button>
          </div>
        </div>
      )}

      {/* All cards */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3 mono">All Cards</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onStartTest('written', 'cards')}
            disabled={cards.length === 0}
            className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Edit2 className="w-5 h-5 text-indigo-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700">Written Test</div>
            <div className="text-xs text-slate-400">Type exact answers</div>
          </button>
          <button
            onClick={() => onStartTest('multiple-choice', 'cards')}
            disabled={cards.length < 4}
            className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5 text-indigo-500 mb-2" />
            <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-700">Multiple Choice</div>
            <div className="text-xs text-slate-400">Select correct option</div>
          </button>
        </div>
      </div>
    </div>
  );
}

TestSelection.defaultProps = {
  cards: [],
  reviewCards: [],
  selectedUnits: [],
  testLimit: 10,
  onToggleUnit: () => {},
  onStartTest: () => {},
  onStartReviewTest: () => {},
  onTestLimitChange: () => {},
};
