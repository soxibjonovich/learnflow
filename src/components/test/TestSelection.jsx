import React from 'react';
import { Check, ClipboardCheck, Edit2 } from 'lucide-react';
import UnitTestButtons from './UnitTestButtons';

export default function TestSelection({
  cards,
  selectedUnits,
  onToggleUnit,
  onStartTest,
  onStartUnitTest,
}) {
  const units = [...new Set(cards.map((card) => card.unit || 'General'))].sort();
  const unitCardCounts = units.reduce((acc, unit) => {
    acc[unit] = cards.filter((card) => (card.unit || 'General') === unit).length;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg">
      <div className="text-center mb-8">
        <ClipboardCheck className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Your Knowledge</h2>
        <p className="text-slate-600">Choose a format and start a quick practice test.</p>
      </div>

      {units.length > 1 && (
        <div className="mb-6 pb-6 border-b border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3 mono">Select Units (optional)</label>
          <div className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <button
                key={unit}
                onClick={() => onToggleUnit(unit)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedUnits.includes(unit)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {unit}
                {selectedUnits.includes(unit) && <Check className="w-4 h-4 inline ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <UnitTestButtons units={units} unitCardCounts={unitCardCounts} onStartTest={onStartUnitTest} />

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => onStartTest('written')}
          disabled={cards.length === 0}
          className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Edit2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-slate-900 group-hover:text-indigo-600">Written Test</div>
              <div className="text-xs text-slate-500">Type exact answers</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onStartTest('multiple-choice')}
          disabled={cards.length < 4}
          className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-green-600 hover:bg-green-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <div className="font-bold text-slate-900 group-hover:text-green-600">Multiple Choice</div>
              <div className="text-xs text-slate-500">Select correct option</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

TestSelection.defaultProps = {
  cards: [],
  selectedUnits: [],
  onToggleUnit: () => {},
  onStartTest: () => {},
  onStartUnitTest: () => {},
};
