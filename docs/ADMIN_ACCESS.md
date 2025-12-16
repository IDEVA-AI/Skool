# 🔐 Guia de Acesso Administrador

## Visão Geral

Este guia explica como promover usuários a administrador no sistema S-K-O-O-L MVP. O sistema possui funções SQL dedicadas para facilitar a promoção de usuários.

## Funções Disponíveis

### 1. `promote_to_admin(email)`
Promove um usuário específico a admin usando o email.

**Uso:**
```sql
SELECT * FROM promote_to_admin('usuario@exemplo.com');
```

**Retorno:**
- `success`: true/false
- `message`: Mensagem descritiva
- `user_id`: UUID do usuário
- `previous_role`: Role anterior
- `new_role`: Nova role (sempre 'admin')

**Exemplo:**
```sql
SELECT * FROM promote_to_admin('admin@exemplo.com');
-- Retorna: success=true, message="Usuário admin@exemplo.com promovido a admin com sucesso"
```

### 2. `promote_to_admin_by_id(uuid)`
Promove um usuário específico a admin usando o UUID.

**Uso:**
```sql
SELECT * FROM promote_to_admin_by_id('8450c95c-9005-4e7c-874e-a555d8e804d7');
```

### 3. `promote_first_user_to_admin()`
**Função de Fallback**: Promove automaticamente o primeiro usuário criado a admin. Útil quando não há admin no sistema.

**Uso:**
```sql
SELECT * FROM promote_first_user_to_admin();
```

**Quando usar:**
- Primeira configuração do sistema
- Quando não há nenhum admin disponível
- Setup inicial rápido

### 4. `list_admins()`
Lista todos os usuários com role 'admin'.

**Uso:**
```sql
SELECT * FROM list_admins();
```

**Retorno:**
- `id`: UUID do usuário
- `email`: Email do usuário
- `name`: Nome do usuário
- `role`: Role (sempre 'admin')
- `created_at`: Data de criação

## Métodos de Promoção

### Método 1: Via Função SQL (Recomendado)

**Por Email:**
```sql
SELECT * FROM promote_to_admin('seu-email@exemplo.com');
```

**Por UUID:**
```sql
SELECT * FROM promote_to_admin_by_id('UUID_DO_USUARIO');
```

**Fallback Automático:**
```sql
SELECT * FROM promote_first_user_to_admin();
```

### Método 2: Via UPDATE Direto

```sql
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'seu-email@exemplo.com'
RETURNING id, email, role;
```

### Método 3: Via Dashboard Supabase

1. Acesse **Table Editor** → **users**
2. Encontre o usuário pelo email
3. Edite a coluna `role` para `admin`
4. Salve

## Verificações

### Verificar Role de um Usuário
```sql
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'seu-email@exemplo.com';
```

### Listar Todos os Admins
```sql
SELECT * FROM list_admins();
```

### Contar Usuários por Role
```sql
SELECT role, COUNT(*) as total
FROM users
GROUP BY role
ORDER BY role;
```

### Ver Todos os Usuários
```sql
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at ASC;
```

## Permissões de Admin

Usuários com `role = 'admin'` têm acesso a:

- ✅ Criar, editar e deletar anúncios
- ✅ Criar e gerenciar cursos (como instructor)
- ✅ Acessar dashboard de instrutor (`/instructor`)
- ✅ Ver estatísticas de todos os cursos
- ✅ Todas as funcionalidades de aluno

## Segurança

- As funções de promoção usam `SECURITY DEFINER` para garantir execução segura
- Apenas usuários autenticados podem executar (via RLS)
- Recomenda-se promover apenas usuários confiáveis
- Em produção, considere adicionar autenticação adicional para promoções

## Troubleshooting

### "Usuário não encontrado"
- Verifique se o email está correto: `SELECT * FROM users WHERE email = '...';`
- Certifique-se de que o usuário foi criado via Supabase Auth

### "Já é admin"
- A função retornará uma mensagem informando que o usuário já é admin
- Não há problema executar novamente

### "Permission denied"
- Verifique se está autenticado no Supabase
- Certifique-se de ter permissões para executar funções SQL

## Scripts Prontos

Todos os scripts estão disponíveis em:
- `supabase/promote-admin.sql` - Script completo com todas as opções
- `supabase/quick-setup.sql` - Setup rápido incluindo promoção

## Exemplo Completo

```sql
-- 1. Verificar usuários existentes
SELECT id, email, role FROM users ORDER BY created_at ASC;

-- 2. Promover primeiro usuário a admin (fallback)
SELECT * FROM promote_first_user_to_admin();

-- 3. Verificar se funcionou
SELECT * FROM list_admins();

-- 4. Criar dados seed (requer admin)
SELECT create_seed_data();

-- 5. Verificar cursos criados
SELECT id, title FROM courses;
```

