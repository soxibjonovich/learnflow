-- ============================================================
-- LearnFlow — DB migrations
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run on existing DB: uses IF NOT EXISTS / IF EXISTS guards
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. PARAPHRASES — add missing `source` column
-- ────────────────────────────────────────────────────────────
ALTER TABLE paraphrases
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT '';

-- Allow UPDATE (was missing from original schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'paraphrases'
      AND policyname = 'Enable update for all users on paraphrases'
  ) THEN
    CREATE POLICY "Enable update for all users on paraphrases" ON paraphrases
      FOR UPDATE
      USING (true);
  END IF;
END$$;


-- ────────────────────────────────────────────────────────────
-- 2. SYNONYMS table  (A → B1/B2 → C1/C2/C3 progressions)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS synonyms (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  a          TEXT        NOT NULL DEFAULT '',   -- simple / base word
  b1         TEXT        NOT NULL DEFAULT '',   -- intermediate synonym 1
  b2         TEXT        NOT NULL DEFAULT '',   -- intermediate synonym 2
  c1         TEXT        NOT NULL DEFAULT '',   -- advanced synonym 1
  c2         TEXT        NOT NULL DEFAULT '',   -- advanced synonym 2
  c3         TEXT        NOT NULL DEFAULT '',   -- advanced synonym 3
  source     TEXT        NOT NULL DEFAULT '',   -- reading / passage
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE synonyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "synonyms: read all"   ON synonyms FOR SELECT USING (true);
CREATE POLICY "synonyms: insert all" ON synonyms FOR INSERT WITH CHECK (true);
CREATE POLICY "synonyms: update all" ON synonyms FOR UPDATE USING (true);
CREATE POLICY "synonyms: delete all" ON synonyms FOR DELETE USING (true);

CREATE TRIGGER update_synonyms_updated_at
  BEFORE UPDATE ON synonyms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();   -- reuse existing fn

ALTER PUBLICATION supabase_realtime ADD TABLE synonyms;


-- ────────────────────────────────────────────────────────────
-- 3. MATCHING table  (Statement → Match / True-False / etc.)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matching (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  statement  TEXT        NOT NULL DEFAULT '',   -- heading / statement
  match      TEXT        NOT NULL DEFAULT '',   -- answer label (A / B / True …)
  notes      TEXT        NOT NULL DEFAULT '',   -- explanation / why
  source     TEXT        NOT NULL DEFAULT '',   -- passage / reading
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE matching ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matching: read all"   ON matching FOR SELECT USING (true);
CREATE POLICY "matching: insert all" ON matching FOR INSERT WITH CHECK (true);
CREATE POLICY "matching: update all" ON matching FOR UPDATE USING (true);
CREATE POLICY "matching: delete all" ON matching FOR DELETE USING (true);

CREATE TRIGGER update_matching_updated_at
  BEFORE UPDATE ON matching
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE matching;
