import { useCallback, useEffect, useState } from "react";
import { DEFAULT_READING_PASSAGES } from "@/constants/readingSamples";

const STORAGE_KEY = "learnflow-reading-passages-v1";

const normalizeQuestion = (question, index) => ({
  id: question.id || `${Date.now()}-${index}`,
  number: Number.isFinite(question.number) ? question.number : index + 1,
  type: question.type || "multiple_choice_single",
  prompt: question.prompt || "",
  options: Array.isArray(question.options)
    ? question.options.filter(Boolean)
    : [],
  correctAnswers: Array.isArray(question.correctAnswers)
    ? question.correctAnswers.filter(Boolean)
    : [],
  explanation: question.explanation || "",
});

const normalizePassage = (passage, index) => ({
  id: passage.id || `passage-${Date.now()}-${index}`,
  title: passage.title || `Passage ${index + 1}`,
  text: passage.text || "",
  instructions: passage.instructions || "",
  timeLimitMinutes:
    Number.isFinite(passage.timeLimitMinutes) && passage.timeLimitMinutes > 0
      ? passage.timeLimitMinutes
      : 20,
  questions: Array.isArray(passage.questions)
    ? passage.questions.map((question, questionIndex) =>
        normalizeQuestion(question, questionIndex),
      )
    : [],
  createdAt: passage.createdAt || Date.now(),
});

const mergeWithDefaultSamples = (storedPassages) => {
  const normalizedStored = storedPassages.map((passage, index) =>
    normalizePassage(passage, index),
  );
  const byId = new Map(normalizedStored.map((item) => [item.id, item]));

  DEFAULT_READING_PASSAGES.forEach((sample, index) => {
    byId.set(sample.id, normalizePassage(sample, index));
  });

  const sampleIds = new Set(
    DEFAULT_READING_PASSAGES.map((sample) => sample.id),
  );
  const defaults = [];
  const custom = [];

  byId.forEach((passage) => {
    if (sampleIds.has(passage.id)) defaults.push(passage);
    else custom.push(passage);
  });

  return [...defaults, ...custom];
};

export function useReadingPassages() {
  const [passages, setPassages] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setPassages(
          DEFAULT_READING_PASSAGES.map((passage, index) =>
            normalizePassage(passage, index),
          ),
        );
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setPassages(
          DEFAULT_READING_PASSAGES.map((passage, index) =>
            normalizePassage(passage, index),
          ),
        );
        return;
      }
      setPassages(mergeWithDefaultSamples(parsed));
    } catch (error) {
      console.error("Failed to load reading passages:", error);
      setPassages(
        DEFAULT_READING_PASSAGES.map((passage, index) =>
          normalizePassage(passage, index),
        ),
      );
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(passages));
    } catch (error) {
      console.error("Failed to save reading passages:", error);
    }
  }, [passages]);

  const addPassage = useCallback(
    (passage) => {
      const next = normalizePassage(
        { ...passage, id: `passage-${Date.now()}` },
        passages.length,
      );
      setPassages((prev) => [next, ...prev]);
      return next;
    },
    [passages.length],
  );

  const updatePassage = useCallback((passageId, updates) => {
    setPassages((prev) =>
      prev.map((passage, index) =>
        passage.id === passageId
          ? normalizePassage({ ...passage, ...updates }, index)
          : passage,
      ),
    );
  }, []);

  const deletePassage = useCallback((passageId) => {
    setPassages((prev) => prev.filter((passage) => passage.id !== passageId));
  }, []);

  return {
    passages,
    addPassage,
    updatePassage,
    deletePassage,
  };
}
