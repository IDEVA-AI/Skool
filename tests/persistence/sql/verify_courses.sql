-- ============================================
-- Script de Validação: Courses
-- ============================================
-- Execute este script para verificar a integridade dos dados de cursos

-- 1. Verificar cursos órfãos (sem comunidade válida quando community_id não é null)
SELECT 
    'Cursos com community_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM courses c
LEFT JOIN communities co ON c.community_id = co.id
WHERE c.community_id IS NOT NULL AND co.id IS NULL;

-- 2. Verificar cursos com created_by inválido
SELECT 
    'Cursos com created_by inválido' as verificacao,
    COUNT(*) as quantidade
FROM courses c
LEFT JOIN users u ON c.created_by = u.id
WHERE c.created_by IS NOT NULL AND u.id IS NULL;

-- 3. Verificar integridade de relacionamentos
SELECT 
    'Cursos com relacionamentos válidos' as verificacao,
    COUNT(*) as quantidade
FROM courses c
LEFT JOIN communities co ON c.community_id = co.id
WHERE c.community_id IS NULL OR co.id IS NOT NULL;

-- 4. Verificar cursos bloqueados vs desbloqueados
SELECT 
    'Cursos bloqueados' as verificacao,
    COUNT(*) as quantidade
FROM courses
WHERE is_locked = true
UNION ALL
SELECT 
    'Cursos desbloqueados',
    COUNT(*)
FROM courses
WHERE is_locked = false;

-- 5. Verificar cursos com imagem de capa
SELECT 
    'Cursos com cover_image_url' as verificacao,
    COUNT(*) as quantidade
FROM courses
WHERE cover_image_url IS NOT NULL
UNION ALL
SELECT 
    'Cursos com cover_image_data',
    COUNT(*)
FROM courses
WHERE cover_image_data IS NOT NULL;

-- 6. Verificar ordem dos cursos
SELECT 
    'Cursos sem ordem definida' as verificacao,
    COUNT(*) as quantidade
FROM courses
WHERE "order" IS NULL;

-- 7. Verificar cursos recentes (últimas 24h)
SELECT 
    'Cursos criados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM courses
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 8. Verificar cursos atualizados recentemente
SELECT 
    'Cursos atualizados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM courses
WHERE updated_at >= NOW() - INTERVAL '24 hours'
AND updated_at != created_at;

-- 9. Verificar cascade delete de módulos
-- (Execute após deletar um curso)
-- SELECT 
--     'Módulos órfãos (curso deletado)' as verificacao,
--     COUNT(*) as quantidade
-- FROM modules m
-- LEFT JOIN courses c ON m.course_id = c.id
-- WHERE c.id IS NULL;

-- 10. Verificar cascade delete de enrollments
-- (Execute após deletar um curso)
-- SELECT 
--     'Enrollments órfãos (curso deletado)' as verificacao,
--     COUNT(*) as quantidade
-- FROM enrollments e
-- LEFT JOIN courses c ON e.course_id = c.id
-- WHERE c.id IS NULL;

-- 11. Verificar cascade delete de posts
-- (Execute após deletar um curso)
-- SELECT 
--     'Posts órfãos (curso deletado)' as verificacao,
--     COUNT(*) as quantidade
-- FROM posts p
-- LEFT JOIN courses c ON p.course_id = c.id
-- WHERE c.id IS NULL;

-- 12. Estatísticas gerais
SELECT 
    'Total de cursos' as metrica,
    COUNT(*) as valor
FROM courses
UNION ALL
SELECT 
    'Total de cursos por comunidade',
    COUNT(DISTINCT community_id)
FROM courses
WHERE community_id IS NOT NULL
UNION ALL
SELECT 
    'Total de cursos criados por usuário',
    COUNT(DISTINCT created_by)
FROM courses
WHERE created_by IS NOT NULL
UNION ALL
SELECT 
    'Média de cursos por comunidade',
    ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT community_id), 0), 2)
FROM courses
WHERE community_id IS NOT NULL;

-- 13. Verificar cursos com módulos
SELECT 
    'Cursos com módulos' as metrica,
    COUNT(DISTINCT course_id) as valor
FROM modules
UNION ALL
SELECT 
    'Cursos sem módulos',
    (SELECT COUNT(*) FROM courses) - COUNT(DISTINCT course_id)
FROM modules;

-- 14. Verificar cursos com inscrições
SELECT 
    'Cursos com inscrições' as metrica,
    COUNT(DISTINCT course_id) as valor
FROM enrollments
UNION ALL
SELECT 
    'Cursos sem inscrições',
    (SELECT COUNT(*) FROM courses) - COUNT(DISTINCT course_id)
FROM enrollments;

