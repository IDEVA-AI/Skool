-- ============================================
-- Script de Validação: Posts
-- ============================================
-- Execute este script para verificar a integridade dos dados de posts

-- 1. Verificar posts órfãos (sem curso ou usuário válido)
SELECT 
    'Posts órfãos (sem curso válido)' as verificacao,
    COUNT(*) as quantidade
FROM posts p
LEFT JOIN courses c ON p.course_id = c.id
WHERE c.id IS NULL;

SELECT 
    'Posts órfãos (sem usuário válido)' as verificacao,
    COUNT(*) as quantidade
FROM posts p
LEFT JOIN users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- 2. Verificar integridade de relacionamentos
SELECT 
    'Posts com relacionamentos válidos' as verificacao,
    COUNT(*) as quantidade
FROM posts p
JOIN courses c ON p.course_id = c.id
JOIN users u ON p.user_id = u.id;

-- 3. Verificar posts sem comentários (apenas informação)
SELECT 
    'Posts sem comentários' as verificacao,
    COUNT(*) as quantidade
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
WHERE c.id IS NULL;

-- 4. Verificar posts fixados
SELECT 
    'Posts fixados' as verificacao,
    COUNT(*) as quantidade
FROM posts
WHERE pinned = true;

-- 5. Verificar posts recentes (últimas 24h)
SELECT 
    'Posts criados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM posts
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 6. Verificar posts atualizados recentemente
SELECT 
    'Posts atualizados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM posts
WHERE updated_at >= NOW() - INTERVAL '24 hours'
AND updated_at != created_at;

-- 7. Verificar cascade delete de comentários
-- (Execute após deletar um post)
-- SELECT 
--     'Comentários órfãos (post deletado)' as verificacao,
--     COUNT(*) as quantidade
-- FROM comments c
-- LEFT JOIN posts p ON c.post_id = p.id
-- WHERE p.id IS NULL;

-- 8. Verificar saved_posts órfãos
SELECT 
    'Saved posts órfãos (post deletado)' as verificacao,
    COUNT(*) as quantidade
FROM saved_posts sp
LEFT JOIN posts p ON sp.post_id = p.id
WHERE p.id IS NULL;

-- 9. Estatísticas gerais
SELECT 
    'Total de posts' as metrica,
    COUNT(*) as valor
FROM posts
UNION ALL
SELECT 
    'Total de posts por curso',
    COUNT(DISTINCT course_id)
FROM posts
UNION ALL
SELECT 
    'Total de posts por usuário',
    COUNT(DISTINCT user_id)
FROM posts
UNION ALL
SELECT 
    'Média de posts por curso',
    ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT course_id), 0), 2)
FROM posts;

