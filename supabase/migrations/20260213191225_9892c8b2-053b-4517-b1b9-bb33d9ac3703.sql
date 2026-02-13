
-- Add image_url column to community_posts
ALTER TABLE public.community_posts ADD COLUMN image_url text NULL;

-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public) VALUES ('community-images', 'community-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'community-images' AND auth.uid() IS NOT NULL);

-- Allow public read
CREATE POLICY "Community images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE
USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);
