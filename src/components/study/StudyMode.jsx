import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import FlashCard from './FlashCard';
import StudyControls from './StudyControls';

/**
 * StudyMode Component
 * Main container for study mode with flashcards
 * 
 * @param {Object} props
 * @param {Array} props.studyQueue
 * @param {number} props.currentCardIndex
 * @param {boolean} props.isFlipped
 * @param {boolean} props.showHint
 * @param {Function} props.onFlip
 * @param {Function} props.onRate
 * @param {Function} props.onReshuffle
 * @param {Function} props.onModeChange
 */
export default function StudyMode({
  studyQueue,
  currentCardIndex,
  isFlipped,
  showHint,
  onFlip,
  onRate,
  onReshuffle,
  onModeChange
}) {
  // Current card
  const currentCard = studyQueue[currentCardIndex];

  // Empty state - no cards due
  if (studyQueue.length === 0) {
    return (
      <div className="slide-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200/50 shadow-lg">
          <Calendar className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            All caught up!
          </h3>
          <p className="text-slate-600 mb-6">
            No cards due for review right now. Great work!
          </p>
          <Button 
            onClick={() => onModeChange('create')} 
            className="hover-lift"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Cards
          </Button>
        </div>
      </div>
    );
  }

  // Active study session
  return (
    <div className="slide-in">
      <StudyControls
        isFlipped={isFlipped}
        onRate={onRate}
        onReshuffle={onReshuffle}
        currentIndex={currentCardIndex + 1}
        totalCards={studyQueue.length}
        box={currentCard?.box || 1}
        reviews={currentCard?.reviews || 0}
      />

      <FlashCard
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={onFlip}
        showHint={showHint}
      />
    </div>
  );
}

// Default props
StudyMode.defaultProps = {
  studyQueue: [],
  currentCardIndex: 0,
  isFlipped: false,
  showHint: true,
  onFlip: () => {},
  onRate: () => {},
  onReshuffle: () => {},
  onModeChange: () => {}
};