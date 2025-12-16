-- ============================================
-- MIGRATION V2: Schema Simplificado
-- Remove role 'instructor', mantém apenas 'admin' e 'student'
-- ============================================

-- Atualizar constraint de role na tabela users
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'student'));

-- Atualizar todos os usuários com role 'instructor' para 'student'
UPDATE users 
SET role = 'student' 
WHERE role = 'instructor';

-- Adicionar campo video_embed_url em courses (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'video_embed_url'
  ) THEN
    ALTER TABLE courses ADD COLUMN video_embed_url TEXT;
  END IF;
END $$;

-- Garantir que lessons tem video_embed_url (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'video_embed_url'
  ) THEN
    ALTER TABLE lessons ADD COLUMN video_embed_url TEXT;
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, "order");
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(module_id, "order");
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_posts_course_id ON posts(course_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(course_id, pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(post_id, created_at ASC);

-- Atualizar RLS policies para remover referências a instructor
-- (As policies já devem estar corretas, mas vamos garantir)

-- Policy para courses: apenas admins podem gerenciar
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy para courses: todos autenticados podem ver
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

