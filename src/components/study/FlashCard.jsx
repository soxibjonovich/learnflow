import React, { useRef } from "react";

export default function FlashCard({
  card,
  isFlipped,
  isReverseMode,
  onFlip,
  showHint,
  onSwipeNext,
  onSwipePrevious,
}) {
  if (!card) return null;

  const questionText = isReverseMode ? card.back : card.front;
  const answerText = isReverseMode ? card.front : card.back;
  const pointerStartX = useRef(0);
  const swipedRef = useRef(false);

  const handlePointerDown = (event) => {
    pointerStartX.current = event.clientX;
    swipedRef.current = false;
  };

  const handlePointerUp = (event) => {
    const deltaX = event.clientX - pointerStartX.current;
    if (Math.abs(deltaX) < 70) return;
    swipedRef.current = true;

    if (deltaX < 0) {
      onSwipeNext();
      return;
    }

    onSwipePrevious();
  };

  const handleClick = () => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }

    onFlip();
  };

  return (
    <div className="study-card-shell study-card-enter">
      <button
        type="button"
        className="study-card-scene"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <span className={`study-card-flipper ${isFlipped ? "flipped" : ""}`}>
          <span className="study-card study-card-face is-question">
            <span className="text-sm uppercase tracking-[0.35em] mb-4 mono text-slate-400">
              Prompt
            </span>

            <span className="text-3xl font-semibold leading-relaxed mb-4 text-slate-900">
              {questionText}
            </span>

            {!isReverseMode && card.translation && (
              <span className="text-lg text-cyan-700 font-medium mb-3 mono">
                {card.translation}
              </span>
            )}

            {isReverseMode && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 mono">
                Reverse Mode
              </span>
            )}

            {showHint && (
              <span className="mt-6 text-sm text-slate-400 mono">
                Tap to flip, swipe to browse
              </span>
            )}
          </span>

          <span className="study-card study-card-face study-card-face-back is-answer">
            <span className="text-sm uppercase tracking-[0.35em] mb-4 mono text-cyan-100">
              Answer
            </span>

            <span className="text-3xl font-semibold leading-relaxed mb-4 text-white">
              {answerText}
            </span>

            {isReverseMode && card.translation && (
              <span className="text-base text-cyan-100 mb-3 mono">
                Translation: {card.translation}
              </span>
            )}

            {card.example && (
              <span className="text-base italic border-t border-white/20 pt-4 mt-4 text-slate-100">
                "{card.example}"
              </span>
            )}
          </span>
        </span>
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
  onSwipeNext: () => {},
  onSwipePrevious: () => {},
};
