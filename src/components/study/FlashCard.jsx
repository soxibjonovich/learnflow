import React from "react";

export default function FlashCard({
  card,
  isFlipped,
  isReverseMode,
  onFlip,
  showHint,
}) {
  if (!card) return null;

  const questionText = isReverseMode ? card.back : card.front;
  const answerText = isReverseMode ? card.front : card.back;

  return (
    <div className="study-card-shell study-card-enter">
      <button
        type="button"
        className={`study-card ${isFlipped ? "is-answer" : "is-question"}`}
        onClick={onFlip}
      >
        <span
          className={`text-sm uppercase tracking-wider mb-4 mono ${
            isFlipped ? "text-cyan-100" : "text-slate-400"
          }`}
        >
          {isFlipped ? "Answer" : "Question"}
        </span>

        <span
          className={`text-3xl font-semibold leading-relaxed mb-4 ${
            isFlipped ? "text-white" : "text-slate-900"
          }`}
        >
          {isFlipped ? answerText : questionText}
        </span>

        {!isFlipped && !isReverseMode && card.translation && (
          <span className="text-lg text-cyan-700 font-medium mb-3 mono">
            {card.translation}
          </span>
        )}

        {!isFlipped && isReverseMode && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 mono">
            Reverse Mode
          </span>
        )}

        {isFlipped && isReverseMode && card.translation && (
          <span className="text-base text-cyan-100 mb-3 mono">
            Translation: {card.translation}
          </span>
        )}

        {isFlipped && card.example && (
          <span className="text-base italic border-t border-white/20 pt-4 mt-4 text-slate-100">
            "{card.example}"
          </span>
        )}

        {!isFlipped && showHint && (
          <span className="mt-6 text-sm text-slate-400 mono">
            Tap to reveal answer
          </span>
        )}
      </button>
    </div>
  );
}

FlashCard.defaultProps = {
  card: null,
  isFlipped: false,
  isReverseMode: false,
  onFlip: () => {},
  showHint: true,
};
