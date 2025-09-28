-- Create storage bucket for dog photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true);

-- Create policy to allow authenticated users to upload photos
CREATE POLICY "Users can upload their own dog photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'dog-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy to allow users to view all dog photos
CREATE POLICY "Anyone can view dog photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'dog-photos');

-- Create policy to allow users to delete their own dog photos
CREATE POLICY "Users can delete their own dog photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'dog-photos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
