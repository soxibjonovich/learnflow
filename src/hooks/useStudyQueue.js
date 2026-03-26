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
      .sort((a, b) => {
        const nextReviewDelta = (a.nextReview || 0) - (b.nextReview || 0);
        if (nextReviewDelta !== 0) return nextReviewDelta;
        return (a.repetitions || 0) - (b.repetitions || 0);
      });

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

  const goToNextCard = useCallback(() => {
    if (studyQueue.length <= 1) return;
    setCurrentCardIndex((prev) => (prev + 1) % studyQueue.length);
    setIsFlipped(false);
    setShowHint(true);
  }, [studyQueue.length]);

  const goToPreviousCard = useCallback(() => {
    if (studyQueue.length <= 1) return;
    setCurrentCardIndex((prev) =>
      prev === 0 ? studyQueue.length - 1 : prev - 1,
    );
    setIsFlipped(false);
    setShowHint(true);
  }, [studyQueue.length]);

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
    goToNextCard,
    goToPreviousCard,
    nextCard,
    rebuildQueue: buildQueue,
  };
}
