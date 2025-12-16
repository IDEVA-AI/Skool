-- ============================================
-- MIGRATION 004: Sistema de Comunidades Multi-Tenant
-- Cria estrutura para comunidades como portais independentes
-- ============================================

-- Criar tabela communities
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    access_type TEXT NOT NULL DEFAULT 'invite_only' CHECK (access_type IN ('invite_only', 'public_paid', 'both')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela community_members
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    stripe_subscription_id TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(community_id, user_id)
);

-- Criar tabela community_invites
CREATE TABLE IF NOT EXISTS community_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar community_id às tabelas existentes
-- Nota: courses já tinha community_id como TEXT (slug), então renomeamos e criamos nova UUID
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'community_id' AND data_type = 'text'
    ) THEN
        ALTER TABLE courses RENAME COLUMN community_id TO community_slug;
    END IF;
END $$;

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_owner_id ON communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_role ON community_members(community_id, role);
CREATE INDEX IF NOT EXISTS idx_community_invites_token ON community_invites(token);
CREATE INDEX IF NOT EXISTS idx_community_invites_community_id ON community_invites(community_id);
CREATE INDEX IF NOT EXISTS idx_community_invites_email ON community_invites(email);
CREATE INDEX IF NOT EXISTS idx_courses_community_id ON courses(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_announcements_community_id ON announcements(community_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON communities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;

-- Communities: Owners podem gerenciar suas comunidades, admins podem ver todas
DROP POLICY IF EXISTS "Owners can manage their communities" ON communities;
CREATE POLICY "Owners can manage their communities"
    ON communities FOR ALL
    TO authenticated
    USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Communities: Membros podem ver comunidades que pertencem
DROP POLICY IF EXISTS "Members can view their communities" ON communities;
CREATE POLICY "Members can view their communities"
    ON communities FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_members.community_id = communities.id
            AND community_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Community Members: Owners e admins podem gerenciar membros
DROP POLICY IF EXISTS "Owners and admins can manage members" ON community_members;
CREATE POLICY "Owners and admins can manage members"
    ON community_members FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_members.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Community Members: Membros podem ver outros membros da mesma comunidade
DROP POLICY IF EXISTS "Members can view community members" ON community_members;
CREATE POLICY "Members can view community members"
    ON community_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Community Invites: Owners e admins podem criar convites
DROP POLICY IF EXISTS "Owners and admins can create invites" ON community_invites;
CREATE POLICY "Owners and admins can create invites"
    ON community_invites FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_invites.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_invites.community_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Community Invites: Owners e admins podem ver convites de suas comunidades
DROP POLICY IF EXISTS "Owners and admins can view invites" ON community_invites;
CREATE POLICY "Owners and admins can view invites"
    ON community_invites FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = community_invites.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.community_id = community_invites.community_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Community Invites: Qualquer usuário pode usar um token válido para aceitar convite
-- Nota: A validação de email será feita na aplicação, não na policy
DROP POLICY IF EXISTS "Users can use valid invite tokens" ON community_invites;
CREATE POLICY "Users can use valid invite tokens"
    ON community_invites FOR UPDATE
    TO authenticated
    USING (
        used_at IS NULL
        AND expires_at > now()
    );

-- Atualizar RLS policies existentes para considerar community_id
-- Courses: Filtrar por comunidade
DROP POLICY IF EXISTS "Courses filtered by community" ON courses;
CREATE POLICY "Courses filtered by community"
    ON courses FOR SELECT
    TO authenticated
    USING (
        community_id IS NULL OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_members.community_id = courses.community_id
            AND community_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = courses.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Posts: Filtrar por comunidade
DROP POLICY IF EXISTS "Posts filtered by community" ON posts;
CREATE POLICY "Posts filtered by community"
    ON posts FOR SELECT
    TO authenticated
    USING (
        community_id IS NULL OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_members.community_id = posts.community_id
            AND community_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = posts.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Announcements: Filtrar por comunidade
DROP POLICY IF EXISTS "Announcements filtered by community" ON announcements;
CREATE POLICY "Announcements filtered by community"
    ON announcements FOR SELECT
    TO authenticated
    USING (
        community_id IS NULL OR
        EXISTS (
            SELECT 1 FROM community_members
            WHERE community_members.community_id = announcements.community_id
            AND community_members.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM communities
            WHERE communities.id = announcements.community_id
            AND communities.owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

