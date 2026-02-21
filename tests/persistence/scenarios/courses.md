# Cenários de Teste: Courses

## Cenário 1: Criar Curso

### Pré-condições
- Usuário logado tem role 'admin'
- Comunidade existe (se curso será associado a uma)

### Passos
1. Navegar para página de administração de cursos
2. Clicar em "Criar Curso"
3. Preencher título: "Curso de Teste"
4. Preencher descrição: "Descrição do curso de teste"
5. Selecionar comunidade (opcional)
6. Definir ordem (opcional)
7. Salvar curso

### Resultado Esperado
- Curso é criado com sucesso
- Curso aparece na lista imediatamente
- Curso tem `created_at` preenchido
- Relacionamento com comunidade está correto (se aplicável)

### Validação SQL
```sql
SELECT c.*, co.name as community_name, u.email as created_by_email
FROM courses c
LEFT JOIN communities co ON c.community_id = co.id
LEFT JOIN users u ON c.created_by = u.id
WHERE c.title = 'Curso de Teste'
ORDER BY c.created_at DESC
LIMIT 1;
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar curso ainda aparece na lista
3. Verificar dados do curso estão corretos

---

## Cenário 2: Editar Curso

### Pré-condições
- Curso existe
- Usuário logado tem role 'admin'

### Passos
1. Localizar curso na lista
2. Clicar em "Editar"
3. Alterar título para "Curso Editado"
4. Alterar descrição para "Descrição editada"
5. Alterar ordem para 5
6. Salvar alterações

### Resultado Esperado
- Curso é atualizado imediatamente
- Alterações aparecem na lista
- Timestamp `updated_at` é atualizado

### Validação SQL
```sql
SELECT title, description, "order", updated_at, created_at
FROM courses
WHERE id = :course_id;

-- updated_at deve ser diferente de created_at
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar alterações persistem
3. Verificar ordenação está correta

---

## Cenário 3: Atualizar Imagem de Capa (URL)

### Pré-condições
- Curso existe
- Usuário logado tem role 'admin'
- URL de imagem válida disponível

### Passos
1. Editar curso
2. Inserir URL da imagem: "https://example.com/image.jpg"
3. Salvar alterações

### Resultado Esperado
- URL da imagem é salva
- Imagem aparece na visualização do curso
- `cover_image_url` está preenchido no banco

### Validação SQL
```sql
SELECT cover_image_url, cover_image_data
FROM courses
WHERE id = :course_id;
-- cover_image_url deve estar preenchido
```

### Validação Pós-Reload
1. Recarregar a página
2. Verificar imagem aparece corretamente

---

## Cenário 4: Atualizar Imagem de Capa (Base64)

### Pré-condições
- Curso existe
- Usuário logado tem role 'admin'
- Arquivo de imagem disponível

### Passos
1. Editar curso
2. Fazer upload de imagem
3. Salvar alterações

### Resultado Esperado
- Dados base64 da imagem são salvos
- MIME type é salvo corretamente
- Imagem aparece na visualização do curso
- `cover_image_data` e `cover_image_mime_type` estão preenchidos

### Validação SQL
```sql
SELECT 
    cover_image_data IS NOT NULL as has_base64_data,
    cover_image_mime_type,
    LENGTH(cover_image_data) as data_length
FROM courses
WHERE id = :course_id;
-- cover_image_data deve estar preenchido
-- cover_image_mime_type deve estar preenchido
```

---

## Cenário 5: Bloquear/Desbloquear Curso

### Pré-condições
- Curso existe
- Usuário logado tem role 'admin'

### Passos - Bloquear
1. Editar curso
2. Marcar checkbox "Curso Bloqueado" ou definir `is_locked = true`
3. Salvar alterações

### Resultado Esperado
- Curso é marcado como bloqueado
- Usuários não podem se inscrever no curso
- `is_locked` é `true` no banco

### Validação SQL
```sql
SELECT is_locked
FROM courses
WHERE id = :course_id;
-- is_locked deve ser true
```

### Passos - Desbloquear
1. Editar curso bloqueado
2. Desmarcar checkbox "Curso Bloqueado" ou definir `is_locked = false`
3. Salvar alterações

### Resultado Esperado
- Curso é desbloqueado
- Usuários podem se inscrever no curso
- `is_locked` é `false` no banco

---

## Cenário 6: Deletar Curso

### Pré-condições
- Curso existe
- Curso tem módulos e aulas
- Curso tem inscrições
- Curso tem posts
- Usuário logado tem role 'admin'

### Passos
1. Localizar curso na lista
2. Clicar em "Deletar"
3. Confirmar deleção

### Resultado Esperado
- Curso é deletado
- Módulos são deletados em cascade
- Aulas são deletadas em cascade
- Enrollments são deletados em cascade
- Posts são deletados em cascade

### Validação SQL
```sql
-- Verificar curso foi deletado
SELECT COUNT(*) FROM courses WHERE id = :course_id;
-- Deve retornar 0

-- Verificar módulos foram deletados em cascade
SELECT COUNT(*) FROM modules WHERE course_id = :course_id;
-- Deve retornar 0

-- Verificar aulas foram deletadas (através de módulos)
SELECT COUNT(*) FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id = :course_id;
-- Deve retornar 0

-- Verificar enrollments foram deletados em cascade
SELECT COUNT(*) FROM enrollments WHERE course_id = :course_id;
-- Deve retornar 0

-- Verificar posts foram deletados em cascade
SELECT COUNT(*) FROM posts WHERE course_id = :course_id;
-- Deve retornar 0
```

---

## Cenário 7: Criar Curso Padrão para Comunidade

### Pré-condições
- Comunidade existe
- Usuário está autenticado
- Comunidade não tem curso padrão ainda

### Passos
1. Criar post na comunidade (sem curso existente)
2. Sistema deve criar curso padrão automaticamente
3. Verificar curso foi criado

### Resultado Esperado
- Curso padrão "Geral" é criado automaticamente
- Curso está associado à comunidade
- Usuário é automaticamente inscrito no curso
- Post é criado no curso padrão

### Validação SQL
```sql
-- Verificar curso padrão foi criado
SELECT c.*, co.name as community_name
FROM courses c
JOIN communities co ON c.community_id = co.id
WHERE c.community_id = :community_id
AND c.title = 'Geral'
ORDER BY c.created_at DESC
LIMIT 1;

-- Verificar usuário foi inscrito automaticamente
SELECT * FROM enrollments
WHERE user_id = :user_id 
AND course_id = (
    SELECT id FROM courses 
    WHERE community_id = :community_id 
    AND title = 'Geral'
    ORDER BY created_at DESC
    LIMIT 1
);
```

---

## Cenário 8: Buscar Cursos por Comunidade

### Pré-condições
- Múltiplos cursos existem
- Alguns cursos estão associados a comunidades diferentes
- Usuário está autenticado

### Passos
1. Navegar para página da comunidade
2. Visualizar lista de cursos da comunidade

### Resultado Esperado
- Apenas cursos da comunidade selecionada são exibidos
- Cursos estão ordenados por `order` e `created_at`
- Dados dos cursos estão corretos

### Validação SQL
```sql
-- Buscar cursos por comunidade (via community_id direto)
SELECT c.*
FROM courses c
WHERE c.community_id = :community_id
ORDER BY c."order" NULLS LAST, c.created_at DESC;

-- Buscar cursos por comunidade (via course_communities)
SELECT c.*
FROM courses c
JOIN course_communities cc ON c.id = cc.course_id
WHERE cc.community_id = :community_id
ORDER BY c."order" NULLS LAST, c.created_at DESC;
```

---

## Cenário 9: Alterar Ordem dos Cursos

### Pré-condições
- Múltiplos cursos existem
- Usuário logado tem role 'admin'

### Passos
1. Editar curso
2. Alterar campo "Ordem" para 1
3. Salvar alterações
4. Editar outro curso
5. Alterar campo "Ordem" para 2
6. Salvar alterações

### Resultado Esperado
- Ordem dos cursos é atualizada
- Cursos aparecem na ordem correta na lista
- Ordenação persiste após reload

### Validação SQL
```sql
-- Verificar ordenação
SELECT id, title, "order", created_at
FROM courses
ORDER BY "order" NULLS LAST, created_at DESC;
-- Cursos devem aparecer na ordem correta
```

---

## Cenário 10: Tentar Inscrever em Curso Bloqueado

### Pré-condições
- Curso existe e está bloqueado (is_locked = true)
- Usuário está autenticado
- Usuário não está inscrito no curso

### Passos
1. Tentar se inscrever no curso bloqueado
2. Verificar comportamento

### Resultado Esperado
- Inscrição é bloqueada
- Mensagem de erro informa que curso está bloqueado
- Enrollment não é criado

### Validação SQL
```sql
-- Verificar enrollment não foi criado
SELECT COUNT(*) FROM enrollments
WHERE user_id = :user_id 
AND course_id = :locked_course_id;
-- Deve retornar 0
```

---

## Cenário 11: Verificar Cascade Delete de Módulos

### Pré-condições
- Curso existe e tem módulos
- Usuário logado tem role 'admin'

### Passos
1. Verificar módulos existentes do curso
2. Deletar curso
3. Verificar módulos foram deletados

### Resultado Esperado
- Todos os módulos do curso são deletados automaticamente
- Nenhum módulo órfão permanece no banco

### Validação SQL
```sql
-- Antes de deletar, anotar IDs dos módulos
SELECT id FROM modules WHERE course_id = :course_id;

-- Após deletar curso, verificar módulos
SELECT COUNT(*) FROM modules WHERE course_id = :course_id;
-- Deve retornar 0
```

---

## Cenário 12: Verificar Cascade Delete de Aulas

### Pré-condições
- Curso existe e tem módulos com aulas
- Usuário logado tem role 'admin'

### Passos
1. Verificar aulas existentes do curso (através dos módulos)
2. Deletar curso
3. Verificar aulas foram deletadas

### Resultado Esperado
- Todas as aulas são deletadas automaticamente (através da deleção dos módulos)
- Nenhuma aula órfã permanece no banco

### Validação SQL
```sql
-- Antes de deletar, anotar IDs das aulas
SELECT l.id 
FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id = :course_id;

-- Após deletar curso, verificar aulas
SELECT COUNT(*) FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.course_id = :course_id;
-- Deve retornar 0
```

---

## Observações Gerais

- Testar com diferentes tipos de imagem (JPG, PNG, etc.)
- Verificar tamanho máximo de dados base64
- Validar que curso bloqueado não aparece na lista de cursos disponíveis
- Documentar comportamento de cascade delete em todos os relacionamentos

