-- ============================================
-- MIGRATION 012: Criar tabela notifications
-- Sistema de notificações in-app para usuários
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'mention', 'post', 'lesson', 'announcement', 'invite')),
  reference_id TEXT NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('post', 'comment', 'course', 'community', 'invite')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode criar notificações (via triggers)
CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Usuários podem atualizar suas próprias notificações (marcar como lida)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_reference_id TEXT,
  p_reference_type TEXT,
  p_title TEXT,
  p_content TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, reference_id, reference_type, title, content)
  VALUES (p_user_id, p_type, p_reference_id, p_reference_type, p_title, p_content)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar quando alguém comenta em um post
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
  v_post_title TEXT;
  v_commenter_name TEXT;
BEGIN
  -- Buscar autor do post
  SELECT user_id, title INTO v_post_author_id, v_post_title
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Buscar nome do comentarista
  SELECT name INTO v_commenter_name
  FROM users
  WHERE id = NEW.user_id;
  
  -- Não notificar se o comentarista é o próprio autor do post
  IF v_post_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_post_author_id,
      'comment',
      NEW.post_id::TEXT,
      'post',
      COALESCE(v_commenter_name, 'Alguém') || ' comentou no seu post',
      COALESCE(v_post_title, 'Post sem título')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_post_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.parent_id IS NULL)
  EXECUTE FUNCTION notify_post_comment();

-- Trigger para notificar quando alguém responde um comentário
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_author_id UUID;
  v_post_title TEXT;
  v_replier_name TEXT;
BEGIN
  -- Buscar autor do comentário pai
  SELECT user_id INTO v_parent_author_id
  FROM comments
  WHERE id = NEW.parent_id;
  
  -- Buscar título do post
  SELECT title INTO v_post_title
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Buscar nome de quem respondeu
  SELECT name INTO v_replier_name
  FROM users
  WHERE id = NEW.user_id;
  
  -- Não notificar se quem respondeu é o próprio autor do comentário pai
  IF v_parent_author_id != NEW.user_id THEN
    PERFORM create_notification(
      v_parent_author_id,
      'reply',
      NEW.id::TEXT,
      'comment',
      COALESCE(v_replier_name, 'Alguém') || ' respondeu seu comentário',
      COALESCE(v_post_title, 'Post sem título')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_comment_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  WHEN (NEW.parent_id IS NOT NULL)
  EXECUTE FUNCTION notify_comment_reply();

-- Trigger para notificar quando nova aula é adicionada
CREATE OR REPLACE FUNCTION notify_new_lesson()
RETURNS TRIGGER AS $$
DECLARE
  v_course_id INTEGER;
  v_course_title TEXT;
  v_enrolled_user RECORD;
BEGIN
  -- Buscar curso do módulo
  SELECT course_id INTO v_course_id
  FROM modules
  WHERE id = NEW.module_id;
  
  -- Buscar título do curso
  SELECT title INTO v_course_title
  FROM courses
  WHERE id = v_course_id;
  
  -- Notificar todos os inscritos no curso
  FOR v_enrolled_user IN
    SELECT user_id FROM enrollments WHERE course_id = v_course_id
  LOOP
    PERFORM create_notification(
      v_enrolled_user.user_id,
      'lesson',
      NEW.id::TEXT,
      'course',
      'Nova aula disponível',
      v_course_title || ': ' || NEW.title
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_lesson
  AFTER INSERT ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lesson();

-- Trigger para notificar quando novo aviso é criado
CREATE OR REPLACE FUNCTION notify_new_announcement()
RETURNS TRIGGER AS $$
DECLARE
  v_community_id UUID;
  v_member RECORD;
BEGIN
  -- Se o aviso tem community_id, notificar membros da comunidade
  IF NEW.community_id IS NOT NULL THEN
    FOR v_member IN
      SELECT user_id FROM community_members WHERE community_id = NEW.community_id
    LOOP
      PERFORM create_notification(
        v_member.user_id,
        'announcement',
        NEW.id::TEXT,
        'community',
        'Novo aviso',
        NEW.title
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_announcement
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_announcement();

