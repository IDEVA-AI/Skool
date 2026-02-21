# Cenários de Teste: Posts

## Cenário 1: Criar Post

### Pré-condições
- Usuário está autenticado
- Usuário está inscrito em pelo menos um curso
- Curso existe e está acessível

### Passos
1. Navegar para a página do feed
2. Clicar em "Criar Post" ou usar o composer
3. Preencher título: "Teste de Post"
4. Preencher conteúdo: "Este é um post de teste para validar persistência"
5. Selecionar curso da lista
6. Clicar em "Publicar"

### Resultado Esperado
- Post aparece no feed imediatamente após publicação
- Post contém título e conteúdo corretos
- Post mostra nome e avatar do usuário
- Post mostra nome do curso
- Post tem timestamp de criação

### Validação SQL
```sql
SELECT p.*, u.email, c.title as course_title
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN courses c ON p.course_id = c.id
WHERE p.title = 'Teste de Post'
ORDER BY p.created_at DESC
LIMIT 1;
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar post ainda aparece no feed
3. Verificar dados do post estão corretos

---

## Cenário 2: Editar Post Próprio

### Pré-condições
- Post existe e pertence ao usuário logado
- Usuário está autenticado

### Passos
1. Localizar post próprio no feed
2. Clicar no menu de ações (três pontos)
3. Selecionar "Editar"
4. Alterar título para "Post Editado"
5. Alterar conteúdo para "Conteúdo editado"
6. Salvar alterações

### Resultado Esperado
- Post é atualizado imediatamente no feed
- Título e conteúdo refletem as alterações
- Timestamp `updated_at` é atualizado

### Validação SQL
```sql
SELECT title, content, updated_at, created_at
FROM posts
WHERE id = :post_id;

-- updated_at deve ser diferente de created_at
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar alterações persistem
3. Verificar `updated_at` foi atualizado

---

## Cenário 3: Deletar Post Próprio

### Pré-condições
- Post existe e pertence ao usuário logado
- Post tem pelo menos um comentário (para testar cascade)
- Usuário está autenticado

### Passos
1. Localizar post próprio no feed
2. Clicar no menu de ações (três pontos)
3. Selecionar "Deletar"
4. Confirmar deleção no diálogo

### Resultado Esperado
- Post desaparece do feed imediatamente
- Mensagem de confirmação é exibida
- Comentários do post são deletados em cascade

### Validação SQL
```sql
-- Verificar post foi deletado
SELECT COUNT(*) FROM posts WHERE id = :post_id;
-- Deve retornar 0

-- Verificar comentários foram deletados em cascade
SELECT COUNT(*) FROM comments WHERE post_id = :post_id;
-- Deve retornar 0

-- Verificar saved_posts foram deletados em cascade
SELECT COUNT(*) FROM saved_posts WHERE post_id = :post_id;
-- Deve retornar 0
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar post não aparece mais no feed
3. Verificar comentários não aparecem mais

---

## Cenário 4: Tentar Editar Post de Outro Usuário

### Pré-condições
- Post existe e pertence a outro usuário
- Usuário está autenticado (não é admin)

### Passos
1. Localizar post de outro usuário no feed
2. Clicar no menu de ações (três pontos)
3. Verificar opções disponíveis

### Resultado Esperado
- Opção "Editar" não está disponível
- Apenas opções de leitura estão disponíveis
- Se tentar editar via API, deve retornar erro de permissão

### Validação RLS
```sql
-- Como usuário A, tentar atualizar post do usuário B
-- Deve retornar erro de permissão
UPDATE posts 
SET title = 'Tentativa de edição'
WHERE id = :post_id_do_usuario_b;
-- Deve falhar com erro de RLS
```

---

## Cenário 5: Admin Deletar Post de Qualquer Usuário

### Pré-condições
- Post existe e pertence a outro usuário
- Usuário logado tem role 'admin'

### Passos
1. Localizar post de outro usuário no feed
2. Clicar no menu de ações (três pontos)
3. Verificar opções de admin disponíveis
4. Selecionar "Deletar Post" (em Moderação)
5. Confirmar deleção

### Resultado Esperado
- Post é deletado com sucesso
- Mensagem de confirmação é exibida
- Post desaparece do feed

### Validação SQL
```sql
-- Verificar post foi deletado
SELECT COUNT(*) FROM posts WHERE id = :post_id;
-- Deve retornar 0
```

---

## Cenário 6: Fixar Post (Admin)

### Pré-condições
- Post existe
- Usuário logado tem role 'admin'

### Passos
1. Localizar post no feed
2. Clicar no menu de ações (três pontos)
3. Selecionar "Fixar Post" (em Moderação)
4. Confirmar ação

### Resultado Esperado
- Post é fixado (pinned = true)
- Post aparece no topo do feed
- Mensagem de confirmação é exibida

### Validação SQL
```sql
SELECT pinned, created_at
FROM posts
WHERE id = :post_id;
-- pinned deve ser true

-- Verificar ordenação no feed
SELECT id, pinned, created_at
FROM posts
ORDER BY pinned DESC, created_at DESC;
-- Post fixado deve aparecer primeiro
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar post fixado ainda aparece no topo

---

## Cenário 7: Desfixar Post (Admin)

### Pré-condições
- Post existe e está fixado (pinned = true)
- Usuário logado tem role 'admin'

### Passos
1. Localizar post fixado no feed
2. Clicar no menu de ações (três pontos)
3. Selecionar "Desfixar Post" (em Moderação)
4. Confirmar ação

### Resultado Esperado
- Post é desfixado (pinned = false)
- Post não aparece mais no topo do feed
- Mensagem de confirmação é exibida

### Validação SQL
```sql
SELECT pinned
FROM posts
WHERE id = :post_id;
-- pinned deve ser false
```

---

## Cenário 8: Criar Post em Curso Bloqueado

### Pré-condições
- Curso existe e está bloqueado (is_locked = true)
- Usuário não está inscrito no curso

### Passos
1. Tentar criar post
2. Selecionar curso bloqueado

### Resultado Esperado
- Post não pode ser criado
- Mensagem de erro informando que curso está bloqueado
- Ou curso bloqueado não aparece na lista de seleção

---

## Cenário 9: Buscar Posts por Curso

### Pré-condições
- Múltiplos posts existem em diferentes cursos
- Usuário está inscrito em vários cursos

### Passos
1. Navegar para página de curso específico
2. Visualizar posts do curso

### Resultado Esperado
- Apenas posts do curso selecionado são exibidos
- Posts estão ordenados corretamente (fixados primeiro, depois por data)
- Dados do usuário e curso estão corretos

### Validação SQL
```sql
SELECT p.*, u.email, c.title as course_title
FROM posts p
JOIN users u ON p.user_id = u.id
JOIN courses c ON p.course_id = c.id
WHERE p.course_id = :course_id
ORDER BY p.pinned DESC, p.created_at DESC;
```

---

## Cenário 10: Verificar Contagem de Comentários

### Pré-condições
- Post existe
- Post tem vários comentários

### Passos
1. Visualizar post no feed
2. Verificar contagem de comentários exibida

### Resultado Esperado
- Contagem de comentários está correta
- Contagem é atualizada quando novo comentário é adicionado

### Validação SQL
```sql
SELECT 
    p.id,
    p.title,
    COUNT(c.id) as comment_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.id = :post_id
GROUP BY p.id, p.title;
```

---

## Observações Gerais

- Todos os testes devem ser executados em ambiente de desenvolvimento/teste
- Dados de teste devem ser limpos após execução
- Verificar logs do Supabase para erros de RLS
- Documentar qualquer comportamento inesperado

