-- ============================================
-- MIGRATION 003: Adicionar suporte a comentários encadeados
-- Adiciona coluna parent_id à tabela comments para permitir respostas
-- ============================================

-- Adicionar coluna parent_id à tabela comments
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS parent_id INTEGER;

-- Adicionar foreign key constraint (self-referencing)
-- Primeiro, remover a constraint se já existir (para evitar erros em re-runs)
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;

ALTER TABLE comments
ADD CONSTRAINT comments_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES comments(id) 
ON DELETE CASCADE;

-- Criar índice para melhorar performance de queries que buscam respostas
CREATE INDEX IF NOT EXISTS idx_comments_parent_id 
ON comments(parent_id) 
WHERE parent_id IS NOT NULL;

-- Criar índice composto para queries de comentários por post e parent
CREATE INDEX IF NOT EXISTS idx_comments_post_parent 
ON comments(post_id, parent_id, created_at ASC);

