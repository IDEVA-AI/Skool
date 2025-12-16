-- ============================================
-- SCRIPT DE SETUP INICIAL - S-K-O-O-L MVP
-- ============================================
-- Execute este script no Supabase SQL Editor após criar seu primeiro usuário
-- 
-- INSTRUÇÕES:
-- 1. Crie um usuário via Supabase Auth (Authentication > Users > Add User)
-- 2. Anote o email do usuário criado
-- 3. Execute este script substituindo 'SEU_EMAIL@exemplo.com' pelo email real
-- 4. Ou execute apenas a função create_seed_data() se já atualizou a role
-- ============================================

-- PASSO 1: Atualizar role do primeiro usuário para admin
-- IMPORTANTE: Substitua 'SEU_EMAIL@exemplo.com' pelo email do usuário criado
UPDATE users 
SET role = 'admin' 
WHERE email = 'SEU_EMAIL@exemplo.com'
AND role = 'student';

-- Verificar se a atualização funcionou
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM users WHERE role IN ('admin', 'instructor');
  
  IF admin_count = 0 THEN
    RAISE WARNING '⚠️  Nenhum admin/instructor encontrado!';
    RAISE WARNING 'Certifique-se de ter executado o UPDATE acima com o email correto.';
  ELSE
    RAISE NOTICE '✅ Encontrados % admin(s)/instructor(s)', admin_count;
  END IF;
END $$;

-- PASSO 2: Criar dados seed (cursos, módulos, aulas)
SELECT create_seed_data();

-- PASSO 3: Criar anúncio de boas-vindas
INSERT INTO announcements (title, content, created_by, is_active)
SELECT 
  'Bem-vindo à Plataforma S-K-O-O-L! 🎓',
  'Esta é uma plataforma de cursos online. Explore os cursos disponíveis, inscreva-se gratuitamente e comece sua jornada de aprendizado. Use o fórum para interagir com outros alunos e instrutores.',
  id,
  true
FROM users 
WHERE role = 'admin' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- PASSO 4: Verificar dados criados
DO $$
DECLARE
  course_count INTEGER;
  module_count INTEGER;
  lesson_count INTEGER;
  announcement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses;
  SELECT COUNT(*) INTO module_count FROM modules;
  SELECT COUNT(*) INTO lesson_count FROM lessons;
  SELECT COUNT(*) INTO announcement_count FROM announcements WHERE is_active = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMO DOS DADOS CRIADOS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Cursos: %', course_count;
  RAISE NOTICE 'Módulos: %', module_count;
  RAISE NOTICE 'Aulas: %', lesson_count;
  RAISE NOTICE 'Anúncios ativos: %', announcement_count;
  RAISE NOTICE '========================================';
  
  IF course_count = 0 THEN
    RAISE WARNING '⚠️  Nenhum curso foi criado. Verifique se há um usuário com role admin/instructor.';
  END IF;
END $$;

-- Ver cursos criados
SELECT 
  c.id,
  c.title,
  c.community_id,
  COUNT(DISTINCT m.id) as total_modules,
  COUNT(DISTINCT l.id) as total_lessons
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
GROUP BY c.id, c.title, c.community_id
ORDER BY c.id;

