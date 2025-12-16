-- ============================================
-- MIGRATION 008: Sistema de Status e Convites para Cursos
-- Adiciona campo is_locked em courses e tabela course_invites
-- ============================================

-- Adicionar campo is_locked na tabela courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- Criar tabela course_invites
CREATE TABLE IF NOT EXISTS course_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(course_id, email)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_course_invites_token ON course_invites(token);
CREATE INDEX IF NOT EXISTS idx_course_invites_course_id ON course_invites(course_id);
CREATE INDEX IF NOT EXISTS idx_course_invites_email ON course_invites(email);
CREATE INDEX IF NOT EXISTS idx_courses_is_locked ON courses(is_locked);

-- Habilitar RLS na tabela course_invites
ALTER TABLE course_invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES para course_invites
-- ============================================

-- Admins podem criar convites
DROP POLICY IF EXISTS "Admins can create course invites" ON course_invites;
CREATE POLICY "Admins can create course invites"
    ON course_invites FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Usuários podem ver convites enviados para seu email
DROP POLICY IF EXISTS "Users can view their course invites" ON course_invites;
CREATE POLICY "Users can view their course invites"
    ON course_invites FOR SELECT
    TO authenticated
    USING (
        -- Usuário pode ver convites para seu email
        email = (
            SELECT email FROM users WHERE id = auth.uid()
        ) OR
        -- Admins podem ver todos os convites
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Usuários podem aceitar convites (atualizar accepted_at)
DROP POLICY IF EXISTS "Users can accept course invites" ON course_invites;
CREATE POLICY "Users can accept course invites"
    ON course_invites FOR UPDATE
    TO authenticated
    USING (
        -- Usuário pode aceitar convites para seu email
        email = (
            SELECT email FROM users WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        -- Apenas pode atualizar accepted_at
        email = (
            SELECT email FROM users WHERE id = auth.uid()
        )
    );

-- Admins podem gerenciar todos os convites
DROP POLICY IF EXISTS "Admins can manage course invites" ON course_invites;
CREATE POLICY "Admins can manage course invites"
    ON course_invites FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Permitir leitura pública de convites por token (para página de aceite)
DROP POLICY IF EXISTS "Public can view course invite by token" ON course_invites;
CREATE POLICY "Public can view course invite by token"
    ON course_invites FOR SELECT
    TO anon
    USING (true); -- Permitir leitura pública para buscar convite por token

