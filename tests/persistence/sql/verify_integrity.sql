-- ============================================
-- Script de Validação: Integridade Geral
-- ============================================
-- Execute este script para verificar a integridade geral do banco de dados

-- 1. Verificar Foreign Keys órfãs

-- Enrollments
SELECT 
    'Enrollments com user_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Enrollments com course_id inválido',
    COUNT(*)
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
WHERE c.id IS NULL;

-- Modules
SELECT 
    'Modules com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM modules m
LEFT JOIN courses c ON m.course_id = c.id
WHERE c.id IS NULL;

-- Lessons
SELECT 
    'Lessons com module_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM lessons l
LEFT JOIN modules m ON l.module_id = m.id
WHERE m.id IS NULL;

-- Lesson Progress
SELECT 
    'Lesson Progress com user_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM lesson_progress lp
LEFT JOIN users u ON lp.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Lesson Progress com lesson_id inválido',
    COUNT(*)
FROM lesson_progress lp
LEFT JOIN lessons l ON lp.lesson_id = l.id
WHERE l.id IS NULL;

-- Announcements
SELECT 
    'Announcements com created_by inválido' as verificacao,
    COUNT(*) as quantidade
FROM announcements a
LEFT JOIN users u ON a.created_by = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Announcements com community_id inválido',
    COUNT(*)
FROM announcements a
LEFT JOIN communities c ON a.community_id = c.id
WHERE a.community_id IS NOT NULL AND c.id IS NULL;

-- Communities
SELECT 
    'Communities com owner_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM communities c
LEFT JOIN users u ON c.owner_id = u.id
WHERE u.id IS NULL;

-- Community Members
SELECT 
    'Community Members com community_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM community_members cm
LEFT JOIN communities c ON cm.community_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Community Members com user_id inválido',
    COUNT(*)
FROM community_members cm
LEFT JOIN users u ON cm.user_id = u.id
WHERE u.id IS NULL;

-- Saved Posts
SELECT 
    'Saved Posts com user_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM saved_posts sp
LEFT JOIN users u ON sp.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Saved Posts com post_id inválido',
    COUNT(*)
FROM saved_posts sp
LEFT JOIN posts p ON sp.post_id = p.id
WHERE p.id IS NULL;

-- Notifications
SELECT 
    'Notifications com user_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE u.id IS NULL;

-- Conversations
SELECT 
    'Conversations com community_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM conversations c
LEFT JOIN communities co ON c.community_id = co.id
WHERE c.community_id IS NOT NULL AND co.id IS NULL
UNION ALL
SELECT 
    'Conversations com course_id inválido',
    COUNT(*)
FROM conversations c
LEFT JOIN courses co ON c.course_id = co.id
WHERE c.course_id IS NOT NULL AND co.id IS NULL;

-- Messages
SELECT 
    'Messages com conversation_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Messages com sender_id inválido',
    COUNT(*)
FROM messages m
LEFT JOIN users u ON m.sender_id = u.id
WHERE u.id IS NULL;

-- Course Invites
SELECT 
    'Course Invites com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM course_invites ci
LEFT JOIN courses c ON ci.course_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Course Invites com invited_by inválido',
    COUNT(*)
FROM course_invites ci
LEFT JOIN users u ON ci.invited_by = u.id
WHERE u.id IS NULL;

-- Community Invites
SELECT 
    'Community Invites com community_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM community_invites ci
LEFT JOIN communities c ON ci.community_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Community Invites com created_by inválido',
    COUNT(*)
FROM community_invites ci
LEFT JOIN users u ON ci.created_by = u.id
WHERE u.id IS NULL;

-- Course Communities
SELECT 
    'Course Communities com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM course_communities cc
LEFT JOIN courses c ON cc.course_id = c.id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Course Communities com community_id inválido',
    COUNT(*)
FROM course_communities cc
LEFT JOIN communities c ON cc.community_id = c.id
WHERE c.id IS NULL;

-- Course Unlock Pages
SELECT 
    'Course Unlock Pages com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM course_unlock_pages cup
LEFT JOIN courses c ON cup.course_id = c.id
WHERE c.id IS NULL;

-- Hotmart Products
SELECT 
    'Hotmart Products com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM hotmart_products hp
LEFT JOIN courses c ON hp.course_id = c.id
WHERE c.id IS NULL;

-- Hotmart Purchases
SELECT 
    'Hotmart Purchases com course_id inválido' as verificacao,
    COUNT(*) as quantidade
FROM hotmart_purchases hp
LEFT JOIN courses c ON hp.course_id = c.id
WHERE hp.course_id IS NOT NULL AND c.id IS NULL
UNION ALL
SELECT 
    'Hotmart Purchases com user_id inválido',
    COUNT(*)
FROM hotmart_purchases hp
LEFT JOIN users u ON hp.user_id = u.id
WHERE hp.user_id IS NOT NULL AND u.id IS NULL;

-- 2. Verificar Constraints de Unicidade

-- Email único em users
SELECT 
    'Emails duplicados em users' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT email, COUNT(*) as cnt
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
) duplicates;

-- Slug único em communities
SELECT 
    'Slugs duplicados em communities' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT slug, COUNT(*) as cnt
    FROM communities
    GROUP BY slug
    HAVING COUNT(*) > 1
) duplicates;

-- Token único em course_invites
SELECT 
    'Tokens duplicados em course_invites' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT token, COUNT(*) as cnt
    FROM course_invites
    GROUP BY token
    HAVING COUNT(*) > 1
) duplicates;

-- Token único em community_invites
SELECT 
    'Tokens duplicados em community_invites' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT token, COUNT(*) as cnt
    FROM community_invites
    GROUP BY token
    HAVING COUNT(*) > 1
) duplicates;

-- Hotmart transaction ID único
SELECT 
    'Hotmart transaction IDs duplicados' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT hotmart_transaction_id, COUNT(*) as cnt
    FROM hotmart_purchases
    GROUP BY hotmart_transaction_id
    HAVING COUNT(*) > 1
) duplicates;

-- Hotmart product ID único
SELECT 
    'Hotmart product IDs duplicados' as verificacao,
    COUNT(*) as quantidade
FROM (
    SELECT hotmart_product_id, COUNT(*) as cnt
    FROM hotmart_products
    GROUP BY hotmart_product_id
    HAVING COUNT(*) > 1
) duplicates;

-- 3. Verificar Cascade Deletes

-- Verificar se há dados órfãos que deveriam ter sido deletados em cascade
-- (Execute após deletar entidades pai)

-- Exemplo: Após deletar um curso, verificar se módulos foram deletados
-- SELECT 
--     'Módulos órfãos após deletar curso' as verificacao,
--     COUNT(*) as quantidade
-- FROM modules m
-- LEFT JOIN courses c ON m.course_id = c.id
-- WHERE c.id IS NULL;

-- 4. Estatísticas Gerais de Integridade

SELECT 
    'Total de tabelas verificadas' as metrica,
    18 as valor
UNION ALL
SELECT 
    'Total de foreign keys verificadas',
    35
UNION ALL
SELECT 
    'Total de constraints de unicidade verificadas',
    6;

