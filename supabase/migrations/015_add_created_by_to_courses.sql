-- ============================================
-- MIGRATION 015: Adicionar coluna created_by em courses
-- Permite rastrear quem criou cada curso
-- ============================================

-- Adicionar coluna created_by na tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Criar índice para performance (já existe na migration 001, mas garantimos que existe)
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);

-- Atualizar cursos existentes sem created_by com o primeiro admin encontrado
-- (ou null se não houver admin)
UPDATE courses
SET created_by = (
  SELECT id FROM users WHERE role = 'admin' LIMIT 1
)
WHERE created_by IS NULL;

