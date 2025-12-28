-- ============================================
-- MIGRATION 014: Adicionar campos de botão aos avisos
-- Permite que avisos tenham um botão com texto e URL personalizados
-- ============================================

ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Saiba mais',
ADD COLUMN IF NOT EXISTS button_url TEXT;

