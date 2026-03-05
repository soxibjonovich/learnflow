import React from 'react';

export default function FlashCard({ card, isFlipped, onFlip, showHint }) {
  if (!card) return null;

  return (
    <button
      type="button"
      className={`w-full rounded-3xl p-10 min-h-[300px] border-2 text-left transition-all shadow-xl ${
        isFlipped
          ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-700 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
      onClick={onFlip}
    >
      <div className="text-sm uppercase tracking-wider mb-4 mono opacity-80">
        {isFlipped ? 'Answer' : 'Question'}
      </div>

      <div className="text-3xl font-semibold leading-relaxed mb-4">
        {isFlipped ? card.back : card.front}
      </div>

      {!isFlipped && card.translation && (
        <div className="text-lg text-indigo-600 font-medium mb-3 mono">{card.translation}</div>
      )}

      {isFlipped && card.example && (
        <div className="text-base italic border-t border-white/30 pt-4 mt-4">"{card.example}"</div>
      )}

      {!isFlipped && showHint && (
        <div className="mt-6 text-sm text-slate-400 mono">Tap to reveal answer</div>
      )}
    </button>
  );
}

FlashCard.defaultProps = {
  card: null,
  isFlipped: false,
  onFlip: () => {},
  showHint: true,
};
