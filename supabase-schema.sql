-- SQL to run in Supabase SQL Editor
-- This creates the shared_cards table

CREATE TABLE shared_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  translation TEXT,
  example TEXT,
  unit TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE shared_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Enable read access for all users" ON shared_cards
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert (no auth required)
CREATE POLICY "Enable insert for all users" ON shared_cards
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update (no auth required)
CREATE POLICY "Enable update for all users" ON shared_cards
  FOR UPDATE
  USING (true);

-- Policy: Anyone can delete (no auth required)
CREATE POLICY "Enable delete for all users" ON shared_cards
  FOR DELETE
  USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE shared_cards;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shared_cards_updated_at
  BEFORE UPDATE ON shared_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Paraphrases table
CREATE TABLE paraphrases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original TEXT NOT NULL,
  variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for paraphrases
ALTER TABLE paraphrases ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read paraphrases
CREATE POLICY "Enable read access for all users on paraphrases" ON paraphrases
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert paraphrases (no auth required)
CREATE POLICY "Enable insert for all users on paraphrases" ON paraphrases
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can delete paraphrases (no auth required)
CREATE POLICY "Enable delete for all users on paraphrases" ON paraphrases
  FOR DELETE
  USING (true);

-- Enable real-time for paraphrases (optional – app does not yet subscribe)
ALTER PUBLICATION supabase_realtime ADD TABLE paraphrases;

CREATE TRIGGER update_paraphrases_updated_at
  BEFORE UPDATE ON paraphrases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
