# Melhorias de Arquitetura - Segregação de Regras de Negócio

**Data:** Janeiro 2025  
**Status:** Implementado

---

## Resumo das Mudanças

Este documento descreve as melhorias implementadas para segregar regras de negócio do frontend e melhorar a organização do código.

---

## 1. Remoção de Fallbacks Sensíveis

### Mudança
- **Arquivo:** `client/src/lib/supabase.ts`
- **Antes:** Fallbacks hardcoded para URL e chave anon do Supabase em desenvolvimento
- **Depois:** Exige variáveis de ambiente em todos os ambientes

### Impacto
- ✅ Segurança melhorada (sem credenciais no código)
- ✅ Consistência entre ambientes
- ⚠️ **Ação necessária:** Criar arquivo `.env.local` com as variáveis:
  ```
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-chave-anon
  ```

---

## 2. Camada de Serviços

### Estrutura Criada
```
client/src/services/
├── index.ts          # Exports centralizados
├── posts.ts         # Serviços de posts
├── courses.ts       # Serviços de cursos
└── comments.ts      # Serviços de comentários
```

### Benefícios
- ✅ Separação de responsabilidades (lógica de dados separada dos hooks)
- ✅ Reutilização de código
- ✅ Facilita migração futura para API backend
- ✅ Testes mais fáceis (serviços podem ser testados isoladamente)

### Hooks Migrados
- ✅ `use-posts.ts` - Usa `postsService`
- ✅ `use-forum.ts` - Usa `postsService` e `commentsService`
- ✅ `use-courses.ts` - Usa `coursesService`

### Hooks Pendentes de Migração
Os seguintes hooks ainda fazem chamadas diretas ao Supabase e devem ser migrados gradualmente:
- `use-admin-courses.ts`
- `use-admin-modules-lessons.ts`
- `use-announcements.ts`
- `use-chat.ts`
- `use-communities.ts`
- `use-community-billing.ts`
- `use-course-content.ts`
- `use-course-invites.ts`
- `use-instructor-stats.ts`
- `use-notifications.ts`
- `use-premium.ts`
- `use-profile.ts`
- `use-reactions.ts`
- `use-saved-posts.ts`
- `use-search.ts`
- `use-storage-upload.ts`
- `use-user-role.ts`

---

## 3. Camada de API Backend

### Estrutura Criada
- **Arquivo:** `server/routes.ts`
- **Rotas implementadas:**
  - `POST /api/posts` - Criar post com validação server-side
  - `POST /api/courses` - Criar curso (apenas admin)
  - `POST /api/courses/:courseId/enroll` - Inscrever em curso com validação
  - `GET /api/health` - Health check

### Middlewares Implementados
- `authenticateRequest` - Valida token JWT do Supabase
- `requireAdmin` - Verifica se usuário é admin

### Regras de Negócio Implementadas no Backend

#### Criação de Posts (`POST /api/posts`)
- ✅ Validação de dados obrigatórios
- ✅ Validação de tamanho de conteúdo (máx 10000 caracteres)
- ✅ Validação de título (máx 200 caracteres)
- ✅ Verificação de inscrição no curso
- 🔄 TODO: Rate limiting
- 🔄 TODO: Auditoria/logging
- 🔄 TODO: Notificações para outros usuários

#### Criação de Cursos (`POST /api/courses`)
- ✅ Validação de permissões (apenas admin)
- ✅ Validação de dados obrigatórios
- 🔄 TODO: Criação automática de módulo inicial
- 🔄 TODO: Notificações para comunidade

#### Inscrição em Curso (`POST /api/courses/:courseId/enroll`)
- ✅ Verificação se curso existe
- ✅ Verificação se curso está bloqueado
- ✅ Verificação se usuário já está inscrito
- 🔄 TODO: Validação de convites
- 🔄 TODO: Processamento de pagamento (cursos premium)

---

## 4. Componentização e Boas Práticas

### Status Atual

#### ✅ Componentização
- Componentes organizados por domínio (`social/`, `admin/`, `post-composer/`)
- Componentes base reutilizáveis em `ui/`
- Hooks customizados bem organizados
- Contextos para estado compartilhado

#### ✅ Separação de Responsabilidades
- **Serviços:** Acesso a dados e lógica de negócio básica
- **Hooks:** Gerenciamento de estado e cache (React Query)
- **Componentes:** Apresentação e interação do usuário
- **Backend:** Validações críticas e regras de negócio complexas

#### ⚠️ Áreas de Melhoria
1. **Migração gradual:** Muitos hooks ainda precisam usar serviços
2. **Testes:** Adicionar testes unitários para serviços
3. **Documentação:** Documentar APIs do backend
4. **Validação:** Adicionar validação com Zod nos serviços

---

## 5. Próximos Passos Recomendados

### Curto Prazo
1. **Migrar hooks restantes para serviços**
   - Priorizar hooks mais críticos (admin, billing)
   - Criar serviços correspondentes

2. **Adicionar validação com Zod**
   - Validar inputs nos serviços
   - Validar requests no backend

3. **Implementar rate limiting**
   - Limitar criação de posts por hora
   - Limitar comentários por minuto

### Médio Prazo
1. **Migrar regras de negócio críticas para backend**
   - Validação de pagamentos
   - Processamento de convites
   - Auditoria de ações

2. **Adicionar testes**
   - Testes unitários para serviços
   - Testes de integração para rotas de API

3. **Melhorar tratamento de erros**
   - Erros padronizados
   - Logging estruturado

### Longo Prazo
1. **Considerar Edge Functions do Supabase**
   - Para operações que precisam de service role
   - Para processamento pesado

2. **Implementar cache inteligente**
   - Cache de queries frequentes
   - Invalidação otimizada

3. **Monitoramento e observabilidade**
   - Métricas de performance
   - Alertas para erros críticos

---

## 6. Notas de Migração

### Para Desenvolvedores

#### Usando Serviços em Novos Hooks
```typescript
import * as postsService from '@/services/posts';

export function useMyNewHook() {
  return useQuery({
    queryKey: ['my-query'],
    queryFn: () => postsService.getAllPosts(),
  });
}
```

#### Criando Novos Serviços
1. Criar arquivo em `client/src/services/[nome].ts`
2. Exportar funções assíncronas que retornam dados
3. Usar cliente Supabase importado de `@/lib/supabase`
4. Exportar no `services/index.ts`

#### Usando API Backend
```typescript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ courseId, title, content }),
});
```

---

## 7. Checklist de Validação

### Arquitetura
- [x] Fallbacks removidos do Supabase client
- [x] Camada de serviços criada
- [x] Hooks principais migrados para serviços
- [x] Esqueleto de API backend criado
- [ ] Todos os hooks migrados para serviços
- [ ] Testes adicionados

### Segurança
- [x] Credenciais não hardcoded
- [x] Validação de autenticação no backend
- [x] Validação de permissões no backend
- [ ] Rate limiting implementado
- [ ] Auditoria de ações críticas

### Boas Práticas
- [x] Separação de responsabilidades
- [x] Componentização adequada
- [x] Código reutilizável
- [ ] Documentação completa
- [ ] Tratamento de erros padronizado

---

## Conclusão

As melhorias implementadas estabelecem uma base sólida para o crescimento da aplicação. A arquitetura agora está mais organizada, segura e preparada para escalar. Os próximos passos devem focar em migração gradual dos hooks restantes e implementação de validações adicionais no backend.

