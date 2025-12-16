-- ============================================
-- MIGRATION 009: Adicionar campo order em courses
-- Permite reordenação de cursos via drag-and-drop
-- ============================================

-- Adicionar campo order na tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- Criar índice para performance em queries ordenadas
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses("order");

-- Atualizar cursos existentes com valores sequenciais baseados em created_at
-- Isso garante que cursos antigos tenham uma ordem definida
UPDATE courses
SET "order" = subquery.row_number
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_number
  FROM courses
  WHERE "order" IS NULL
) AS subquery
WHERE courses.id = subquery.id;

-- Definir valor padrão para novos cursos (será o próximo número sequencial)
-- Nota: Em produção, isso deve ser gerenciado pela aplicação
ALTER TABLE courses 
ALTER COLUMN "order" SET DEFAULT NULL;

-- Criar índice composto para ordenação por comunidade (se necessário)
CREATE INDEX IF NOT EXISTS idx_courses_community_order ON courses(community_id, "order") WHERE community_id IS NOT NULL;

