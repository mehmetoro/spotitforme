-- =============================================
-- SPOT IMAGES STORAGE POLICIES
-- =============================================
-- Ensures authenticated users can manage files under their own folder
-- in the `spot-images` bucket using path format: <user_id>/...

DROP POLICY IF EXISTS "spot_images_insert_own_folder" ON storage.objects;
CREATE POLICY "spot_images_insert_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'spot-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "spot_images_update_own_folder" ON storage.objects;
CREATE POLICY "spot_images_update_own_folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'spot-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'spot-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );

DROP POLICY IF EXISTS "spot_images_delete_own_folder" ON storage.objects;
CREATE POLICY "spot_images_delete_own_folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'spot-images'
    AND split_part(name, '/', 1) = auth.uid()::text
  );
