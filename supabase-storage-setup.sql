-- Supabase Storage Setup for JalBandhu Report Images
-- Run this script in your Supabase SQL Editor to set up the storage bucket and policies

-- Create the storage bucket for report images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Users can upload report images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-images'
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow anonymous users to upload images (for public reports)
CREATE POLICY "Anonymous users can upload report images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-images'
);

-- Create storage policy to allow public read access to images
CREATE POLICY "Public can view report images" ON storage.objects
FOR SELECT USING (bucket_id = 'report-images');

-- Create storage policy to allow users to update their own uploaded images
CREATE POLICY "Users can update their own report images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'report-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy to allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own report images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: Create a function to get image metadata
CREATE OR REPLACE FUNCTION get_image_metadata(image_path text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'size', octet_length(objects.content),
    'mime_type', objects.metadata->>'mimetype',
    'created_at', objects.created_at,
    'updated_at', objects.updated_at
  ) INTO result
  FROM storage.objects
  WHERE objects.bucket_id = 'report-images'
    AND objects.name = image_path;

  RETURN result;
END;
$$;

-- Optional: Create a function to clean up old images (run as a scheduled job)
CREATE OR REPLACE FUNCTION cleanup_old_images(days_old integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'report-images'
    AND created_at < NOW() - INTERVAL '1 day' * days_old;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- Create an index for better performance on storage queries
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_name
ON storage.objects(bucket_id, name);

-- Log the setup completion
DO $$
BEGIN
  RAISE NOTICE 'Supabase Storage setup completed for JalBandhu report images';
  RAISE NOTICE 'Bucket: report-images';
  RAISE NOTICE 'Public access: Enabled';
  RAISE NOTICE 'File size limit: 10MB';
  RAISE NOTICE 'Allowed types: JPEG, PNG, WebP, GIF';
END $$;
