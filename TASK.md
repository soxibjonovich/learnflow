# LearnFlow

A vocabulary flashcard app built with React, Vite, Tailwind CSS, and Supabase. Study with flashcards, test yourself with quizzes, track progress, and let spaced repetition schedule your reviews automatically.

---

## Features

### Current
- **Flashcard study** — Leitner system with 5 boxes, Fisher-Yates shuffle
- **Quiz mode** — written and multiple-choice tests with unit filtering
- **Vocabulary lists** — organized by units (chapters, difficulty levels, categories)
- **Paraphrase practice** — learn to express the same idea multiple ways
- **Import / Export** — CSV, TSV, JSON, Quizlet format
- **Shared database** — collaborative card sets via Supabase (optional)
- **Dual storage** — shared cards in Supabase + personal progress in localStorage

### Planned improvements
- **Quizlet-style card transitions** — smooth CSS 3D flip animations with swipe navigation
- **Spaced repetition scheduling** — SM-2 algorithm with automatic review intervals (1d → 3d → 7d → 14d → 30d)
- **Progress tracking** — per-word mastery, streaks, review calendar
- **Cambridge audio** — auto-fetch pronunciation for any word, cached to Supabase
- **Unit management** — full CRUD for units and word sets in-app

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 18 |
| **Build tool** | Vite |
| **Styling** | Tailwind CSS + `tailwindcss-animate` |
| **Components** | shadcn/ui + Lucide icons |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **Deploy** | GitHub Pages / Docker + Nginx / Raspberry Pi |

---

## Project Structure

```
learnflow/
├── src/
│   ├── components/
│   │   ├── flashcard/
│   │   │   ├── FlashCard.jsx          # Card flip — CSS 3D transform
│   │   │   ├── FlashCardDeck.jsx      # Deck navigation, swipe, progress bar
│   │   │   └── flashcard.css          # Flip animation keyframes
│   │   ├── quiz/
│   │   │   ├── QuizCard.jsx           # Single question (written or multiple choice)
│   │   │   └── QuizSession.jsx        # Quiz flow, scoring, results
│   │   ├── vocabulary/
│   │   │   ├── VocabList.jsx          # Word list per unit
│   │   │   ├── VocabItem.jsx          # Single word row with audio button
│   │   │   └── AddWordForm.jsx        # Add / edit word
│   │   ├── units/
│   │   │   ├── UnitList.jsx           # All units overview
│   │   │   ├── UnitCard.jsx           # Unit summary with progress ring
│   │   │   └── UnitForm.jsx           # Create / edit unit
│   │   ├── progress/
│   │   │   ├── ProgressDashboard.jsx  # Stats, streaks, mastery %
│   │   │   └── RepetitionQueue.jsx    # Words due for review today
│   │   └── audio/
│   │       └── AudioButton.jsx        # Fetch + play Cambridge pronunciation
│   ├── hooks/
│   │   ├── useFlashCards.js           # Card state, flip, advance
│   │   ├── useQuiz.js                 # Quiz generation, answer handling
│   │   ├── useRepetition.js           # SM-2 scheduling, due-date queries
│   │   ├── useProgress.js             # Mastery stats
│   │   ├── useAudio.js                # Cambridge audio fetch + cache
│   │   └── useUnits.js                # Unit + word CRUD
│   ├── lib/
│   │   ├── supabase.js                # Supabase client init
│   │   ├── repetition.js              # SM-2 algorithm
│   │   └── cambridge.js              # Cambridge Dictionary audio scraper
│   └── App.jsx
├── supabase-schema.sql                # Full DB schema + RLS policies
├── example-import.csv
├── example-import.tsv
├── example-import.json
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Supabase Schema

### `units`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users` |
| `name` | `text` | Unit title |
| `description` | `text` | Optional |
| `created_at` | `timestamptz` | Default `now()` |

### `words`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `unit_id` | `uuid` | FK → `units` |
| `term` | `text` | Word or phrase |
| `definition` | `text` | Meaning |
| `translation` | `text` | Optional |
| `example` | `text` | Optional example sentence |
| `audio_url` | `text` | Cached Cambridge audio URL |
| `created_at` | `timestamptz` | |

### `progress`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK → `auth.users` |
| `word_id` | `uuid` | FK → `words` |
| `ease_factor` | `float` | SM-2, default `2.5` |
| `interval_days` | `int` | Current interval |
| `repetitions` | `int` | Successful review count |
| `next_review_at` | `timestamptz` | Scheduled next review |
| `last_reviewed_at` | `timestamptz` | |
| `status` | `text` | `new` / `learning` / `reviewing` / `mastered` |

> **Performance:** Add a `(user_id, next_review_at)` index on `progress` for efficient due-card queries. Never pull all progress records client-side — always filter by `next_review_at <= now()` server-side.

---

## Spaced Repetition (SM-2)

Reviews are scheduled automatically based on how well you know each word.

### Review intervals

| Answer | Next review |
|---|---|
| Again (forgot) | 1 day |
| Hard | 3 days |
| Good | 7 days |
| Easy | 14 days |
| Perfect | 30 days |

Intervals grow with each successful repetition, scaled by the word's `ease_factor`. A wrong answer resets the interval to 1 day.

### Word status lifecycle

```
new ──► learning ──► reviewing ──► mastered
        (< 3 reps)   (3–7 reps)   (8+ reps, interval ≥ 21d)
```

### `src/lib/repetition.js`

```js
// quality: 0 (again) → 5 (perfect)
export function sm2(card, quality) {
  let { ease_factor, interval_days, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 3;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  return { ease_factor, interval_days, repetitions, next_review_at };
}
```

---

## Card Flip Animation

Quizlet-style 3D flip using CSS transforms. Click flips front→back, swipe left/right advances through the deck.

### `flashcard.css`

```css
.card-container {
  perspective: 1000px;
}

.card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-face--back {
  transform: rotateY(180deg);
}
```

Swipe navigation is handled via pointer events in `FlashCardDeck.jsx` — swipe left for next card, right for previous.

---

## Cambridge Audio

Pronunciation audio is fetched from Cambridge Dictionary on first play, then cached to `words.audio_url` in Supabase so subsequent plays are instant with no extra network request.

### Flow

```
User clicks audio button
  │
  ├── audio_url exists in Supabase → play directly
  │
  └── audio_url is null
        → fetch Cambridge Dictionary page for term
        → parse .mp3 URL from HTML
        → save URL to words.audio_url
        → play audio
```

### `src/lib/cambridge.js`

```js
const BASE = "https://dictionary.cambridge.org/dictionary/english";

export async function fetchCambridgeAudio(term) {
  const res = await fetch(`${BASE}/${encodeURIComponent(term)}`);
  const html = await res.text();
  const match = html.match(
    /https:\/\/dictionary\.cambridge\.org\/media\/english\/[^"]+\.mp3/
  );
  return match ? match[0] : null;
}
```

> **Note:** This fetch runs client-side. If you hit CORS issues, proxy it through a Supabase Edge Function. If Cambridge changes their HTML structure the regex selector will need updating.

---

## Import / Export

### Supported formats

| Format | Notes |
|---|---|
| **CSV** | `term,definition,translation,example,unit` |
| **TSV** | Tab-separated, same columns |
| **Quizlet** | `term — definition` format |
| **JSON** | Full LearnFlow format including progress |

### How to import

1. Go to **Manage** tab → click **Import**
2. Select format, paste or upload data
3. Click **Import Cards**

Example files are included in the repo root: `example-import.csv`, `example-import.tsv`, `example-import.json`.

---

## Unit Management

Units group words into logical sets — textbook chapters, difficulty levels, grammar categories, etc.

| Action | Notes |
|---|---|
| Create unit | Name + optional description |
| Edit unit | Rename or update description |
| Delete unit | Cascades — removes all words and progress for that unit |
| Add word | Term, definition, translation, optional example |
| Edit word | Clears `audio_url` cache if term changes |
| Delete word | Removes word and its progress record |
| Bulk import | CSV / TSV / JSON via Import tab |

---

## Progress Tracking

`ProgressDashboard` shows:

- Total words studied
- Words due for review today
- Mastery % per unit (`mastered` / total words)
- Study streak (consecutive days with ≥ 1 review)
- Upcoming review calendar (next 7 days)

---

## Performance Notes

- **Audio caching** — `audio_url` stored after first fetch; Cambridge is never hit twice for the same word.
- **Server-side filtering** — due-card queries filter by `next_review_at <= now()` in Supabase, using the `(user_id, next_review_at)` index. Never load all progress records client-side.
- **Lazy loading** — word lists fetched only when a unit is opened.
- **Optimistic updates** — word CRUD and progress updates applied to local state immediately, before Supabase resolves.
- **Memoization** — `useMemo` / `useCallback` in quiz generation and card deck rendering to prevent unnecessary re-renders.
- **`tailwindcss-animate`** — handles transition classes so animation logic stays out of JS.

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For GitHub Pages deployment, add these as repository secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — the existing GitHub Actions workflow injects them at build time.

---

## Getting Started

```bash
npm install
npm run dev
```

Apply the schema by running `supabase-schema.sql` in your Supabase SQL editor. Enable Row Level Security on all tables with policies scoped to `auth.uid()`.

---

## Docker (Raspberry Pi / self-hosted)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose build --no-cache && docker-compose up -d
```

The image uses a multi-stage build (~50MB final), Nginx with gzip compression, and static asset caching. Optimized for ARM64 (Raspberry Pi 4B).

---

## Roadmap

| Version | What's changing |
|---|---|
| **Now** | Flashcards (Leitner), quiz, vocab lists, unit filtering, import/export, shared Supabase DB |
| **Next** | Quizlet-style card flip transitions + swipe navigation |
| **Next** | SM-2 spaced repetition scheduling (replaces Leitner) |
| **Next** | Progress dashboard — mastery %, streaks, review calendar |
| **Next** | Cambridge audio auto-fetch with Supabase caching |
| **Next** | Full unit CRUD in-app (create, rename, delete, bulk import) |
| **Later** | Offline support via service worker + local cache |