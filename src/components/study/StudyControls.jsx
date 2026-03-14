import React from "react";
import { ArrowLeftRight, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudyControls({
  isFlipped,
  isReverseMode,
  onRate,
  onReshuffle,
  onToggleReverseMode,
  currentIndex,
  totalCards,
  box,
  reviews,
}) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-500 mono">
          Card {currentIndex} of {totalCards}
        </div>

        <div className="flex items-center gap-2">
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
        Box {box} • Reviews: {reviews}
      </div>

      {isFlipped && (
        <div className="flex gap-4 pt-1">
          <Button
            onClick={() => onRate(false)}
            variant="outline"
            className="flex-1 h-12 text-base font-medium border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
          >
            <X className="w-5 h-5 mr-2" />
            Need to learn
          </Button>
          <Button
            onClick={() => onRate(true)}
            className="flex-1 h-12 text-base font-medium bg-green-600 text-white hover:bg-green-700"
          >
            <Check className="w-5 h-5 mr-2" />I know
          </Button>
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
  onToggleReverseMode: () => {},
  currentIndex: 0,
  totalCards: 0,
  box: 1,
  reviews: 0,
};
