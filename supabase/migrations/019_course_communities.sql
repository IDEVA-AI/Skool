-- Migração: Adicionar relacionamento N:N entre cursos e comunidades
-- Permite que um curso apareça em múltiplas comunidades

-- Tabela de relacionamento N:N entre cursos e comunidades
CREATE TABLE IF NOT EXISTS course_communities (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, community_id)
);

-- Habilitar RLS
ALTER TABLE course_communities ENABLE ROW LEVEL SECURITY;

-- Política de leitura: qualquer usuário autenticado pode ver os relacionamentos
CREATE POLICY "course_communities_read_policy" ON course_communities
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de inserção: apenas admins ou donos da comunidade podem adicionar
CREATE POLICY "course_communities_insert_policy" ON course_communities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM communities WHERE id = community_id AND owner_id = auth.uid()
    )
  );

-- Política de deleção: apenas admins ou donos da comunidade podem remover
CREATE POLICY "course_communities_delete_policy" ON course_communities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM communities WHERE id = community_id AND owner_id = auth.uid()
    )
  );

-- Migrar dados existentes: se um curso já tem community_id, adicionar à nova tabela
INSERT INTO course_communities (course_id, community_id)
SELECT id, community_id 
FROM courses 
WHERE community_id IS NOT NULL
ON CONFLICT (course_id, community_id) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_course_communities_course_id ON course_communities(course_id);
CREATE INDEX IF NOT EXISTS idx_course_communities_community_id ON course_communities(community_id);

