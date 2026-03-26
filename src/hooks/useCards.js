import { useState, useEffect, useCallback } from "react";
import {
  fetchSharedCards,
  addSharedCard,
  updateSharedCard,
  deleteSharedCard,
  addSharedCardsBulk,
} from "../lib/supabase";
import {
  DEFAULT_REVIEW_STATE,
  normalizeCardReviewState,
  sm2,
} from "../lib/repetition";

/**
 * useCards Hook
 * Manages all card operations (CRUD)
 */
export function useCards() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cards from localStorage and database
  useEffect(() => {
    loadCards();
  }, []);

  // Save to localStorage whenever cards change
  useEffect(() => {
    if (cards.length >= 0) {
      localStorage.setItem("flashcards", JSON.stringify(cards));
    }
  }, [cards]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      let localCards = [];

      // Load from localStorage first
      const stored = localStorage.getItem("flashcards");
      if (stored) {
        localCards = JSON.parse(stored).map(normalizeCardReviewState);
        setCards(localCards);
      }

      // Then load from database
      const sharedCards = await fetchSharedCards();
      if (sharedCards && sharedCards.length > 0) {
        const now = Date.now();
        const localCardsById = new Map(
          localCards.map((card) => [card.id, card]),
        );
        const dbCards = sharedCards.map((card, index) => ({
          id: card.id ?? now + index,
          front: card.front || "",
          back: card.back || "",
          example: card.example || "",
          translation: card.translation || "",
          unit: card.unit || "General",
          level: card.level || "Beginner",
          created: now + index,
          ...DEFAULT_REVIEW_STATE,
        }));
        const mergedCards = dbCards.map((dbCard) => {
          const localCard = localCardsById.get(dbCard.id);

          if (!localCard) {
            return normalizeCardReviewState(dbCard);
          }

          return normalizeCardReviewState({
            ...dbCard,
            box: localCard.box ?? dbCard.box,
            repetitions: localCard.repetitions ?? dbCard.repetitions,
            lastReview: localCard.lastReview ?? dbCard.lastReview,
            nextReview: localCard.nextReview ?? dbCard.nextReview,
            intervalDays: localCard.intervalDays ?? dbCard.intervalDays,
            easeFactor: localCard.easeFactor ?? dbCard.easeFactor,
            status: localCard.status ?? dbCard.status,
            created: localCard.created ?? dbCard.created,
          });
        });

        const dbIds = new Set(mergedCards.map((card) => card.id));
        const localOnlyCards = localCards
          .filter((card) => !dbIds.has(card.id))
          .map(normalizeCardReviewState);

        setCards([...mergedCards, ...localOnlyCards]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading cards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addCard = useCallback(async (cardData) => {
    try {
      const saved = await addSharedCard(cardData);
      const now = Date.now();

      const newCard = {
        id: saved.id,
        ...cardData,
        level: cardData.level || "Beginner",
        created: now,
        ...DEFAULT_REVIEW_STATE,
      };

      setCards((prev) => [...prev, normalizeCardReviewState(newCard)]);
      return newCard;
    } catch (err) {
      console.error("Error adding card:", err);
      // Fallback to local only
      const now = Date.now();
      const newCard = {
        id: now,
        ...cardData,
        level: cardData.level || "Beginner",
        created: now,
        ...DEFAULT_REVIEW_STATE,
      };
      const normalized = normalizeCardReviewState(newCard);
      setCards((prev) => [...prev, normalized]);
      return normalized;
    }
  }, []);

  const updateCard = useCallback(async (id, updates) => {
    try {
      await updateSharedCard(id, updates);
      setCards((prev) =>
        prev.map((card) => (card.id === id ? { ...card, ...updates } : card)),
      );
    } catch (err) {
      console.error("Error updating card:", err);
      setError(err.message);
    }
  }, []);

  const deleteCard = useCallback(async (id) => {
    try {
      await deleteSharedCard(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Error deleting card:", err);
      setError(err.message);
    }
  }, []);

  const bulkAddCards = useCallback(async (cardsData) => {
    try {
      const saved = await addSharedCardsBulk(cardsData);
      const now = Date.now();

      const newCards = saved.map((card, index) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        translation: card.translation || "",
        example: card.example || "",
        unit: card.unit || "General",
        level: card.level || "Beginner",
        created: now + index,
        ...DEFAULT_REVIEW_STATE,
      }));

      const normalized = newCards.map(normalizeCardReviewState);
      setCards((prev) => [...prev, ...normalized]);
      return normalized;
    } catch (err) {
      console.error("Error bulk adding cards:", err);
      const now = Date.now();
      const localCards = cardsData.map((card, index) => ({
        id: now + index,
        front: card.front,
        back: card.back,
        translation: card.translation || "",
        example: card.example || "",
        unit: card.unit || "General",
        level: card.level || "Beginner",
        created: now + index,
        ...DEFAULT_REVIEW_STATE,
      }));

      const normalized = localCards.map(normalizeCardReviewState);
      setCards((prev) => [...prev, ...normalized]);
      setError("Database unavailable. Imported cards were saved locally.");
      return normalized;
    }
  }, []);

  const rateCard = useCallback((cardId, quality) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        return { ...card, ...sm2(card, quality) };
      }),
    );
  }, []);

  const resetProgress = useCallback(() => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        ...DEFAULT_REVIEW_STATE,
        box: 1,
      })),
    );
  }, []);

  const getUniqueUnits = useCallback(() => {
    const units = [...new Set(cards.map((card) => card.unit || "General"))];
    return units.sort();
  }, [cards]);

  const getStats = useCallback(() => {
    const now = Date.now();
    const total = cards.length;
    const mastered = cards.filter((c) => c.status === "mastered").length;
    const reviewing = cards.filter((c) => c.status === "reviewing").length;
    const learning = cards.filter((c) => c.status === "learning").length;
    const newCards = cards.filter((c) => c.status === "new").length;
    const due = cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
    const progress = total > 0 ? (mastered / total) * 100 : 0;

    return { total, mastered, reviewing, learning, due, new: newCards, progress };
  }, [cards]);

  return {
    cards,
    isLoading,
    error,
    addCard,
    updateCard,
    deleteCard,
    bulkAddCards,
    rateCard,
    resetProgress,
    getUniqueUnits,
    getStats,
    reloadCards: loadCards,
  };
}
