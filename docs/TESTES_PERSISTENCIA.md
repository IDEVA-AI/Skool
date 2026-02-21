# Testes de Persistência - S-K-O-O-L

## Objetivo

Este documento especifica todos os testes de persistência necessários para garantir que as operações CRUD (Create, Read, Update, Delete) funcionem corretamente em todas as entidades do sistema, incluindo validação de políticas RLS, integridade referencial e relacionamentos.

## Como Usar Este Documento

1. **Para Testes Manuais**: Use o [checklist executável](../tests/persistence/checklist.md)
2. **Para Validação SQL**: Execute os scripts em `tests/persistence/sql/`
3. **Para Cenários Detalhados**: Consulte os arquivos em `tests/persistence/scenarios/`

## Estrutura de Testes

Cada entidade terá testes para:
- **CREATE**: Verificar criação e persistência
- **READ**: Verificar busca e filtros
- **UPDATE**: Verificar atualização e persistência
- **DELETE**: Verificar deleção e integridade
- **RLS**: Verificar políticas de segurança
- **Relacionamentos**: Verificar foreign keys e cascade

---

## 1. Posts (Tabela: `posts`)

### Operações CRUD

#### CREATE
- ✅ Criar post em curso existente
- ✅ Criar post com título e conteúdo
- ✅ Verificar `user_id` é preenchido automaticamente
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Verificar relacionamento com `courses` e `users`

**Validação:**
```sql
-- Verificar post criado
SELECT p.*, u.email, c.title 
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN courses c ON p.course_id = c.id
WHERE p.id = :post_id;
```

#### READ
- ✅ Buscar todos os posts dos cursos inscritos
- ✅ Buscar posts por curso específico
- ✅ Posts ordenados por pinned (fixados primeiro) e created_at
- ✅ Posts incluem dados do usuário e curso
- ✅ Contagem de comentários incluída

**Validação:**
```sql
-- Verificar posts visíveis para usuário
SELECT COUNT(*) FROM posts p
JOIN enrollments e ON p.course_id = e.course_id
WHERE e.user_id = :user_id;
```

#### UPDATE
- ✅ Editar título do post próprio
- ✅ Editar conteúdo do post próprio
- ✅ Admin pode editar qualquer post
- ✅ Usuário não pode editar post de outro usuário
- ✅ Verificar `updated_at` é atualizado

**Validação:**
```sql
-- Verificar post editado
SELECT title, content, updated_at 
FROM posts 
WHERE id = :post_id;
```

#### DELETE
- ✅ Usuário pode deletar próprio post
- ✅ Admin pode deletar qualquer post
- ✅ Usuário não pode deletar post de outro usuário
- ✅ Post deletado não aparece após reload
- ✅ Comentários são deletados em cascade

**Validação:**
```sql
-- Verificar post deletado
SELECT COUNT(*) FROM posts WHERE id = :post_id;
-- Deve retornar 0

-- Verificar cascade delete de comentários
SELECT COUNT(*) FROM comments WHERE post_id = :post_id;
-- Deve retornar 0
```

#### Operações Especiais
- ✅ Fixar post (pinned = true)
- ✅ Desfixar post (pinned = false)
- ✅ Post fixado aparece no topo do feed

**Arquivos relacionados:**
- `client/src/services/posts.ts`
- `client/src/hooks/use-posts.ts`
- `supabase/migrations/020_add_posts_rls_policies.sql`

---

## 2. Comments (Tabela: `comments`)

### Operações CRUD

#### CREATE
- ✅ Criar comentário em post existente
- ✅ Criar resposta a comentário (parent_id)
- ✅ Verificar `user_id` é preenchido automaticamente
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `posts` e `users` mantido

**Validação:**
```sql
-- Verificar comentário criado
SELECT c.*, u.email, p.title as post_title
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN posts p ON c.post_id = p.id
WHERE c.id = :comment_id;
```

#### READ
- ✅ Buscar comentários por post
- ✅ Comentários ordenados por created_at
- ✅ Buscar árvore de respostas (parent_id)
- ✅ Comentários incluem dados do usuário

#### UPDATE
- ✅ Editar comentário próprio
- ✅ Admin pode editar qualquer comentário
- ✅ Usuário não pode editar comentário de outro usuário
- ✅ Verificar `updated_at` é atualizado

**Validação:**
```sql
-- Verificar comentário editado
SELECT content, updated_at 
FROM comments 
WHERE id = :comment_id;
```

#### DELETE
- ✅ Usuário pode deletar próprio comentário
- ✅ Admin pode deletar qualquer comentário
- ✅ Usuário não pode deletar comentário de outro usuário
- ✅ Comentário deletado não aparece após reload
- ✅ Respostas são deletadas em cascade (se implementado)

**Arquivos relacionados:**
- `client/src/services/comments.ts`
- `client/src/hooks/use-forum.ts`

---

## 3. Courses (Tabela: `courses`)

### Operações CRUD

#### CREATE
- ✅ Criar curso
- ✅ Criar curso padrão para comunidade
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `communities` mantido

**Validação:**
```sql
-- Verificar curso criado
SELECT c.*, co.name as community_name
FROM courses c
LEFT JOIN communities co ON c.community_id = co.id
WHERE c.id = :course_id;
```

#### READ
- ✅ Buscar todos os cursos
- ✅ Buscar curso por ID
- ✅ Buscar cursos por comunidade
- ✅ Cursos ordenados por `order` e `created_at`
- ✅ Verificar filtro por `is_locked`

#### UPDATE
- ✅ Editar título do curso
- ✅ Editar descrição do curso
- ✅ Atualizar imagem de capa (base64 ou URL)
- ✅ Alterar ordem do curso
- ✅ Alterar status de bloqueio (is_locked)
- ✅ Verificar `updated_at` é atualizado

**Validação:**
```sql
-- Verificar curso editado
SELECT title, description, cover_image_url, cover_image_data, 
       is_locked, "order", updated_at
FROM courses 
WHERE id = :course_id;
```

#### DELETE
- ✅ Deletar curso (apenas admin)
- ✅ Módulos são deletados em cascade
- ✅ Aulas são deletadas em cascade
- ✅ Enrollments são deletados em cascade
- ✅ Posts são deletados em cascade

**Validação:**
```sql
-- Verificar cascade delete
SELECT COUNT(*) FROM modules WHERE course_id = :course_id;
SELECT COUNT(*) FROM enrollments WHERE course_id = :course_id;
SELECT COUNT(*) FROM posts WHERE course_id = :course_id;
-- Todos devem retornar 0 após deletar curso
```

**Arquivos relacionados:**
- `client/src/services/courses.ts`
- `client/src/hooks/use-courses.ts`

---

## 4. Modules (Tabela: `modules`)

### Operações CRUD

#### CREATE
- ✅ Criar módulo em curso existente
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `courses` mantido

#### READ
- ✅ Buscar módulos por curso
- ✅ Módulos ordenados por `order`

#### UPDATE
- ✅ Editar título do módulo
- ✅ Alterar ordem do módulo
- ✅ Verificar `updated_at` é atualizado

#### DELETE
- ✅ Deletar módulo
- ✅ Aulas são deletadas em cascade
- ✅ Progresso de aulas é tratado adequadamente

**Arquivos relacionados:**
- `client/src/hooks/use-admin-modules-lessons.ts`

---

## 5. Lessons (Tabela: `lessons`)

### Operações CRUD

#### CREATE
- ✅ Criar aula em módulo existente
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `modules` mantido

#### READ
- ✅ Buscar aulas por módulo
- ✅ Aulas ordenadas por `order`

#### UPDATE
- ✅ Editar título da aula
- ✅ Editar conteúdo (content_url)
- ✅ Alterar ordem da aula
- ✅ Verificar `updated_at` é atualizado

#### DELETE
- ✅ Deletar aula
- ✅ Progresso da aula é tratado adequadamente

**Arquivos relacionados:**
- `client/src/hooks/use-admin-modules-lessons.ts`
- `client/src/hooks/use-course-content.ts`

---

## 6. Enrollments (Tabela: `enrollments`)

### Operações CRUD

#### CREATE
- ✅ Inscrever em curso gratuito
- ✅ Não permitir inscrição em curso bloqueado
- ✅ Verificar `enrolled_at` é preenchido automaticamente
- ✅ Prevenir duplicação de inscrição

**Validação:**
```sql
-- Verificar inscrição criada
SELECT e.*, u.email, c.title
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = :user_id AND e.course_id = :course_id;
```

#### READ
- ✅ Buscar cursos inscritos do usuário
- ✅ Verificar se usuário está inscrito em curso

#### DELETE
- ✅ Cancelar inscrição (se aplicável)

**Arquivos relacionados:**
- `client/src/services/courses.ts` (enrollInCourse)
- `client/src/hooks/use-courses.ts`

---

## 7. Announcements (Tabela: `announcements`)

### Operações CRUD

#### CREATE
- ✅ Criar aviso
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `users` e `communities` mantido

#### READ
- ✅ Buscar avisos ativos (is_active = true)
- ✅ Buscar avisos por comunidade
- ✅ Avisos ordenados por created_at

#### UPDATE
- ✅ Editar título e conteúdo do aviso
- ✅ Ativar/desativar aviso (is_active)
- ✅ Verificar `updated_at` é atualizado

**Validação:**
```sql
-- Verificar aviso editado
SELECT title, content, is_active, updated_at
FROM announcements
WHERE id = :announcement_id;
```

#### DELETE
- ✅ Deletar aviso

**Arquivos relacionados:**
- `client/src/hooks/use-announcements.ts`

---

## 8. Communities (Tabela: `communities`)

### Operações CRUD

#### CREATE
- ✅ Criar comunidade
- ✅ Verificar slug único
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `users` (owner) mantido

**Validação:**
```sql
-- Verificar comunidade criada
SELECT c.*, u.email as owner_email
FROM communities c
JOIN users u ON c.owner_id = u.id
WHERE c.id = :community_id;
```

#### READ
- ✅ Buscar todas as comunidades
- ✅ Buscar comunidade por slug
- ✅ Buscar comunidades do usuário

#### UPDATE
- ✅ Editar nome da comunidade
- ✅ Editar descrição
- ✅ Atualizar logo (base64 ou URL)
- ✅ Atualizar capa (base64 ou URL)
- ✅ Verificar `updated_at` é atualizado

#### DELETE
- ✅ Deletar comunidade (deve verificar dependências)

**Arquivos relacionados:**
- `client/src/hooks/use-communities.ts`

---

## 9. Community Members (Tabela: `community_members`)

### Operações CRUD

#### CREATE
- ✅ Adicionar membro à comunidade
- ✅ Verificar `joined_at` é preenchido automaticamente
- ✅ Relacionamento com `communities` e `users` mantido

#### READ
- ✅ Buscar membros da comunidade
- ✅ Verificar role do membro

#### UPDATE
- ✅ Alterar role do membro

#### DELETE
- ✅ Remover membro da comunidade

**Arquivos relacionados:**
- `client/src/hooks/use-communities.ts`

---

## 10. Saved Posts (Tabela: `saved_posts`)

### Operações CRUD

#### CREATE
- ✅ Salvar post
- ✅ Prevenir duplicação de salvamento
- ✅ Verificar `created_at` é preenchido automaticamente

#### READ
- ✅ Buscar posts salvos do usuário
- ✅ Posts salvos incluem dados do post completo

#### DELETE
- ✅ Remover post salvo
- ✅ Post removido não aparece na lista após deletar

**Arquivos relacionados:**
- `client/src/hooks/use-saved-posts.ts`

---

## 11. Notifications (Tabela: `notifications`)

### Operações CRUD

#### CREATE
- ✅ Criar notificação (automático)
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `users` mantido

#### READ
- ✅ Buscar notificações do usuário
- ✅ Filtrar por `is_read`
- ✅ Notificações ordenadas por created_at DESC

#### UPDATE
- ✅ Marcar notificação como lida (is_read = true)
- ✅ Estado mantido após reload

**Validação:**
```sql
-- Verificar notificação marcada como lida
SELECT is_read, created_at
FROM notifications
WHERE id = :notification_id;
```

**Arquivos relacionados:**
- `client/src/hooks/use-notifications.ts`

---

## 12. Conversations & Messages

### Conversations (Tabela: `conversations`)

#### CREATE
- ✅ Criar conversa DM
- ✅ Criar conversa de grupo
- ✅ Verificar `created_at` é preenchido automaticamente

#### READ
- ✅ Buscar conversas do usuário
- ✅ Buscar conversas por comunidade

### Messages (Tabela: `messages`)

#### CREATE
- ✅ Criar mensagem em conversa
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Relacionamento com `conversations` e `users` mantido

#### READ
- ✅ Buscar mensagens da conversa
- ✅ Mensagens ordenadas por created_at

#### UPDATE
- ✅ Editar mensagem (edited_at)
- ✅ Soft delete de mensagem (is_deleted = true)

**Validação:**
```sql
-- Verificar mensagem editada
SELECT content, edited_at
FROM messages
WHERE id = :message_id;

-- Verificar soft delete
SELECT is_deleted
FROM messages
WHERE id = :message_id;
```

**Arquivos relacionados:**
- `client/src/hooks/use-chat.ts`

---

## 13. Lesson Progress (Tabela: `lesson_progress`)

### Operações CRUD

#### CREATE
- ✅ Marcar aula como concluída
- ✅ Prevenir duplicação de progresso
- ✅ Verificar `completed_at` é preenchido automaticamente

**Validação:**
```sql
-- Verificar progresso criado
SELECT lp.*, u.email, l.title as lesson_title
FROM lesson_progress lp
JOIN users u ON lp.user_id = u.id
JOIN lessons l ON lp.lesson_id = l.id
WHERE lp.user_id = :user_id AND lp.lesson_id = :lesson_id;
```

#### READ
- ✅ Buscar progresso do usuário
- ✅ Calcular percentual de conclusão do curso

**Arquivos relacionados:**
- `client/src/hooks/use-course-content.ts`

---

## 14. Course Invites (Tabela: `course_invites`)

### Operações CRUD

#### CREATE
- ✅ Criar convite para curso
- ✅ Verificar token único
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Definir expiração (expires_at)

#### READ
- ✅ Buscar convites do curso
- ✅ Validar token de convite

#### UPDATE
- ✅ Aceitar convite (accepted_at)
- ✅ Convite aceito cria enrollment automaticamente

**Validação:**
```sql
-- Verificar convite aceito
SELECT accepted_at, expires_at
FROM course_invites
WHERE token = :token;

-- Verificar enrollment criado
SELECT * FROM enrollments
WHERE user_id = :user_id AND course_id = :course_id;
```

**Arquivos relacionados:**
- `client/src/hooks/use-course-invites.ts`

---

## 15. Community Invites (Tabela: `community_invites`)

### Operações CRUD

#### CREATE
- ✅ Criar convite para comunidade
- ✅ Verificar token único
- ✅ Verificar `created_at` é preenchido automaticamente
- ✅ Definir expiração (expires_at)

#### READ
- ✅ Buscar convites da comunidade
- ✅ Validar token de convite

#### UPDATE
- ✅ Aceitar convite (used_at)
- ✅ Convite aceito cria community_member automaticamente

**Arquivos relacionados:**
- `client/src/hooks/use-communities.ts`

---

## 16. Course Communities (Tabela: `course_communities`)

### Operações CRUD

#### CREATE
- ✅ Associar curso a comunidade
- ✅ Relacionamento N:N mantido corretamente

#### READ
- ✅ Buscar cursos por comunidade

#### DELETE
- ✅ Remover associação curso-comunidade

**Arquivos relacionados:**
- `client/src/services/courses.ts`
- `client/src/hooks/use-course-communities.ts`

---

## 17. Course Unlock Pages (Tabela: `course_unlock_pages`)

### Operações CRUD

#### CREATE
- ✅ Criar página de desbloqueio para curso
- ✅ Relacionamento 1:1 com `courses` mantido

#### READ
- ✅ Buscar página por curso

#### UPDATE
- ✅ Editar conteúdo da página
- ✅ Atualizar imagem hero
- ✅ Atualizar features e bonus

#### DELETE
- ✅ Deletar página de desbloqueio

**Arquivos relacionados:**
- `client/src/hooks/use-unlock-pages.ts`

---

## 18. Hotmart Products & Purchases

### Hotmart Products (Tabela: `hotmart_products`)

#### CREATE
- ✅ Criar produto associado ao curso
- ✅ Verificar `hotmart_product_id` único

#### READ
- ✅ Buscar produtos
- ✅ Buscar produto por curso

#### UPDATE
- ✅ Atualizar informações do produto

### Hotmart Purchases (Tabela: `hotmart_purchases`)

#### CREATE
- ✅ Registrar compra via webhook
- ✅ Verificar `hotmart_transaction_id` único
- ✅ Compra aprovada cria enrollment automaticamente

#### READ
- ✅ Buscar compras do usuário
- ✅ Buscar compras por curso

#### UPDATE
- ✅ Atualizar status da compra (approved, refunded, cancelled)

**Validação:**
```sql
-- Verificar compra registrada
SELECT hp.*, u.email, c.title as course_title
FROM hotmart_purchases hp
LEFT JOIN users u ON hp.user_id = u.id
LEFT JOIN courses c ON hp.course_id = c.id
WHERE hp.hotmart_transaction_id = :transaction_id;

-- Verificar enrollment criado para compra aprovada
SELECT * FROM enrollments
WHERE user_id = :user_id AND course_id = :course_id;
```

**Arquivos relacionados:**
- `client/src/hooks/use-hotmart-products.ts`
- `server/hotmart-webhook.ts`

---

## Testes de Integridade e Relacionamentos

### Foreign Keys e Cascade Deletes

#### Cascade Delete de Courses
```sql
-- Ao deletar curso, verificar:
-- 1. Módulos são deletados
SELECT COUNT(*) FROM modules WHERE course_id = :deleted_course_id;
-- Deve retornar 0

-- 2. Aulas são deletadas (através de módulos)
SELECT COUNT(*) FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id = :deleted_course_id;
-- Deve retornar 0

-- 3. Enrollments são deletados
SELECT COUNT(*) FROM enrollments WHERE course_id = :deleted_course_id;
-- Deve retornar 0

-- 4. Posts são deletados
SELECT COUNT(*) FROM posts WHERE course_id = :deleted_course_id;
-- Deve retornar 0
```

#### Cascade Delete de Posts
```sql
-- Ao deletar post, verificar:
-- 1. Comentários são deletados
SELECT COUNT(*) FROM comments WHERE post_id = :deleted_post_id;
-- Deve retornar 0

-- 2. Saved posts são deletados
SELECT COUNT(*) FROM saved_posts WHERE post_id = :deleted_post_id;
-- Deve retornar 0
```

#### Cascade Delete de Modules
```sql
-- Ao deletar módulo, verificar:
-- 1. Aulas são deletadas
SELECT COUNT(*) FROM lessons WHERE module_id = :deleted_module_id;
-- Deve retornar 0
```

### Constraints e Validações

#### Email Único
```sql
-- Tentar criar usuário com email duplicado deve falhar
INSERT INTO users (id, email) VALUES (gen_random_uuid(), 'test@example.com');
INSERT INTO users (id, email) VALUES (gen_random_uuid(), 'test@example.com');
-- Segunda inserção deve falhar
```

#### Slug Único em Communities
```sql
-- Tentar criar comunidade com slug duplicado deve falhar
INSERT INTO communities (slug, name, owner_id) VALUES ('test', 'Test', :user_id);
INSERT INTO communities (slug, name, owner_id) VALUES ('test', 'Test 2', :user_id);
-- Segunda inserção deve falhar
```

#### Token Único em Invites
```sql
-- Verificar token único em course_invites
SELECT COUNT(*) FROM course_invites WHERE token = :token;
-- Deve retornar 0 ou 1

-- Verificar token único em community_invites
SELECT COUNT(*) FROM community_invites WHERE token = :token;
-- Deve retornar 0 ou 1
```

#### Hotmart Transaction ID Único
```sql
-- Verificar transaction ID único
SELECT COUNT(*) FROM hotmart_purchases WHERE hotmart_transaction_id = :transaction_id;
-- Deve retornar 0 ou 1
```

---

## Testes de Políticas RLS (Row Level Security)

### Posts RLS

#### INSERT Policy
- ✅ Usuário autenticado pode criar post
- ✅ `user_id` deve ser igual a `auth.uid()`

#### UPDATE Policy
- ✅ Usuário pode atualizar apenas próprio post
- ✅ Admin pode atualizar qualquer post

#### DELETE Policy
- ✅ Usuário pode deletar apenas próprio post
- ✅ Admin pode deletar qualquer post

**Validação:**
```sql
-- Tentar deletar post de outro usuário (deve falhar)
-- Como usuário A, tentar deletar post do usuário B
-- Deve retornar erro de permissão
```

### Comments RLS

#### INSERT Policy
- ✅ Usuário autenticado pode criar comentário
- ✅ `user_id` deve ser igual a `auth.uid()`

#### UPDATE Policy
- ✅ Usuário pode atualizar apenas próprio comentário
- ✅ Admin pode atualizar qualquer comentário

#### DELETE Policy
- ✅ Usuário pode deletar apenas próprio comentário
- ✅ Admin pode deletar qualquer comentário

### Courses RLS

#### SELECT Policy
- ✅ Todos usuários autenticados podem ver cursos

#### INSERT/UPDATE/DELETE Policy
- ✅ Apenas admins podem gerenciar cursos

### Enrollments RLS

#### INSERT Policy
- ✅ Usuário pode se inscrever apenas para si mesmo
- ✅ `user_id` deve ser igual a `auth.uid()`

### Saved Posts RLS

#### SELECT Policy
- ✅ Usuário vê apenas próprios posts salvos

#### INSERT Policy
- ✅ Usuário pode salvar apenas para si mesmo

#### DELETE Policy
- ✅ Usuário pode deletar apenas próprios posts salvos

### Notifications RLS

#### SELECT Policy
- ✅ Usuário vê apenas próprias notificações

#### UPDATE Policy
- ✅ Usuário pode atualizar apenas próprias notificações

---

## Checklist de Execução

Use o [checklist executável](../tests/persistence/checklist.md) para testes sistemáticos.

## Scripts SQL de Validação

Execute os scripts em `tests/persistence/sql/` para validação automatizada.

## Cenários Detalhados

Consulte os arquivos em `tests/persistence/scenarios/` para cenários de teste passo a passo.

