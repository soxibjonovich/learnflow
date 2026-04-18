import React from "react";
import { ArrowLeft, ArrowLeftRight, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const REVIEW_BUTTONS = [
  { quality: 0, label: "Again", className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
  { quality: 4, label: "Got It", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
];

export default function StudyControls({
  isFlipped,
  isReverseMode,
  onRate,
  onReshuffle,
  onNextCard,
  onPreviousCard,
  onToggleReverseMode,
  currentIndex,
  totalCards,
  box,
  reviews,
  status,
  nextReviewLabel,
}) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-500 mono">
          Card {currentIndex} of {totalCards}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onPreviousCard} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Prev
          </Button>
          <Button onClick={onNextCard} variant="outline" size="sm">
            <ArrowRight className="w-4 h-4 mr-2" />
            Next
          </Button>
          <Button onClick={onToggleReverseMode} variant="outline" size="sm">
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            {isReverseMode ? "Reverse" : "Normal"}
          </Button>
          <Button onClick={onReshuffle} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-slate-500 mono">
        Box {box} • {status} • Reviews: {reviews} • Next: {nextReviewLabel}
      </div>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {REVIEW_BUTTONS.map(({ quality, label, className }) => (
            <Button
              key={quality}
              onClick={() => onRate(quality)}
              variant="outline"
              className={`h-12 border-2 text-sm font-semibold ${className}`}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

StudyControls.defaultProps = {
  isFlipped: false,
  isReverseMode: false,
  onRate: () => {},
  onReshuffle: () => {},
  onNextCard: () => {},
  onPreviousCard: () => {},
  onToggleReverseMode: () => {},
  currentIndex: 0,
  totalCards: 0,
  box: 1,
  reviews: 0,
  status: "new",
  nextReviewLabel: "Today",
};
