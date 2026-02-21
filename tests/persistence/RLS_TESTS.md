# Testes de Políticas RLS (Row Level Security)

Este documento especifica testes detalhados para validar as políticas RLS (Row Level Security) do Supabase em todas as tabelas do sistema.

## Como Executar Testes RLS

### Método 1: Via Supabase Dashboard
1. Acesse o SQL Editor no Supabase Dashboard
2. Execute as queries como diferentes usuários usando `SET ROLE` ou `SET LOCAL role`
3. Verifique os resultados

### Método 2: Via Aplicação
1. Faça login como diferentes usuários
2. Execute operações via interface
3. Verifique permissões e erros retornados

### Método 3: Via API/Supabase Client
1. Use diferentes tokens de autenticação
2. Execute operações via código
3. Verifique respostas e erros

---

## 1. Posts RLS

### Policy: "Users can create posts"

**Teste:**
```sql
-- Como usuário autenticado, criar post
INSERT INTO posts (course_id, user_id, title, content)
VALUES (:course_id, auth.uid(), 'Teste RLS', 'Conteúdo de teste');

-- Deve funcionar se user_id = auth.uid()
```

**Validação:**
- ✅ Post é criado com sucesso quando `user_id = auth.uid()`
- ❌ Post não é criado quando `user_id != auth.uid()`

### Policy: "Users can update own posts"

**Teste:**
```sql
-- Como usuário A, tentar atualizar próprio post
UPDATE posts 
SET title = 'Título atualizado'
WHERE id = :post_id_do_usuario_a AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar atualizar post do usuário B
UPDATE posts 
SET title = 'Tentativa de edição'
WHERE id = :post_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode atualizar próprio post
- ❌ Usuário não pode atualizar post de outro usuário

### Policy: "Admins can update any post"

**Teste:**
```sql
-- Como admin, atualizar post de qualquer usuário
UPDATE posts 
SET title = 'Editado por admin'
WHERE id = :post_id_qualquer;

-- Deve funcionar se usuário tem role 'admin'
```

**Validação:**
- ✅ Admin pode atualizar qualquer post
- ✅ Verificar role 'admin' na tabela users

### Policy: "Users can delete own posts"

**Teste:**
```sql
-- Como usuário A, deletar próprio post
DELETE FROM posts 
WHERE id = :post_id_do_usuario_a AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar deletar post do usuário B
DELETE FROM posts 
WHERE id = :post_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode deletar próprio post
- ❌ Usuário não pode deletar post de outro usuário

### Policy: "Admins can delete any post"

**Teste:**
```sql
-- Como admin, deletar post de qualquer usuário
DELETE FROM posts 
WHERE id = :post_id_qualquer;

-- Deve funcionar se usuário tem role 'admin'
```

**Validação:**
- ✅ Admin pode deletar qualquer post

---

## 2. Comments RLS

### Policy: "Users can create comments"

**Teste:**
```sql
-- Como usuário autenticado, criar comentário
INSERT INTO comments (post_id, user_id, content)
VALUES (:post_id, auth.uid(), 'Comentário de teste');

-- Deve funcionar se user_id = auth.uid()
```

**Validação:**
- ✅ Comentário é criado quando `user_id = auth.uid()`
- ❌ Comentário não é criado quando `user_id != auth.uid()`

### Policy: "Users can update own comments"

**Teste:**
```sql
-- Como usuário A, atualizar próprio comentário
UPDATE comments 
SET content = 'Comentário editado'
WHERE id = :comment_id_do_usuario_a AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar atualizar comentário do usuário B
UPDATE comments 
SET content = 'Tentativa de edição'
WHERE id = :comment_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode atualizar próprio comentário
- ❌ Usuário não pode atualizar comentário de outro usuário

### Policy: "Admins can update any comment"

**Teste:**
```sql
-- Como admin, atualizar comentário de qualquer usuário
UPDATE comments 
SET content = 'Editado por admin'
WHERE id = :comment_id_qualquer;

-- Deve funcionar se usuário tem role 'admin'
```

**Validação:**
- ✅ Admin pode atualizar qualquer comentário

### Policy: "Users can delete own comments"

**Teste:**
```sql
-- Como usuário A, deletar próprio comentário
DELETE FROM comments 
WHERE id = :comment_id_do_usuario_a AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar deletar comentário do usuário B
DELETE FROM comments 
WHERE id = :comment_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode deletar próprio comentário
- ❌ Usuário não pode deletar comentário de outro usuário

### Policy: "Admins can delete any comment"

**Teste:**
```sql
-- Como admin, deletar comentário de qualquer usuário
DELETE FROM comments 
WHERE id = :comment_id_qualquer;

-- Deve funcionar se usuário tem role 'admin'
```

**Validação:**
- ✅ Admin pode deletar qualquer comentário

---

## 3. Courses RLS

### Policy: "Courses are viewable by everyone"

**Teste:**
```sql
-- Como qualquer usuário autenticado, buscar cursos
SELECT * FROM courses;

-- Deve retornar todos os cursos
```

**Validação:**
- ✅ Todos os usuários autenticados podem ver cursos

### Policy: "Admins can manage courses"

**Teste:**
```sql
-- Como admin, criar curso
INSERT INTO courses (title, description, created_by)
VALUES ('Curso Teste', 'Descrição', auth.uid());

-- Deve funcionar se usuário tem role 'admin'

-- Como usuário regular, tentar criar curso
INSERT INTO courses (title, description, created_by)
VALUES ('Tentativa', 'Descrição', auth.uid());

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Admin pode criar cursos
- ❌ Usuário regular não pode criar cursos

**Teste UPDATE:**
```sql
-- Como admin, atualizar curso
UPDATE courses 
SET title = 'Título atualizado'
WHERE id = :course_id;

-- Deve funcionar se usuário tem role 'admin'

-- Como usuário regular, tentar atualizar curso
UPDATE courses 
SET title = 'Tentativa'
WHERE id = :course_id;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Admin pode atualizar cursos
- ❌ Usuário regular não pode atualizar cursos

**Teste DELETE:**
```sql
-- Como admin, deletar curso
DELETE FROM courses 
WHERE id = :course_id;

-- Deve funcionar se usuário tem role 'admin'

-- Como usuário regular, tentar deletar curso
DELETE FROM courses 
WHERE id = :course_id;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Admin pode deletar cursos
- ❌ Usuário regular não pode deletar cursos

---

## 4. Enrollments RLS

### Policy: "Users can enroll themselves"

**Teste:**
```sql
-- Como usuário A, inscrever-se em curso
INSERT INTO enrollments (user_id, course_id)
VALUES (auth.uid(), :course_id);

-- Deve funcionar

-- Como usuário A, tentar inscrever usuário B
INSERT INTO enrollments (user_id, course_id)
VALUES (:user_id_b, :course_id);

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode se inscrever apenas para si mesmo
- ❌ Usuário não pode inscrever outro usuário

### Policy: "Users can view their own enrollments"

**Teste:**
```sql
-- Como usuário A, buscar próprias inscrições
SELECT * FROM enrollments WHERE user_id = auth.uid();

-- Deve retornar apenas inscrições do usuário A

-- Como usuário A, tentar buscar inscrições do usuário B
SELECT * FROM enrollments WHERE user_id = :user_id_b;

-- Deve retornar vazio ou erro de permissão
```

**Validação:**
- ✅ Usuário vê apenas próprias inscrições

---

## 5. Saved Posts RLS

### Policy: "Users can view their own saved posts"

**Teste:**
```sql
-- Como usuário A, buscar próprios posts salvos
SELECT * FROM saved_posts WHERE user_id = auth.uid();

-- Deve retornar apenas posts salvos do usuário A

-- Como usuário A, tentar buscar posts salvos do usuário B
SELECT * FROM saved_posts WHERE user_id = :user_id_b;

-- Deve retornar vazio ou erro de permissão
```

**Validação:**
- ✅ Usuário vê apenas próprios posts salvos

### Policy: "Users can save posts"

**Teste:**
```sql
-- Como usuário A, salvar post
INSERT INTO saved_posts (user_id, post_id)
VALUES (auth.uid(), :post_id);

-- Deve funcionar

-- Como usuário A, tentar salvar post para usuário B
INSERT INTO saved_posts (user_id, post_id)
VALUES (:user_id_b, :post_id);

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode salvar apenas para si mesmo
- ❌ Usuário não pode salvar para outro usuário

### Policy: "Users can delete their own saved posts"

**Teste:**
```sql
-- Como usuário A, deletar próprio post salvo
DELETE FROM saved_posts 
WHERE id = :saved_post_id AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar deletar post salvo do usuário B
DELETE FROM saved_posts 
WHERE id = :saved_post_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode deletar apenas próprios posts salvos
- ❌ Usuário não pode deletar posts salvos de outro usuário

---

## 6. Notifications RLS

### Policy: "Users can view their own notifications"

**Teste:**
```sql
-- Como usuário A, buscar próprias notificações
SELECT * FROM notifications WHERE user_id = auth.uid();

-- Deve retornar apenas notificações do usuário A

-- Como usuário A, tentar buscar notificações do usuário B
SELECT * FROM notifications WHERE user_id = :user_id_b;

-- Deve retornar vazio ou erro de permissão
```

**Validação:**
- ✅ Usuário vê apenas próprias notificações

### Policy: "Users can update their own notifications"

**Teste:**
```sql
-- Como usuário A, marcar própria notificação como lida
UPDATE notifications 
SET is_read = true
WHERE id = :notification_id AND user_id = auth.uid();

-- Deve funcionar

-- Como usuário A, tentar atualizar notificação do usuário B
UPDATE notifications 
SET is_read = true
WHERE id = :notification_id_do_usuario_b;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Usuário pode atualizar apenas próprias notificações
- ❌ Usuário não pode atualizar notificações de outro usuário

---

## 7. Communities RLS

### Policy: "Communities are viewable by members"

**Teste:**
```sql
-- Como membro da comunidade, buscar comunidade
SELECT * FROM communities c
JOIN community_members cm ON c.id = cm.community_id
WHERE cm.user_id = auth.uid();

-- Deve retornar comunidades onde usuário é membro

-- Como não-membro, tentar buscar comunidade privada
SELECT * FROM communities 
WHERE id = :private_community_id;

-- Deve retornar vazio ou erro de permissão (dependendo da policy)
```

**Validação:**
- ✅ Membros podem ver comunidades
- ❌ Não-membros não podem ver comunidades privadas (se aplicável)

### Policy: "Owners can manage their communities"

**Teste:**
```sql
-- Como owner da comunidade, atualizar comunidade
UPDATE communities 
SET name = 'Nome atualizado'
WHERE id = :community_id AND owner_id = auth.uid();

-- Deve funcionar

-- Como não-owner, tentar atualizar comunidade
UPDATE communities 
SET name = 'Tentativa'
WHERE id = :community_id;

-- Deve falhar com erro de permissão
```

**Validação:**
- ✅ Owner pode gerenciar própria comunidade
- ❌ Não-owner não pode gerenciar comunidade

---

## 8. Community Members RLS

### Policy: "Users can view community members"

**Teste:**
```sql
-- Como membro da comunidade, buscar membros
SELECT * FROM community_members 
WHERE community_id = :community_id;

-- Deve retornar membros da comunidade (se policy permitir)
```

**Validação:**
- ✅ Membros podem ver outros membros (se policy permitir)

### Policy: "Users can join communities"

**Teste:**
```sql
-- Como usuário autenticado, juntar-se à comunidade
INSERT INTO community_members (community_id, user_id, role)
VALUES (:community_id, auth.uid(), 'member');

-- Deve funcionar (se policy permitir)
```

**Validação:**
- ✅ Usuário pode se juntar à comunidade (se policy permitir)

---

## 9. Posts Filtered by Community

### Policy: "Posts filtered by community"

**Teste:**
```sql
-- Como membro da comunidade, buscar posts
SELECT * FROM posts 
WHERE community_id = :community_id;

-- Deve retornar posts da comunidade onde usuário é membro

-- Como não-membro, tentar buscar posts da comunidade
SELECT * FROM posts 
WHERE community_id = :private_community_id;

-- Deve retornar vazio ou erro de permissão
```

**Validação:**
- ✅ Membros podem ver posts da comunidade
- ❌ Não-membros não podem ver posts de comunidades privadas

---

## Checklist de Validação RLS

### Para cada tabela com RLS:

- [ ] Policy de SELECT testada
- [ ] Policy de INSERT testada
- [ ] Policy de UPDATE testada
- [ ] Policy de DELETE testada
- [ ] Testes com usuário regular
- [ ] Testes com admin
- [ ] Testes com owner (quando aplicável)
- [ ] Testes de acesso negado funcionando
- [ ] Logs de erro RLS verificados

---

## Erros Comuns de RLS

### Erro: "new row violates row-level security policy"
- **Causa:** Tentativa de inserir/atualizar com dados que violam a policy
- **Solução:** Verificar `WITH CHECK` clause da policy

### Erro: "permission denied for table"
- **Causa:** Policy não permite a operação
- **Solução:** Verificar `USING` clause da policy

### Erro: "no policy found"
- **Causa:** RLS está habilitado mas não há policy para a operação
- **Solução:** Criar policy apropriada

---

## Observações

- Todas as policies devem ser testadas em ambiente de desenvolvimento/teste
- Documentar qualquer comportamento inesperado
- Verificar logs do Supabase para erros de RLS
- Testar com diferentes roles de usuário (admin, student, owner, member)

