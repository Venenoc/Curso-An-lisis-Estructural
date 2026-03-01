-- Add materials column to lessons table
-- Materials are stored as a JSONB array of { title: string, url: string } objects

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;
