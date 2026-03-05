import { useState, useEffect, useCallback } from "react";
import {
  fetchSharedCards,
  addSharedCard,
  updateSharedCard,
  deleteSharedCard,
  addSharedCardsBulk,
} from "../lib/supabase";

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
      // Load from localStorage first
      const stored = localStorage.getItem("flashcards");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCards(parsed);
      }

      // Then load from database
      const sharedCards = await fetchSharedCards();
      if (sharedCards && sharedCards.length > 0) {
        const now = Date.now();
        const dbCards = sharedCards.map((card, index) => ({
          id: card.id ?? now + index,
          front: card.front || "",
          back: card.back || "",
          example: card.example || "",
          translation: card.translation || "",
          unit: card.unit || "General",
          level: card.level || "Beginner",
          box: 1,
          reviews: 0,
          lastReview: null,
          nextReview: null,
          created: now + index,
        }));

        setCards(dbCards);
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
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
        created: now,
      };

      setCards((prev) => [...prev, newCard]);
      return newCard;
    } catch (err) {
      console.error("Error adding card:", err);
      // Fallback to local only
      const now = Date.now();
      const newCard = {
        id: now,
        ...cardData,
        level: cardData.level || "Beginner",
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
        created: now,
      };
      setCards((prev) => [...prev, newCard]);
      return newCard;
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
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
        created: now + index,
      }));

      setCards((prev) => [...prev, ...newCards]);
      return newCards;
    } catch (err) {
      console.error("Error bulk adding cards:", err);
      throw err;
    }
  }, []);

  const rateCard = useCallback((cardId, correct) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;

        const newBox = correct ? Math.min(card.box + 1, 5) : 1;
        const intervals = {
          1: 0,
          2: 1 * 24 * 60 * 60 * 1000,
          3: 3 * 24 * 60 * 60 * 1000,
          4: 7 * 24 * 60 * 60 * 1000,
          5: 14 * 24 * 60 * 60 * 1000,
        };

        return {
          ...card,
          box: newBox,
          reviews: card.reviews + 1,
          lastReview: Date.now(),
          nextReview: Date.now() + (intervals[newBox] || 0),
        };
      }),
    );
  }, []);

  const resetProgress = useCallback(() => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        box: 1,
        reviews: 0,
        lastReview: null,
        nextReview: null,
      })),
    );
  }, []);

  const getUniqueUnits = useCallback(() => {
    const units = [...new Set(cards.map((card) => card.unit || "General"))];
    return units.sort();
  }, [cards]);

  const getStats = useCallback(() => {
    const total = cards.length;
    const mastered = cards.filter((c) => c.box >= 5).length;
    const learning = cards.filter((c) => c.box > 1 && c.box < 5).length;
    const newCards = cards.filter((c) => c.box === 1).length;
    const progress = total > 0 ? (mastered / total) * 100 : 0;

    return { total, mastered, learning, new: newCards, progress };
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
