-- ========================================
-- Supabase Storage Policies for Profile Pictures
-- ========================================
-- Run this in your Supabase SQL Editor to allow avatar uploads

-- First, create the bucket if it doesn't exist (do this in Supabase Dashboard > Storage)
-- Name: profile-pictures
-- Public: Yes

-- Allow anyone to view/download profile pictures (they're public avatars)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Allow service role to upload (for the avatar generator script)
-- The service_role key bypasses RLS, but we add this for clarity
CREATE POLICY "Service Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-pictures');

-- Allow service role to update/overwrite
CREATE POLICY "Service Update"  
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-pictures');

-- Allow service role to delete
CREATE POLICY "Service Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-pictures');

-- ========================================
-- ALTERNATIVE: Disable RLS on storage bucket
-- ========================================
-- If the above policies don't work, you can disable RLS on the bucket.
-- Go to Supabase Dashboard > Storage > profile-pictures > Policies
-- And toggle OFF "Enable Row Level Security"
--
-- OR run this SQL (requires appropriate permissions):
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- (Not recommended for production, but fine for personal projects)
