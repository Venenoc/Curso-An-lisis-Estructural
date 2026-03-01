-- Add total_lessons column to courses for auto-sync from admin panel
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0;
-- Add price column to modules for module cost
ALTER TABLE modules ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
