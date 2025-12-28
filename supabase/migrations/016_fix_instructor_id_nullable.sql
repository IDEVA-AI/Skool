-- ============================================
-- MIGRATION 016: Tornar instructor_id nullable em courses
-- A coluna instructor_id foi substituída por created_by
-- ============================================

-- Tornar instructor_id nullable (já não é mais usada, foi substituída por created_by)
ALTER TABLE courses 
ALTER COLUMN instructor_id DROP NOT NULL;

-- Opcional: Se quiser remover a coluna completamente no futuro, use:
-- ALTER TABLE courses DROP COLUMN IF EXISTS instructor_id;

