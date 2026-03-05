import React from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudyControls({
  isFlipped,
  onRate,
  onReshuffle,
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

        <Button onClick={onReshuffle} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
      </div>

      <div className="text-center text-sm text-slate-500 mono">
        Box {box} • Reviews: {reviews}
      </div>

      {isFlipped && (
        <div className="flex gap-4">
          <Button
            onClick={() => onRate(false)}
            variant="outline"
            className="flex-1 h-12 text-base font-medium border-2 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-5 h-5 mr-2" />
            Again
          </Button>
          <Button
            onClick={() => onRate(true)}
            className="flex-1 h-12 text-base font-medium bg-green-600 hover:bg-green-700"
          >
            <Check className="w-5 h-5 mr-2" />
            Got it
          </Button>
        </div>
      )}
    </div>
  );
}

StudyControls.defaultProps = {
  isFlipped: false,
  onRate: () => {},
  onReshuffle: () => {},
  currentIndex: 0,
  totalCards: 0,
  box: 1,
  reviews: 0,
};
