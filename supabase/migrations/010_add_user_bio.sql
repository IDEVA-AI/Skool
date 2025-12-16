-- ============================================
-- MIGRATION 010: Adicionar campo bio em users
-- Permite que usuários escrevam uma biografia no perfil
-- ============================================

-- Adicionar campo bio na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

