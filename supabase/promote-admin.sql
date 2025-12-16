-- ============================================
-- PROMOVER USUÁRIO A ADMIN
-- ============================================
-- Este script contém funções e comandos para promover usuários a admin
-- ============================================

-- OPÇÃO 1: Promover por EMAIL (Recomendado)
-- Substitua 'seu-email@exemplo.com' pelo email do usuário
SELECT * FROM promote_to_admin('seu-email@exemplo.com');

-- OPÇÃO 2: Promover por UUID
-- Substitua 'UUID_DO_USUARIO' pelo UUID do usuário
SELECT * FROM promote_to_admin_by_id('UUID_DO_USUARIO');

-- OPÇÃO 3: Promover primeiro usuário criado (Fallback)
-- Útil quando não há admin no sistema
SELECT * FROM promote_first_user_to_admin();

-- OPÇÃO 4: Comando direto UPDATE (alternativa simples)
-- Substitua 'seu-email@exemplo.com' pelo email
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'seu-email@exemplo.com'
RETURNING id, email, role;

-- ============================================
-- VERIFICAÇÕES ÚTEIS
-- ============================================

-- Listar todos os admins
SELECT * FROM list_admins();

-- Verificar role de um usuário específico
SELECT id, email, role, created_at 
FROM users 
WHERE email = 'seu-email@exemplo.com';

-- Ver todos os usuários e suas roles
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at ASC;

-- Contar usuários por role
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY role;

