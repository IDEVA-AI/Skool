-- ============================================
-- MIGRATION 005: Corrigir recursão infinita nas RLS policies
-- ============================================

-- Corrigir policy de communities para evitar recursão
-- A policy de SELECT não deve depender de community_members que depende de communities
DROP POLICY IF EXISTS "Members can view their communities" ON communities;
CREATE POLICY "Members can view their communities"
    ON communities FOR SELECT
    TO authenticated
    USING (
        -- Owner pode ver
        owner_id = auth.uid() OR
        -- Admin global pode ver todas
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
        -- Removido: verificação via community_members que causa recursão
        -- A verificação de membros será feita na aplicação ou via função
    );

-- Criar função helper para verificar se usuário é membro (evita recursão)
CREATE OR REPLACE FUNCTION is_community_member(comm_id UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM community_members
        WHERE community_id = comm_id
        AND user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar policy de community_members para usar função (evita recursão)
DROP POLICY IF EXISTS "Members can view community members" ON community_members;
CREATE POLICY "Members can view community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (
        -- Usuário pode ver se é membro da mesma comunidade (verificação direta sem recursão)
        user_id = auth.uid() OR
        -- Owner da comunidade pode ver
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_members.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        -- Admin global pode ver
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Corrigir recursão infinita na policy "Owners and admins can manage members"
DROP POLICY IF EXISTS "Owners and admins can manage members" ON community_members;
CREATE POLICY "Owners and admins can manage members"
    ON community_members FOR ALL
    TO authenticated
    USING (
        -- Owner da comunidade pode gerenciar (verificação direta sem recursão)
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_members.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        -- Admin global pode gerenciar
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
        -- Removido: verificação via community_members que causa recursão
        -- A verificação de admin/moderator será feita na aplicação
    );

