import React from 'react';
import { Check } from 'lucide-react';

/**
 * UnitTestButtons Component - NEW! ✨
 * Display test buttons for each unit with card counts
 * 
 * @param {Object} props
 * @param {Array} props.units - Array of unique unit names
 * @param {Object} props.unitCardCounts - Object mapping unit name to card count
 * @param {Function} props.onStartTest - Callback to start unit test (unitName, type)
 */
export default function UnitTestButtons({ units, unitCardCounts, onStartTest }) {
  if (units.length <= 1) {
    return null; // Don't show if only one unit
  }

  return (
    <div className="mb-6 pb-6 border-b border-slate-200">
      <label className="block text-sm font-medium text-slate-700 mb-3 mono">
        Or Test Specific Unit
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {units.map((unit) => {
          const cardCount = unitCardCounts[unit] || 0;
          const canTestMultiple = cardCount >= 4;
          
          return (
            <div key={unit} className="space-y-2">
              {/* Unit Name & Count */}
              <div className="text-sm font-medium text-slate-700 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="truncate">{unit}</span>
                <span className="text-xs text-slate-500 mono ml-2">
                  {cardCount} card{cardCount !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Test Type Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onStartTest(unit, 'written')}
                  disabled={cardCount === 0}
                  className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  title="Written test - type your answers"
                >
                  Written
                </button>
                
                <button
                  onClick={() => onStartTest(unit, 'multiple-choice')}
                  disabled={!canTestMultiple}
                  className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  title={canTestMultiple ? 'Multiple choice test' : 'Need at least 4 cards'}
                >
                  Multiple
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-slate-500 mt-3 mono">
        💡 Tip: Each unit test includes up to 20 random questions from that unit
      </p>
    </div>
  );
}

// Default props
UnitTestButtons.defaultProps = {
  units: [],
  unitCardCounts: {},
  onStartTest: () => {}
};