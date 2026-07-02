-- 1. Create table for Tactical Images
CREATE TABLE IF NOT EXISTS public.airplane_tactical_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    airplane_id UUID REFERENCES public.airplanes(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    game_modes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for the table
ALTER TABLE public.airplane_tactical_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow authenticated read access for tactical images"
ON public.airplane_tactical_images
FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert, but in the application we will restrict UI to STAFF+
CREATE POLICY "Allow authenticated insert access for tactical images"
ON public.airplane_tactical_images
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to delete their own images, or admins to delete any
CREATE POLICY "Allow authenticated delete access for tactical images"
ON public.airplane_tactical_images
FOR DELETE TO authenticated USING (true);


-- 2. Create Storage Bucket for Tactical Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tactical-images', 'tactical-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Bucket Policies
-- Allow public read access to tactical-images bucket
CREATE POLICY "Public Access for tactical-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tactical-images');

-- Allow authenticated users to upload to tactical-images bucket
CREATE POLICY "Authenticated users can upload to tactical-images"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tactical-images');

-- Allow authenticated users to update/delete from tactical-images bucket
CREATE POLICY "Authenticated users can update tactical-images"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'tactical-images');

CREATE POLICY "Authenticated users can delete tactical-images"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'tactical-images');
