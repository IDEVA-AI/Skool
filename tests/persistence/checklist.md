# Checklist de Testes de Persistência - S-K-O-O-L

Este checklist deve ser executado sistematicamente para validar todas as operações de persistência do sistema.

## Como Usar

1. Marque cada item como concluído após testar
2. Anote qualquer problema encontrado na seção "Observações"
3. Execute os scripts SQL de validação após cada seção
4. Documente resultados inesperados

---

## 1. Posts

### CREATE
- [ ] Criar post em curso existente
- [ ] Verificar post aparece no feed imediatamente
- [ ] Verificar post aparece após reload da página
- [ ] Verificar `user_id` está correto (usuário logado)
- [ ] Verificar `created_at` está preenchido
- [ ] Verificar relacionamento com curso mantido

**Script SQL:** `tests/persistence/sql/verify_posts.sql`

### READ
- [ ] Buscar todos os posts dos cursos inscritos
- [ ] Buscar posts por curso específico
- [ ] Verificar posts fixados aparecem primeiro
- [ ] Verificar ordenação por data (mais recentes primeiro)
- [ ] Verificar dados do usuário e curso incluídos
- [ ] Verificar contagem de comentários correta

### UPDATE
- [ ] Editar título do próprio post
- [ ] Editar conteúdo do próprio post
- [ ] Verificar alterações aparecem imediatamente
- [ ] Verificar alterações persistem após reload
- [ ] Verificar `updated_at` é atualizado
- [ ] Tentar editar post de outro usuário (deve falhar)
- [ ] Admin pode editar qualquer post

### DELETE
- [ ] Deletar próprio post
- [ ] Verificar post desaparece do feed imediatamente
- [ ] Verificar post não aparece após reload
- [ ] Verificar comentários são deletados em cascade
- [ ] Verificar saved_posts são deletados em cascade
- [ ] Tentar deletar post de outro usuário (deve falhar)
- [ ] Admin pode deletar qualquer post

### Operações Especiais
- [ ] Fixar post (admin)
- [ ] Verificar post fixado aparece no topo
- [ ] Desfixar post (admin)
- [ ] Verificar post não aparece mais no topo

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 2. Comments

### CREATE
- [ ] Criar comentário em post existente
- [ ] Verificar comentário aparece na lista imediatamente
- [ ] Verificar comentário aparece após reload
- [ ] Criar resposta a comentário (parent_id)
- [ ] Verificar resposta aparece como filho do comentário pai
- [ ] Verificar `user_id` está correto
- [ ] Verificar `created_at` está preenchido

**Script SQL:** `tests/persistence/sql/verify_comments.sql`

### READ
- [ ] Buscar comentários por post
- [ ] Verificar ordenação por data
- [ ] Verificar árvore de respostas está correta
- [ ] Verificar dados do usuário incluídos

### UPDATE
- [ ] Editar próprio comentário
- [ ] Verificar alterações persistem após reload
- [ ] Verificar `updated_at` é atualizado
- [ ] Tentar editar comentário de outro usuário (deve falhar)
- [ ] Admin pode editar qualquer comentário

### DELETE
- [ ] Deletar próprio comentário
- [ ] Verificar comentário desaparece imediatamente
- [ ] Verificar comentário não aparece após reload
- [ ] Tentar deletar comentário de outro usuário (deve falhar)
- [ ] Admin pode deletar qualquer comentário

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 3. Courses

### CREATE
- [ ] Criar curso
- [ ] Verificar curso aparece na lista imediatamente
- [ ] Verificar curso aparece após reload
- [ ] Criar curso padrão para comunidade
- [ ] Verificar relacionamento com comunidade mantido
- [ ] Verificar `created_at` está preenchido

**Script SQL:** `tests/persistence/sql/verify_courses.sql`

### READ
- [ ] Buscar todos os cursos
- [ ] Buscar curso por ID
- [ ] Buscar cursos por comunidade
- [ ] Verificar ordenação por `order` e `created_at`
- [ ] Verificar filtro por `is_locked`

### UPDATE
- [ ] Editar título do curso
- [ ] Editar descrição do curso
- [ ] Atualizar imagem de capa (URL)
- [ ] Atualizar imagem de capa (base64)
- [ ] Alterar ordem do curso
- [ ] Alterar status de bloqueio
- [ ] Verificar alterações persistem após reload
- [ ] Verificar `updated_at` é atualizado

### DELETE
- [ ] Deletar curso (admin)
- [ ] Verificar módulos são deletados em cascade
- [ ] Verificar aulas são deletadas em cascade
- [ ] Verificar enrollments são deletados em cascade
- [ ] Verificar posts são deletados em cascade

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 4. Modules

### CREATE
- [ ] Criar módulo em curso existente
- [ ] Verificar módulo aparece na lista
- [ ] Verificar relacionamento com curso mantido

### READ
- [ ] Buscar módulos por curso
- [ ] Verificar ordenação por `order`

### UPDATE
- [ ] Editar título do módulo
- [ ] Alterar ordem do módulo
- [ ] Verificar alterações persistem após reload

### DELETE
- [ ] Deletar módulo
- [ ] Verificar aulas são deletadas em cascade

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 5. Lessons

### CREATE
- [ ] Criar aula em módulo existente
- [ ] Verificar aula aparece na lista
- [ ] Verificar relacionamento com módulo mantido

### READ
- [ ] Buscar aulas por módulo
- [ ] Verificar ordenação por `order`

### UPDATE
- [ ] Editar título da aula
- [ ] Editar conteúdo (content_url)
- [ ] Alterar ordem da aula
- [ ] Verificar alterações persistem após reload

### DELETE
- [ ] Deletar aula
- [ ] Verificar progresso da aula é tratado adequadamente

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 6. Enrollments

### CREATE
- [ ] Inscrever em curso gratuito
- [ ] Verificar inscrição permite acesso ao curso
- [ ] Verificar inscrição aparece após reload
- [ ] Tentar inscrever em curso bloqueado (deve falhar)
- [ ] Tentar inscrever duas vezes (deve prevenir duplicação)
- [ ] Verificar `enrolled_at` está preenchido

### READ
- [ ] Buscar cursos inscritos do usuário
- [ ] Verificar se usuário está inscrito em curso

### DELETE
- [ ] Cancelar inscrição (se aplicável)
- [ ] Verificar acesso ao curso é removido

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 7. Announcements

### CREATE
- [ ] Criar aviso
- [ ] Verificar aviso aparece na lista
- [ ] Verificar relacionamento com usuário e comunidade mantido

### READ
- [ ] Buscar avisos ativos
- [ ] Buscar avisos por comunidade
- [ ] Verificar ordenação por data

### UPDATE
- [ ] Editar título e conteúdo do aviso
- [ ] Ativar aviso (is_active = true)
- [ ] Desativar aviso (is_active = false)
- [ ] Verificar alterações persistem após reload

### DELETE
- [ ] Deletar aviso
- [ ] Verificar aviso não aparece após deletar

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 8. Communities

### CREATE
- [ ] Criar comunidade
- [ ] Verificar slug único
- [ ] Verificar comunidade aparece na lista
- [ ] Verificar relacionamento com owner mantido

### READ
- [ ] Buscar todas as comunidades
- [ ] Buscar comunidade por slug
- [ ] Buscar comunidades do usuário

### UPDATE
- [ ] Editar nome da comunidade
- [ ] Editar descrição
- [ ] Atualizar logo (base64 ou URL)
- [ ] Atualizar capa (base64 ou URL)
- [ ] Verificar alterações persistem após reload

### DELETE
- [ ] Deletar comunidade (verificar dependências)

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 9. Community Members

### CREATE
- [ ] Adicionar membro à comunidade
- [ ] Verificar membro aparece na lista
- [ ] Verificar `joined_at` está preenchido

### READ
- [ ] Buscar membros da comunidade
- [ ] Verificar role do membro

### UPDATE
- [ ] Alterar role do membro
- [ ] Verificar alteração persiste após reload

### DELETE
- [ ] Remover membro da comunidade
- [ ] Verificar membro não aparece após remover

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 10. Saved Posts

### CREATE
- [ ] Salvar post
- [ ] Verificar post aparece na lista de salvos
- [ ] Tentar salvar mesmo post duas vezes (deve prevenir duplicação)

### READ
- [ ] Buscar posts salvos do usuário
- [ ] Verificar dados do post completo incluídos

### DELETE
- [ ] Remover post salvo
- [ ] Verificar post não aparece na lista após remover

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 11. Notifications

### CREATE
- [ ] Criar notificação (automático via sistema)
- [ ] Verificar notificação aparece na lista
- [ ] Verificar relacionamento com usuário mantido

### READ
- [ ] Buscar notificações do usuário
- [ ] Filtrar por `is_read`
- [ ] Verificar ordenação por data

### UPDATE
- [ ] Marcar notificação como lida
- [ ] Verificar estado persiste após reload

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 12. Conversations & Messages

### Conversations CREATE
- [ ] Criar conversa DM
- [ ] Criar conversa de grupo
- [ ] Verificar conversa aparece na lista

### Messages CREATE
- [ ] Criar mensagem em conversa
- [ ] Verificar mensagem aparece imediatamente
- [ ] Verificar mensagem aparece após reload

### Messages UPDATE
- [ ] Editar mensagem
- [ ] Verificar `edited_at` é atualizado
- [ ] Soft delete de mensagem
- [ ] Verificar mensagem não aparece mas permanece no banco

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 13. Lesson Progress

### CREATE
- [ ] Marcar aula como concluída
- [ ] Verificar progresso é calculado corretamente
- [ ] Tentar marcar mesma aula duas vezes (deve prevenir duplicação)
- [ ] Verificar `completed_at` está preenchido

### READ
- [ ] Buscar progresso do usuário
- [ ] Calcular percentual de conclusão do curso

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 14. Course Invites

### CREATE
- [ ] Criar convite para curso
- [ ] Verificar token único
- [ ] Verificar expiração definida

### READ
- [ ] Buscar convites do curso
- [ ] Validar token de convite

### UPDATE
- [ ] Aceitar convite via token
- [ ] Verificar enrollment é criado automaticamente
- [ ] Verificar `accepted_at` é preenchido

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 15. Community Invites

### CREATE
- [ ] Criar convite para comunidade
- [ ] Verificar token único
- [ ] Verificar expiração definida

### READ
- [ ] Buscar convites da comunidade
- [ ] Validar token de convite

### UPDATE
- [ ] Aceitar convite via token
- [ ] Verificar community_member é criado automaticamente
- [ ] Verificar `used_at` é preenchido

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 16. Course Communities

### CREATE
- [ ] Associar curso a comunidade
- [ ] Verificar curso aparece na comunidade

### READ
- [ ] Buscar cursos por comunidade

### DELETE
- [ ] Remover associação curso-comunidade
- [ ] Verificar curso não aparece mais na comunidade

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 17. Course Unlock Pages

### CREATE
- [ ] Criar página de desbloqueio para curso
- [ ] Verificar relacionamento 1:1 mantido

### READ
- [ ] Buscar página por curso

### UPDATE
- [ ] Editar conteúdo da página
- [ ] Atualizar imagem hero
- [ ] Atualizar features e bonus
- [ ] Verificar alterações persistem após reload

### DELETE
- [ ] Deletar página de desbloqueio

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## 18. Hotmart Products & Purchases

### Products CREATE
- [ ] Criar produto associado ao curso
- [ ] Verificar `hotmart_product_id` único

### Products READ
- [ ] Buscar produtos
- [ ] Buscar produto por curso

### Purchases CREATE
- [ ] Registrar compra via webhook
- [ ] Verificar `hotmart_transaction_id` único
- [ ] Verificar compra aprovada cria enrollment automaticamente

### Purchases UPDATE
- [ ] Atualizar status da compra
- [ ] Verificar alteração persiste após reload

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## Testes de Integridade

### Foreign Keys
- [ ] Executar `tests/persistence/sql/verify_integrity.sql`
- [ ] Verificar não há registros órfãos
- [ ] Verificar todos os relacionamentos estão válidos

### Constraints de Unicidade
- [ ] Verificar email único em users
- [ ] Verificar slug único em communities
- [ ] Verificar token único em invites
- [ ] Verificar hotmart transaction ID único

### Cascade Deletes
- [ ] Deletar curso e verificar módulos deletados
- [ ] Deletar módulo e verificar aulas deletadas
- [ ] Deletar post e verificar comentários deletados

**Script SQL:** `tests/persistence/sql/verify_integrity.sql`

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## Testes de RLS (Row Level Security)

### Posts RLS
- [ ] Usuário só pode criar post para si mesmo
- [ ] Usuário só pode editar próprio post
- [ ] Usuário só pode deletar próprio post
- [ ] Admin pode editar qualquer post
- [ ] Admin pode deletar qualquer post

### Comments RLS
- [ ] Usuário só pode criar comentário para si mesmo
- [ ] Usuário só pode editar próprio comentário
- [ ] Usuário só pode deletar próprio comentário
- [ ] Admin pode editar qualquer comentário
- [ ] Admin pode deletar qualquer comentário

### Courses RLS
- [ ] Todos podem ver cursos
- [ ] Apenas admin pode criar/editar/deletar cursos

### Enrollments RLS
- [ ] Usuário só pode se inscrever para si mesmo

### Saved Posts RLS
- [ ] Usuário só vê próprios posts salvos
- [ ] Usuário só pode salvar para si mesmo

### Notifications RLS
- [ ] Usuário só vê próprias notificações
- [ ] Usuário só pode atualizar próprias notificações

**Observações:**
```
[Anotar problemas encontrados aqui]
```

---

## Resumo da Execução

**Data de Execução:** _______________

**Executado por:** _______________

**Total de Testes:** _______________

**Testes Aprovados:** _______________

**Testes Falhados:** _______________

**Problemas Críticos Encontrados:**
```
[Listar problemas críticos aqui]
```

**Próximos Passos:**
```
[Listar ações necessárias aqui]
```

