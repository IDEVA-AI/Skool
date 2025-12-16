-- ============================================
-- MIGRATION 006: Adicionar armazenamento de arquivos no banco
-- Armazena logo e capa como base64 diretamente no banco
-- ============================================

-- Adicionar colunas para armazenar arquivos como base64
ALTER TABLE communities 
ADD COLUMN IF NOT EXISTS logo_data TEXT,
ADD COLUMN IF NOT EXISTS cover_data TEXT,
ADD COLUMN IF NOT EXISTS logo_mime_type TEXT,
ADD COLUMN IF NOT EXISTS cover_mime_type TEXT;

-- Criar índices para melhorar queries (opcional)
CREATE INDEX IF NOT EXISTS idx_communities_has_logo ON communities(id) WHERE logo_data IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communities_has_cover ON communities(id) WHERE cover_data IS NOT NULL;

