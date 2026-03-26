const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_REVIEW_STATE = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  status: "new",
  lastReview: null,
  nextReview: null,
};

export const REVIEW_LABELS = {
  0: "Again",
  3: "Hard",
  4: "Good",
  5: "Easy",
  6: "Perfect",
};

export function deriveStatus(repetitions, intervalDays) {
  if (repetitions >= 8 && intervalDays >= 21) return "mastered";
  if (repetitions >= 3) return "reviewing";
  if (repetitions > 0) return "learning";
  return "new";
}

export function normalizeCardReviewState(card) {
  const easeFactor = Number(card.easeFactor ?? card.ease_factor ?? 2.5);
  const intervalDays = Number(card.intervalDays ?? card.interval_days ?? 0);
  const repetitions = Number(card.repetitions ?? card.reviews ?? 0);
  const lastReview = card.lastReview ?? card.last_reviewed_at ?? null;
  const nextReview = card.nextReview ?? card.next_review_at ?? null;
  const box =
    typeof card.box === "number"
      ? card.box
      : Math.min(Math.max(repetitions + 1, 1), 5);

  return {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    reviews: repetitions,
    status: card.status || deriveStatus(repetitions, intervalDays),
    lastReview,
    nextReview,
    box,
  };
}

export function sm2(card, quality) {
  let easeFactor = Number(card.easeFactor ?? 2.5);
  let intervalDays = Number(card.intervalDays ?? 0);
  let repetitions = Number(card.repetitions ?? 0);

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));

    if (quality === 3) intervalDays = Math.max(1, Math.round(intervalDays * 0.6));
    if (quality === 5) intervalDays = Math.max(1, Math.round(intervalDays * 1.4));
    if (quality >= 6) intervalDays = Math.max(1, Math.round(intervalDays * 2));

    repetitions += 1;
  }

  const adjustedQuality = Math.min(quality, 5);
  easeFactor =
    easeFactor +
    (0.1 -
      (5 - adjustedQuality) * (0.08 + (5 - adjustedQuality) * 0.02));

  if (quality >= 6) easeFactor += 0.08;
  if (easeFactor < 1.3) easeFactor = 1.3;

  const reviewDate = new Date();
  reviewDate.setHours(12, 0, 0, 0);
  const nextReview = reviewDate.getTime() + intervalDays * DAY_IN_MS;

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    repetitions,
    reviews: repetitions,
    status: deriveStatus(repetitions, intervalDays),
    lastReview: Date.now(),
    nextReview,
    box: Math.min(Math.max(repetitions + 1, 1), 5),
  };
}

export function formatRelativeReview(nextReview) {
  if (!nextReview) return "Now";

  const diffDays = Math.max(0, Math.round((nextReview - Date.now()) / DAY_IN_MS));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
}
