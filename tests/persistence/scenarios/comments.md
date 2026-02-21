# Cenários de Teste: Comments

## Cenário 1: Criar Comentário em Post

### Pré-condições
- Post existe e é visível para o usuário
- Usuário está autenticado

### Passos
1. Abrir post no feed ou modal de detalhes
2. Localizar área de comentários
3. Digitar comentário: "Este é um comentário de teste"
4. Clicar em "Comentar" ou pressionar Enter

### Resultado Esperado
- Comentário aparece na lista imediatamente
- Comentário mostra nome e avatar do usuário
- Comentário tem timestamp de criação
- Contagem de comentários do post é atualizada

### Validação SQL
```sql
SELECT c.*, u.email, p.title as post_title
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN posts p ON c.post_id = p.id
WHERE c.content = 'Este é um comentário de teste'
ORDER BY c.created_at DESC
LIMIT 1;
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar comentário ainda aparece
3. Verificar dados do comentário estão corretos

---

## Cenário 2: Criar Resposta a Comentário

### Pré-condições
- Post existe e tem pelo menos um comentário
- Usuário está autenticado

### Passos
1. Abrir post no feed ou modal de detalhes
2. Localizar comentário existente
3. Clicar em "Responder"
4. Digitar resposta: "Esta é uma resposta ao comentário"
5. Clicar em "Responder" ou pressionar Enter

### Resultado Esperado
- Resposta aparece como filho do comentário pai
- Resposta está indentada ou visualmente agrupada
- Resposta mostra nome e avatar do usuário
- `parent_id` está correto no banco

### Validação SQL
```sql
SELECT 
    c.id,
    c.content,
    c.parent_id,
    parent.content as parent_content
FROM comments c
LEFT JOIN comments parent ON c.parent_id = parent.id
WHERE c.content = 'Esta é uma resposta ao comentário'
ORDER BY c.created_at DESC
LIMIT 1;
-- parent_id deve apontar para o comentário pai
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar resposta ainda aparece como filho
3. Verificar árvore de comentários está correta

---

## Cenário 3: Editar Comentário Próprio

### Pré-condições
- Comentário existe e pertence ao usuário logado
- Usuário está autenticado

### Passos
1. Localizar comentário próprio
2. Clicar em "Editar" (se disponível)
3. Alterar conteúdo para "Comentário editado"
4. Salvar alterações

### Resultado Esperado
- Comentário é atualizado imediatamente
- Conteúdo reflete as alterações
- Timestamp `updated_at` é atualizado
- Indicador visual mostra que foi editado (se implementado)

### Validação SQL
```sql
SELECT content, updated_at, created_at
FROM comments
WHERE id = :comment_id;

-- updated_at deve ser diferente de created_at
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar alterações persistem
3. Verificar `updated_at` foi atualizado

---

## Cenário 4: Deletar Comentário Próprio

### Pré-condições
- Comentário existe e pertence ao usuário logado
- Comentário pode ter respostas (para testar cascade)
- Usuário está autenticado

### Passos
1. Localizar comentário próprio
2. Clicar em "Deletar" (se disponível)
3. Confirmar deleção

### Resultado Esperado
- Comentário desaparece da lista imediatamente
- Mensagem de confirmação é exibida
- Contagem de comentários do post é atualizada
- Respostas do comentário são tratadas adequadamente

### Validação SQL
```sql
-- Verificar comentário foi deletado
SELECT COUNT(*) FROM comments WHERE id = :comment_id;
-- Deve retornar 0

-- Verificar respostas (se cascade delete implementado)
SELECT COUNT(*) FROM comments WHERE parent_id = :comment_id;
-- Deve retornar 0 se cascade delete implementado
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar comentário não aparece mais
3. Verificar contagem de comentários está correta

---

## Cenário 5: Tentar Editar Comentário de Outro Usuário

### Pré-condições
- Comentário existe e pertence a outro usuário
- Usuário está autenticado (não é admin)

### Passos
1. Localizar comentário de outro usuário
2. Verificar opções disponíveis

### Resultado Esperado
- Opção "Editar" não está disponível
- Apenas opções de leitura estão disponíveis
- Se tentar editar via API, deve retornar erro de permissão

### Validação RLS
```sql
-- Como usuário A, tentar atualizar comentário do usuário B
-- Deve retornar erro de permissão
UPDATE comments 
SET content = 'Tentativa de edição'
WHERE id = :comment_id_do_usuario_b;
-- Deve falhar com erro de RLS
```

---

## Cenário 6: Admin Deletar Comentário de Qualquer Usuário

### Pré-condições
- Comentário existe e pertence a outro usuário
- Usuário logado tem role 'admin'

### Passos
1. Localizar comentário de outro usuário
2. Clicar no menu de ações (se disponível)
3. Selecionar "Deletar" (opção de admin)
4. Confirmar deleção

### Resultado Esperado
- Comentário é deletado com sucesso
- Mensagem de confirmação é exibida
- Comentário desaparece da lista

### Validação SQL
```sql
-- Verificar comentário foi deletado
SELECT COUNT(*) FROM comments WHERE id = :comment_id;
-- Deve retornar 0
```

---

## Cenário 7: Verificar Árvore de Comentários

### Pré-condições
- Post existe e tem múltiplos comentários
- Alguns comentários têm respostas
- Usuário está autenticado

### Passos
1. Abrir post no feed ou modal de detalhes
2. Visualizar lista de comentários
3. Verificar estrutura hierárquica

### Resultado Esperado
- Comentários raiz aparecem primeiro
- Respostas aparecem como filhos dos comentários pai
- Hierarquia está visualmente clara
- Ordenação está correta (comentários raiz por data, respostas por data)

### Validação SQL
```sql
-- Verificar estrutura da árvore
WITH RECURSIVE comment_tree AS (
    -- Comentários raiz
    SELECT id, parent_id, content, 1 as depth
    FROM comments
    WHERE post_id = :post_id AND parent_id IS NULL
    
    UNION ALL
    
    -- Comentários filhos
    SELECT c.id, c.parent_id, c.content, ct.depth + 1
    FROM comments c
    JOIN comment_tree ct ON c.parent_id = ct.id
)
SELECT * FROM comment_tree
ORDER BY depth, created_at;
```

---

## Cenário 8: Comentário em Post Deletado

### Pré-condições
- Post existe e tem comentários
- Usuário tem permissão para deletar o post

### Passos
1. Deletar post que tem comentários
2. Verificar comportamento dos comentários

### Resultado Esperado
- Comentários são deletados em cascade quando post é deletado
- Comentários não aparecem mais em nenhuma lista

### Validação SQL
```sql
-- Após deletar post, verificar comentários
SELECT COUNT(*) FROM comments WHERE post_id = :deleted_post_id;
-- Deve retornar 0
```

---

## Cenário 9: Múltiplas Respostas ao Mesmo Comentário

### Pré-condições
- Post existe e tem um comentário raiz
- Múltiplos usuários estão autenticados

### Passos
1. Usuário A cria comentário raiz
2. Usuário B responde ao comentário de A
3. Usuário C responde ao comentário de A
4. Usuário D responde ao comentário de B

### Resultado Esperado
- Todas as respostas aparecem corretamente
- Estrutura hierárquica está correta
- Respostas ao mesmo pai são ordenadas por data

### Validação SQL
```sql
-- Verificar todas as respostas ao comentário pai
SELECT 
    c.id,
    c.content,
    c.parent_id,
    u.email as author_email
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.parent_id = :parent_comment_id
ORDER BY c.created_at ASC;
```

---

## Cenário 10: Ordenação de Comentários

### Pré-condições
- Post existe e tem múltiplos comentários
- Comentários foram criados em momentos diferentes

### Passos
1. Visualizar lista de comentários do post
2. Verificar ordenação

### Resultado Esperado
- Comentários raiz estão ordenados por `created_at` ASC (mais antigos primeiro)
- Respostas estão ordenadas por `created_at` ASC dentro de cada pai
- Ordenação persiste após reload

### Validação SQL
```sql
-- Verificar ordenação
SELECT 
    id,
    content,
    parent_id,
    created_at
FROM comments
WHERE post_id = :post_id
ORDER BY 
    COALESCE(parent_id, id), -- Agrupar por pai
    created_at ASC; -- Ordenar por data dentro do grupo
```

---

## Observações Gerais

- Testar com diferentes níveis de profundidade na árvore de comentários
- Verificar performance com muitos comentários
- Validar que soft delete não quebra a hierarquia (se implementado)
- Documentar comportamento de cascade delete de respostas

