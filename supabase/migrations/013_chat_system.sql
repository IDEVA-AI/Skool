-- ============================================
-- MIGRATION 013: Criar sistema de chat
-- Conversas diretas (DM) e grupos de chat
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm', 'group')),
  name TEXT, -- Nome do grupo (nullable para DMs)
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_conversations_community ON conversations(community_id) WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_course ON conversations(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_participants_conversation ON conversations_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON conversations_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_last_read ON conversations_participants(conversation_id, last_read_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Função para atualizar updated_at da conversa
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_updated_at
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- RLS Policies para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver conversas em que participam
CREATE POLICY "Users can view conversations they participate in"
  ON conversations
  FOR SELECT
  USING (
    id IN (
      SELECT conversation_id FROM conversations_participants
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem criar conversas
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies para conversations_participants
ALTER TABLE conversations_participants ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver participantes de conversas em que participam
CREATE POLICY "Users can view participants of their conversations"
  ON conversations_participants
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversations_participants
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem adicionar participantes (será controlado pela aplicação)
CREATE POLICY "Users can add participants"
  ON conversations_participants
  FOR INSERT
  WITH CHECK (true);

-- Usuários podem atualizar seu próprio last_read_at
CREATE POLICY "Users can update their own participation"
  ON conversations_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies para messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver mensagens de conversas em que participam
CREATE POLICY "Users can view messages from their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversations_participants
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem enviar mensagens em conversas em que participam
CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversations_participants
      WHERE user_id = auth.uid()
    )
  );

-- Usuários podem editar/deletar suas próprias mensagens
CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

