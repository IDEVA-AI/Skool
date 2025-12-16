-- ============================================
-- MIGRATION 011: Criar tabela saved_posts
-- Permite que usuários salvem postagens favoritas
-- ============================================

CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON saved_posts(post_id);

-- RLS Policies
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios posts salvos
CREATE POLICY "Users can view their own saved posts"
  ON saved_posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem salvar posts
CREATE POLICY "Users can save posts"
  ON saved_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover seus próprios posts salvos
CREATE POLICY "Users can delete their own saved posts"
  ON saved_posts
  FOR DELETE
  USING (auth.uid() = user_id);

