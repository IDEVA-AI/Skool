-- ============================================
-- POLÍTICAS RLS PARA SUPABASE STORAGE
-- ============================================
-- Execute este script no Supabase SQL Editor
-- após criar o bucket 'course-media'
-- ============================================

-- IMPORTANTE: Crie o bucket primeiro no Dashboard:
-- Storage → Buckets → New Bucket
-- Nome: course-media
-- Public: ✅ (marcado)
-- File size limit: 52428800 (50MB)

-- Permitir upload para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-media');

-- Permitir leitura pública (para URLs públicas)
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-media');

-- Permitir delete para usuários autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-media');

-- Permitir update para usuários autenticados (opcional)
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-media')
WITH CHECK (bucket_id = 'course-media');

-- Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%course-media%';

