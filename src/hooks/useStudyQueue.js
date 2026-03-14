import { useState, useEffect, useCallback } from "react";

/**
 * useStudyQueue Hook
 * Manages study queue and card review logic
 */
export function useStudyQueue(cards) {
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const cardListSignature = cards.map((card) => card.id).join("|");

  // Rebuild only when the card list itself changes, not when review state updates.
  useEffect(() => {
    buildQueue();
  }, [cardListSignature]);

  const buildQueue = useCallback(() => {
    const now = Date.now();
    const due = cards
      .filter((card) => !card.nextReview || card.nextReview <= now)
      .sort((a, b) => a.box - b.box);

    // Shuffle
    const shuffled = [...due];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setStudyQueue(shuffled);
    if (shuffled.length > 0) setCurrentCardIndex(0);
  }, [cards]);

  const reshuffle = useCallback(() => {
    const shuffled = [...studyQueue];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setStudyQueue(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [studyQueue]);

  const nextCard = useCallback(() => {
    const newQueue = studyQueue.filter((_, i) => i !== currentCardIndex);
    const nextIndex =
      newQueue.length > 0 ? Math.min(currentCardIndex, newQueue.length - 1) : 0;

    setIsFlipped(false);
    setShowHint(false);

    setTimeout(() => {
      setStudyQueue(newQueue);
      setCurrentCardIndex(nextIndex);
      setShowHint(true);
    }, 150);
  }, [studyQueue, currentCardIndex]);

  const currentCard = studyQueue[currentCardIndex];

  return {
    studyQueue,
    currentCard,
    currentCardIndex,
    isFlipped,
    showHint,
    setIsFlipped,
    reshuffle,
    nextCard,
    rebuildQueue: buildQueue,
  };
}
