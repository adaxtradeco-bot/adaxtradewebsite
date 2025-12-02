-- Add isHomepage field to Page table
-- Run this manually: sqlite3 prisma/dev.db < add_homepage_field.sql

-- Add the new column
ALTER TABLE Page ADD COLUMN isHomepage BOOLEAN NOT NULL DEFAULT 0;

-- Ensure all existing pages are not marked as homepage
UPDATE Page SET isHomepage = 0;
