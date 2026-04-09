DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('asset-photos', 'asset-photos', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Create policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'asset-photos' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK ( bucket_id = 'asset-photos' );

CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE TO authenticated
USING ( bucket_id = 'asset-photos' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE TO authenticated
USING ( bucket_id = 'asset-photos' );
