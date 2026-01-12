-- ========================================
-- Add avatar_options column to users table
-- ========================================
-- Run this in Supabase SQL Editor to add support for multiple avatar options

-- Add the avatar_options column (array of URLs)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_options TEXT[];

-- Comment for documentation
COMMENT ON COLUMN users.avatar_options IS 'Array of generated avatar image URLs for the user to choose from';
