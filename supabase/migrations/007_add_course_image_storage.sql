-- ============================================
-- MIGRATION 007: Adicionar armazenamento de imagem de capa em courses
-- Armazena imagem de capa como base64 diretamente no banco
-- ============================================

-- Adicionar colunas para armazenar imagem de capa como base64
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS cover_image_data TEXT,
ADD COLUMN IF NOT EXISTS cover_image_mime_type TEXT;

-- Criar índice para melhorar queries (opcional)
CREATE INDEX IF NOT EXISTS idx_courses_has_cover_image ON courses(id) WHERE cover_image_data IS NOT NULL;

