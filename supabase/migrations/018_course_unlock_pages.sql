-- ============================================
-- MIGRATION 018: Páginas de Desbloqueio de Cursos
-- Permite configurar conteúdo personalizado para cada página de desbloqueio
-- ============================================

-- Tabela para configurar páginas de desbloqueio por curso
CREATE TABLE IF NOT EXISTS course_unlock_pages (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  hero_image_url TEXT,
  hero_image_data TEXT,
  hero_image_mime_type TEXT,
  checkout_url TEXT,
  button_text TEXT DEFAULT 'Desbloquear Agora',
  price_text TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  additional_content TEXT,
  guarantee_text TEXT,
  payment_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_course_unlock_pages_course_id ON course_unlock_pages(course_id);
CREATE INDEX IF NOT EXISTS idx_course_unlock_pages_is_active ON course_unlock_pages(is_active);

-- Habilitar RLS
ALTER TABLE course_unlock_pages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES para course_unlock_pages
-- ============================================

-- Todos podem ver páginas ativas
DROP POLICY IF EXISTS "Public can view active unlock pages" ON course_unlock_pages;
CREATE POLICY "Public can view active unlock pages"
  ON course_unlock_pages FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins podem ver todas as páginas
DROP POLICY IF EXISTS "Admins can view all unlock pages" ON course_unlock_pages;
CREATE POLICY "Admins can view all unlock pages"
  ON course_unlock_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Apenas admins podem gerenciar páginas
DROP POLICY IF EXISTS "Admins can manage unlock pages" ON course_unlock_pages;
CREATE POLICY "Admins can manage unlock pages"
  ON course_unlock_pages FOR ALL
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

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_course_unlock_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_course_unlock_pages_updated_at ON course_unlock_pages;
CREATE TRIGGER trigger_update_course_unlock_pages_updated_at
  BEFORE UPDATE ON course_unlock_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_course_unlock_pages_updated_at();

