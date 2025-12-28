-- ============================================
-- SETUP RÁPIDO - Execute após criar usuário via Auth
-- ============================================
-- 
-- Este script faz tudo automaticamente:
-- 1. Promove o primeiro usuário para admin (fallback)
-- 2. Cria cursos, módulos e aulas
-- 3. Cria aviso de boas-vindas
--
-- IMPORTANTE: Você precisa ter criado pelo menos um usuário
-- via Supabase Auth antes de executar este script
-- ============================================

-- Promover primeiro usuário para admin (usando função de fallback)
SELECT * FROM promote_first_user_to_admin();

-- Criar dados seed
SELECT create_seed_data();

-- Criar aviso de boas-vindas
INSERT INTO announcements (title, content, created_by, is_active)
SELECT 
  'Bem-vindo à Plataforma S-K-O-O-L! 🎓',
  'Esta é uma plataforma de cursos online. Explore os cursos disponíveis, inscreva-se gratuitamente e comece sua jornada de aprendizado.',
  id,
  true
FROM users 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Mostrar resumo
SELECT 
  'Setup completo!' as status,
  (SELECT COUNT(*) FROM courses) as cursos,
  (SELECT COUNT(*) FROM modules) as modulos,
  (SELECT COUNT(*) FROM lessons) as aulas,
  (SELECT COUNT(*) FROM announcements WHERE is_active = true) as avisos;

