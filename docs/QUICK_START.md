# 🚀 Quick Start - S-K-O-O-L MVP

## Setup em 3 Passos

### Passo 1: Criar Usuário Admin (2 minutos)

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Criar Usuário**
   - Menu lateral: **Authentication** → **Users**
   - Clique em **Add User** → **Create new user**
   - Preencha:
     ```
     Email: admin@exemplo.com (ou seu email)
     Password: [escolha uma senha]
     ✅ Auto Confirm User (marcar)
     ```
   - Clique em **Create User**
   - ✅ Anote o email usado

### Passo 2: Promover Usuário a Admin (1 minuto)

Você tem **3 opções** para promover um usuário a admin:

#### Opção A: Promover por Email (Recomendado)
```sql
-- Substitua 'seu-email@exemplo.com' pelo email do usuário criado
SELECT * FROM promote_to_admin('seu-email@exemplo.com');
```

#### Opção B: Promover Primeiro Usuário (Fallback Automático)
```sql
-- Promove automaticamente o primeiro usuário criado
SELECT * FROM promote_first_user_to_admin();
```

#### Opção C: Comando Direto UPDATE
```sql
-- Substitua 'seu-email@exemplo.com' pelo email
UPDATE users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'seu-email@exemplo.com'
RETURNING id, email, role;
```

**Verificar se funcionou:**
```sql
-- Listar todos os admins
SELECT * FROM list_admins();
```

### Passo 3: Executar Setup SQL (1 minuto)

1. **Abrir SQL Editor**
   - No dashboard: **SQL Editor** → **New Query**

2. **Copiar e Colar** o conteúdo de `supabase/quick-setup.sql`:
   ```sql
   -- Criar dados seed (cursos, módulos, aulas)
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
   ```

3. **Executar** (botão Run ou Ctrl+Enter)

4. **Verificar Resultado**
   - Deve mostrar: `cursos: 4, modulos: 6, aulas: 12, avisos: 1`

### Passo 4: Testar a Aplicação (5 minutos)

1. **Iniciar a aplicação** (se ainda não estiver rodando):
   ```bash
   npm run dev:client
   ```

2. **Acessar**: http://localhost:5000

3. **Fazer Login**:
   - Vá para `/login`
   - Use o email e senha criados no Passo 1

4. **Testar Funcionalidades**:
   - ✅ Ver cursos em `/courses`
   - ✅ Inscrever-se em um curso (botão "Inscrever-se Gratuitamente")
   - ✅ Ver módulos/aulas em `/courses/:id`
   - ✅ Marcar aula como concluída
   - ✅ Criar post no feed (`/`)
   - ✅ Comentar em posts
   - ✅ Criar aviso (se for admin)
   - ✅ Ver dashboard em `/instructor` (se for instructor/admin)

## ✅ Checklist de Verificação

Execute no SQL Editor para verificar:

```sql
-- Verificar usuários
SELECT email, role FROM users;

-- Verificar cursos
SELECT id, title, instructor_id FROM courses;

-- Verificar módulos e aulas
SELECT 
  c.title as curso,
  COUNT(DISTINCT m.id) as modulos,
  COUNT(DISTINCT l.id) as aulas
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
GROUP BY c.id, c.title;
```

## 🐛 Troubleshooting

### "Nenhum curso aparece"
- ✅ Verifique se executou `SELECT create_seed_data();`
- ✅ Verifique se há um usuário com `role = 'admin'` ou `role = 'instructor'`
- ✅ Verifique o console do navegador para erros

### "Não consigo criar avisos"
- ✅ Verifique se seu usuário tem `role = 'admin'` na tabela `users`
- ✅ Execute: `SELECT email, role FROM users WHERE email = 'seu-email@exemplo.com';`
- ✅ Se não for admin, promova usando: `SELECT * FROM promote_to_admin('seu-email@exemplo.com');`

### "Erro de permissão"
- ✅ Certifique-se de estar logado
- ✅ Verifique as políticas RLS no Supabase (devem estar ativas)

## 📚 Próximos Passos

Após o setup básico:
1. **Configure o Storage** (opcional, para uploads):
   - Acesse Supabase Dashboard → Storage → New Bucket
   - Nome: `course-media`, Público: ✅
   - Execute as políticas RLS (veja `docs/ADMIN_PANEL.md`)

2. **Use o Painel Admin**:
   - Acesse `/admin` após fazer login como admin
   - Crie cursos, módulos e aulas
   - Faça upload de arquivos ou use URLs externas
   - Veja guia completo em `docs/ADMIN_PANEL.md`

3. **Adicione conteúdo real**:
   - Crie cursos com seus próprios módulos e aulas
   - Use vídeos do YouTube/Vimeo ou faça upload direto
   - Organize o conteúdo com ordem numérica

4. **Teste como aluno**:
   - Crie uma conta de aluno (ou use outra conta)
   - Inscreva-se nos cursos
   - Teste a visualização e progresso

5. **Personalize**:
   - Crie mais usuários (alunos) via registro
   - Use o fórum para interagir com a comunidade
   - Crie avisos para comunicar com os alunos

## 📝 Notas

- Todos os cursos são **gratuitos** no MVP
- O sistema de pagamentos será implementado na próxima etapa
- Você pode criar quantos cursos quiser via SQL ou interface (quando implementada)

