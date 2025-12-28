# Guia de Setup - S-K-O-O-L MVP

## Passo 1: Criar Usuário Admin/Instructor

Para começar a usar a plataforma, você precisa criar pelo menos um usuário com role de `instructor` ou `admin`.

### Opção A: Via Interface do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **Authentication** > **Users**
3. Clique em **Add User** > **Create new user**
4. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: uma senha segura
   - **Auto Confirm User**: ✅ (marcado)
5. Clique em **Create User**
6. Copie o **User UID** que aparece na lista

### Opção B: Via Registro na Aplicação

1. Acesse a aplicação e vá para `/register`
2. Crie uma conta com seu email e senha
3. Anote o email usado

### Atualizar Role do Usuário

Após criar o usuário, você precisa atualizar a role na tabela `users`:

```sql
-- Substitua 'SEU_EMAIL@exemplo.com' pelo email do usuário criado
UPDATE users 
SET role = 'admin' 
WHERE email = 'SEU_EMAIL@exemplo.com';

-- Ou se você tem o UUID do usuário:
UPDATE users 
SET role = 'admin' 
WHERE id = 'UUID_DO_USUARIO';
```

**Via Supabase SQL Editor:**
1. Vá para **SQL Editor** no dashboard
2. Execute o comando acima
3. Substitua o email/UUID pelo seu

## Passo 2: Criar Dados Seed (Cursos de Exemplo)

Após criar o usuário admin/instructor, execute a função seed:

```sql
SELECT create_seed_data();
```

Isso criará:
- 4 cursos de exemplo (PROMPT$, CLAREZA BRUTAL, DOUG.EXE 7.0, Q&A ZONA)
- Módulos e aulas para cada curso

## Passo 3: Verificar Dados Criados

Execute para verificar:

```sql
-- Ver cursos criados
SELECT id, title, instructor_id FROM courses;

-- Ver módulos
SELECT m.id, m.title, c.title as curso 
FROM modules m 
JOIN courses c ON c.id = m.course_id;

-- Ver aulas
SELECT l.id, l.title, m.title as modulo, c.title as curso
FROM lessons l
JOIN modules m ON m.id = l.module_id
JOIN courses c ON c.id = m.course_id;
```

## Passo 4: Criar Avisos (Opcional)

Se você é admin, pode criar avisos via interface da aplicação ou SQL:

```sql
-- Criar aviso de exemplo
INSERT INTO announcements (title, content, created_by, is_active)
SELECT 
  'Bem-vindo à Plataforma!',
  'Esta é uma plataforma de cursos online. Explore os cursos disponíveis e comece sua jornada de aprendizado.',
  id,
  true
FROM users 
WHERE role = 'admin' 
LIMIT 1;
```

## Passo 5: Testar a Aplicação

1. **Login**: Acesse `/login` e faça login com o usuário criado
2. **Cursos**: Vá para `/courses` e veja os cursos disponíveis
3. **Inscrição**: Clique em "Inscrever-se Gratuitamente" em um curso
4. **Visualização**: Acesse o curso e veja os módulos/aulas
5. **Progresso**: Marque aulas como concluídas
6. **Fórum**: Crie posts e comentários nos cursos
7. **Avisos**: Se for admin, crie avisos na página inicial
8. **Dashboard**: Se for instructor, acesse `/instructor` para ver estatísticas

## Troubleshooting

### Erro: "Nenhum instructor encontrado"
- Certifique-se de ter criado um usuário e atualizado a role para `admin` ou `instructor`

### Erro: "Permission denied"
- Verifique as políticas RLS no Supabase
- Certifique-se de estar autenticado

### Cursos não aparecem
- Verifique se os cursos foram criados: `SELECT * FROM courses;`
- Verifique se o usuário está autenticado
- Verifique se há algum erro no console do navegador

## Próximos Passos

Após o setup básico:
- Adicione mais cursos via interface ou SQL
- Crie mais usuários (alunos)
- Personalize os cursos com conteúdo real
- Configure upload de vídeos/PDFs para as aulas

