-- =============================================================
-- iSkool Seed Data
-- Execute via Supabase MCP (execute_sql) ou SQL Editor do Dashboard
-- Senha de todos os usuários: Teste123!
-- =============================================================

-- Limpar dados existentes (ordem reversa de dependências)
TRUNCATE comments, posts, announcements, lesson_progress, enrollments,
         lessons, modules, course_communities, courses,
         community_members, communities, notifications,
         saved_posts, conversations_participants, messages, conversations
CASCADE;
TRUNCATE public.users CASCADE;
DELETE FROM auth.identities WHERE user_id IN ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003');
DELETE FROM auth.users WHERE id IN ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003');

-- =============================================================
-- Seed completo em bloco DO (transacional)
-- =============================================================
DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_maria_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_joao_id  UUID := 'a0000000-0000-0000-0000-000000000003';
  v_community_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_now TIMESTAMPTZ := NOW();
  v_password_hash TEXT := crypt('Teste123!', gen_salt('bf'));
BEGIN

-- =============================================================
-- 1. Auth Users + Public Users
-- =============================================================
-- Senha "Teste123!" encriptada com bcrypt

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@iskool.com.br', v_password_hash, v_now,
   '{"provider":"email","providers":["email"]}', '{"name":"Admin iSkool"}',
   v_now, v_now, '', '', '', ''),
  (v_maria_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maria@teste.com', v_password_hash, v_now,
   '{"provider":"email","providers":["email"]}', '{"name":"Maria Silva"}',
   v_now, v_now, '', '', '', ''),
  (v_joao_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'joao@teste.com', v_password_hash, v_now,
   '{"provider":"email","providers":["email"]}', '{"name":"João Santos"}',
   v_now, v_now, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required for email login)
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  (v_admin_id, v_admin_id, 'admin@iskool.com.br', 'email',
   jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@iskool.com.br', 'email_verified', true, 'phone_verified', false),
   v_now, v_now, v_now),
  (v_maria_id, v_maria_id, 'maria@teste.com', 'email',
   jsonb_build_object('sub', v_maria_id::text, 'email', 'maria@teste.com', 'email_verified', true, 'phone_verified', false),
   v_now, v_now, v_now),
  (v_joao_id, v_joao_id, 'joao@teste.com', 'email',
   jsonb_build_object('sub', v_joao_id::text, 'email', 'joao@teste.com', 'email_verified', true, 'phone_verified', false),
   v_now, v_now, v_now)
ON CONFLICT (id) DO NOTHING;

-- Public users (upsert — trigger on auth.users may auto-create these)
INSERT INTO public.users (id, email, name, role, created_at) VALUES
  (v_admin_id, 'admin@iskool.com.br', 'Admin iSkool', 'admin', v_now),
  (v_maria_id, 'maria@teste.com', 'Maria Silva', 'student', v_now),
  (v_joao_id,  'joao@teste.com', 'João Santos', 'student', v_now)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- =============================================================
-- 2. Community
-- =============================================================
INSERT INTO communities (id, slug, name, description, owner_id, access_type, created_at, updated_at) VALUES
  (v_community_id, 'iskool', 'Comunidade iSkool',
   'Bem-vindo à comunidade oficial do iSkool! Aqui você encontra cursos, discussões e networking com outros profissionais.',
   v_admin_id, 'public_paid', v_now, v_now);

-- =============================================================
-- 3. Community Members
-- =============================================================
INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  (gen_random_uuid(), v_community_id, v_admin_id, 'owner', v_now),
  (gen_random_uuid(), v_community_id, v_maria_id, 'member', v_now),
  (gen_random_uuid(), v_community_id, v_joao_id,  'member', v_now);

-- =============================================================
-- 4. Courses
-- =============================================================
INSERT INTO courses (id, title, description, community_id, created_by, is_locked, "order", created_at, updated_at) VALUES
  (1, 'Desenvolvimento Web Completo',
   'Aprenda HTML, CSS, JavaScript, React e Node.js do zero ao avançado. Curso completo com projetos práticos e certificado.',
   v_community_id, v_admin_id, false, 1, v_now, v_now),
  (2, 'Marketing Digital Avançado',
   'Domine as estratégias de marketing digital: SEO, tráfego pago, copywriting, funis de vendas e automações.',
   v_community_id, v_admin_id, false, 2, v_now, v_now);

PERFORM setval('courses_id_seq', 2);

-- Course-Community link
INSERT INTO course_communities (course_id, community_id, created_at) VALUES
  (1, v_community_id, v_now),
  (2, v_community_id, v_now);

-- =============================================================
-- 5. Modules (columns: id, course_id, title, order, created_at)
-- =============================================================
-- Curso 1: Desenvolvimento Web
INSERT INTO modules (id, course_id, title, "order", created_at) VALUES
  (1, 1, 'Fundamentos do HTML e CSS', 1, v_now),
  (2, 1, 'JavaScript Essencial', 2, v_now),
  (3, 1, 'React na Prática', 3, v_now);

-- Curso 2: Marketing Digital
INSERT INTO modules (id, course_id, title, "order", created_at) VALUES
  (4, 2, 'SEO e Tráfego Orgânico', 1, v_now),
  (5, 2, 'Tráfego Pago e Anúncios', 2, v_now);

PERFORM setval('modules_id_seq', 5);

-- =============================================================
-- 6. Lessons (columns: id, module_id, title, content_url, content_type, duration, order, created_at)
-- =============================================================
-- Módulo 1: HTML e CSS
INSERT INTO lessons (id, module_id, title, content_url, content_type, "order", created_at) VALUES
  (1, 1, 'Introdução ao HTML',
   'https://www.youtube.com/embed/Ejkb_YpuHWs', 'video', 1, v_now),
  (2, 1, 'Estilizando com CSS',
   'https://www.youtube.com/embed/1PnVor36_40', 'video', 2, v_now),
  (3, 1, 'Projeto: Landing Page',
   NULL, 'text', 3, v_now);

-- Módulo 2: JavaScript
INSERT INTO lessons (id, module_id, title, content_url, content_type, "order", created_at) VALUES
  (4, 2, 'Variáveis e Tipos de Dados',
   'https://www.youtube.com/embed/i6Oi-YtXnAU', 'video', 1, v_now),
  (5, 2, 'Funções e Escopo',
   'https://www.youtube.com/embed/hRJrp17WnOE', 'video', 2, v_now);

-- Módulo 3: React
INSERT INTO lessons (id, module_id, title, content_url, content_type, "order", created_at) VALUES
  (6, 3, 'Componentes e JSX',
   'https://www.youtube.com/embed/pKYhOoGFz8M', 'video', 1, v_now),
  (7, 3, 'Hooks: useState e useEffect',
   'https://www.youtube.com/embed/dpw9EHDh2bM', 'video', 2, v_now);

-- Módulo 4: SEO
INSERT INTO lessons (id, module_id, title, content_url, content_type, "order", created_at) VALUES
  (8, 4, 'Fundamentos de SEO',
   'https://www.youtube.com/embed/DvwS7cV9GmQ', 'video', 1, v_now),
  (9, 4, 'Pesquisa de Palavras-Chave',
   NULL, 'text', 2, v_now);

-- Módulo 5: Tráfego Pago
INSERT INTO lessons (id, module_id, title, content_url, content_type, "order", created_at) VALUES
  (10, 5, 'Facebook Ads do Zero',
   'https://www.youtube.com/embed/DAQNHzOcO5A', 'video', 1, v_now),
  (11, 5, 'Google Ads para Iniciantes',
   NULL, 'text', 2, v_now);

PERFORM setval('lessons_id_seq', 11);

-- =============================================================
-- 7. Enrollments (id is serial integer — omit it)
-- All users enrolled in all courses so they can see posts
-- =============================================================
INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
  (v_admin_id, 1, v_now),
  (v_admin_id, 2, v_now),
  (v_maria_id, 1, v_now),
  (v_maria_id, 2, v_now),
  (v_joao_id,  1, v_now),
  (v_joao_id,  2, v_now);

-- =============================================================
-- 8. Posts (columns: id, course_id, user_id, title, content, pinned, created_at, updated_at, community_id)
-- NOTE: course_id is NOT NULL — posts are associated with a course
-- =============================================================
INSERT INTO posts (id, course_id, community_id, user_id, title, content, pinned, created_at, updated_at) VALUES
  (1, 1, v_community_id, v_admin_id,
   'Bem-vindos à Comunidade iSkool! 🎉',
   'Olá a todos! Este é o espaço oficial da nossa comunidade. Aqui vocês podem compartilhar conhecimento, tirar dúvidas e fazer networking com outros profissionais. Aproveitem os cursos disponíveis e participem ativamente das discussões!',
   true, v_now - INTERVAL '5 days', v_now - INTERVAL '5 days'),

  (2, 1, v_community_id, v_maria_id,
   'Dica: Como organizar seus estudos online',
   'Pessoal, quero compartilhar como tenho organizado meus estudos aqui na plataforma. Uso a técnica Pomodoro (25min estudo + 5min pausa) e anoto tudo no Notion. Assistir as aulas 1.5x também ajuda bastante! Alguém mais tem dicas?',
   false, v_now - INTERVAL '3 days', v_now - INTERVAL '3 days'),

  (3, 1, v_community_id, v_joao_id,
   'Meu primeiro projeto em React ficou pronto!',
   'Acabei de terminar o projeto da landing page do módulo de React e estou muito feliz com o resultado! O curso está sendo incrível. Próximo passo: aprender sobre APIs e integração com backend.',
   false, v_now - INTERVAL '2 days', v_now - INTERVAL '2 days'),

  (4, 2, v_community_id, v_maria_id,
   'Dúvida sobre SEO para e-commerce',
   'Estou no módulo de SEO e gostaria de saber se alguém tem experiência com SEO para lojas virtuais. As estratégias são muito diferentes das usadas para blogs e sites institucionais?',
   false, v_now - INTERVAL '1 day', v_now - INTERVAL '1 day'),

  (5, 2, v_community_id, v_admin_id,
   'Novo curso de Marketing Digital disponível!',
   'É com muito prazer que anunciamos o lançamento do curso de Marketing Digital Avançado! O curso cobre SEO, tráfego pago, copywriting e muito mais. Acessem pela aba de cursos e comecem a estudar hoje mesmo.',
   false, v_now - INTERVAL '12 hours', v_now - INTERVAL '12 hours');

PERFORM setval('posts_id_seq', 5);

-- =============================================================
-- 9. Comments
-- =============================================================
INSERT INTO comments (id, post_id, user_id, content, parent_id, created_at, updated_at) VALUES
  (1, 1, v_maria_id,
   'Que incrível! Muito feliz em fazer parte desta comunidade. Mal posso esperar para começar os cursos!',
   NULL, v_now - INTERVAL '4 days 20 hours', v_now - INTERVAL '4 days 20 hours'),

  (2, 1, v_joao_id,
   'Valeu pelo espaço! Já comecei o curso de Desenvolvimento Web e está sendo muito bom.',
   NULL, v_now - INTERVAL '4 days 18 hours', v_now - INTERVAL '4 days 18 hours'),

  (3, 2, v_joao_id,
   'Ótimas dicas, Maria! Eu uso o método de repetição espaçada com o Anki para memorizar conceitos. Funciona demais!',
   NULL, v_now - INTERVAL '2 days 20 hours', v_now - INTERVAL '2 days 20 hours'),

  (4, 3, v_admin_id,
   'Parabéns, João! Continue assim. Se precisar de ajuda com o próximo módulo, pode perguntar aqui.',
   NULL, v_now - INTERVAL '1 day 20 hours', v_now - INTERVAL '1 day 20 hours'),

  (5, 3, v_maria_id,
   'Muito legal! Também terminei esse projeto. Podemos trocar feedbacks?',
   NULL, v_now - INTERVAL '1 day 18 hours', v_now - INTERVAL '1 day 18 hours'),

  (6, 3, v_joao_id,
   'Claro, Maria! Vou te mandar uma mensagem.',
   5, v_now - INTERVAL '1 day 16 hours', v_now - INTERVAL '1 day 16 hours');

PERFORM setval('comments_id_seq', 6);

-- =============================================================
-- 10. Announcement (columns: id, title, content, image_url, created_by, is_active, created_at, updated_at, community_id, button_text, button_url)
-- =============================================================
INSERT INTO announcements (id, community_id, title, content, button_text, button_url, created_by, is_active, created_at, updated_at) VALUES
  (1, v_community_id,
   'Bem-vindo ao iSkool!',
   'Esta é a sua nova plataforma de aprendizado. Explore os cursos, participe do feed e conecte-se com a comunidade!',
   'Ver Cursos', '/c/iskool/courses',
   v_admin_id, true,
   v_now, v_now);

PERFORM setval('announcements_id_seq', 1);

END $$;

-- =============================================================
-- Verificação
-- =============================================================
SELECT 'users' AS tabela, count(*) FROM public.users
UNION ALL SELECT 'communities', count(*) FROM communities
UNION ALL SELECT 'community_members', count(*) FROM community_members
UNION ALL SELECT 'courses', count(*) FROM courses
UNION ALL SELECT 'course_communities', count(*) FROM course_communities
UNION ALL SELECT 'modules', count(*) FROM modules
UNION ALL SELECT 'lessons', count(*) FROM lessons
UNION ALL SELECT 'enrollments', count(*) FROM enrollments
UNION ALL SELECT 'posts', count(*) FROM posts
UNION ALL SELECT 'comments', count(*) FROM comments
UNION ALL SELECT 'announcements', count(*) FROM announcements;
