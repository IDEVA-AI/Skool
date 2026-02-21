-- ============================================
-- Script de Validação: Comments
-- ============================================
-- Execute este script para verificar a integridade dos dados de comentários

-- 1. Verificar comentários órfãos (sem post ou usuário válido)
SELECT 
    'Comentários órfãos (sem post válido)' as verificacao,
    COUNT(*) as quantidade
FROM comments c
LEFT JOIN posts p ON c.post_id = p.id
WHERE p.id IS NULL;

SELECT 
    'Comentários órfãos (sem usuário válido)' as verificacao,
    COUNT(*) as quantidade
FROM comments c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- 2. Verificar integridade de relacionamentos
SELECT 
    'Comentários com relacionamentos válidos' as verificacao,
    COUNT(*) as quantidade
FROM comments c
JOIN posts p ON c.post_id = p.id
JOIN users u ON c.user_id = u.id;

-- 3. Verificar comentários com respostas (parent_id)
SELECT 
    'Comentários com respostas' as verificacao,
    COUNT(*) as quantidade
FROM comments
WHERE parent_id IS NOT NULL;

-- 4. Verificar comentários raiz (sem parent)
SELECT 
    'Comentários raiz (sem parent)' as verificacao,
    COUNT(*) as quantidade
FROM comments
WHERE parent_id IS NULL;

-- 5. Verificar parent_id válidos
SELECT 
    'Comentários com parent_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM comments c
LEFT JOIN comments parent ON c.parent_id = parent.id
WHERE c.parent_id IS NOT NULL AND parent.id IS NULL;

-- 6. Verificar comentários recentes (últimas 24h)
SELECT 
    'Comentários criados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM comments
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- 7. Verificar comentários atualizados recentemente
SELECT 
    'Comentários atualizados nas últimas 24h' as verificacao,
    COUNT(*) as quantidade
FROM comments
WHERE updated_at >= NOW() - INTERVAL '24 hours'
AND updated_at != created_at;

-- 8. Estatísticas gerais
SELECT 
    'Total de comentários' as metrica,
    COUNT(*) as valor
FROM comments
UNION ALL
SELECT 
    'Total de comentários por post',
    COUNT(DISTINCT post_id)
FROM comments
UNION ALL
SELECT 
    'Total de comentários por usuário',
    COUNT(DISTINCT user_id)
FROM comments
UNION ALL
SELECT 
    'Média de comentários por post',
    ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT post_id), 0), 2)
FROM comments
UNION ALL
SELECT 
    'Total de respostas (comentários com parent)',
    COUNT(*)
FROM comments
WHERE parent_id IS NOT NULL;

-- 9. Verificar árvore de comentários (profundidade)
WITH RECURSIVE comment_tree AS (
    -- Comentários raiz
    SELECT id, parent_id, 1 as depth
    FROM comments
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Comentários filhos
    SELECT c.id, c.parent_id, ct.depth + 1
    FROM comments c
    JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT 
    'Profundidade máxima da árvore de comentários' as metrica,
    MAX(depth) as valor
FROM comment_tree;

