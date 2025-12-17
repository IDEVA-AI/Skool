# 🚀 Plano de Implementação - S-K-O-O-L

> **Ambiente:** Vercel + GitHub (CI/CD automático)
> **Estratégia:** Feature branches → Pull Requests → Review → Merge to main → Deploy automático

---

## 📋 Visão Geral das Fases

| Fase | Descrição | Risco | Estimativa | Branch | Status |
|------|-----------|-------|------------|--------|--------|
| 1 | Limpeza Crítica | 🟢 Baixo | 1-2h | `fix/cleanup-debug-code` | ✅ Concluída |
| 2 | Quick Wins UI/UX | 🟢 Baixo | 2-3h | `fix/ui-consistency` | ✅ Concluída |
| 3 | Funcionalidades Core | 🟡 Médio | 8-12h | `feat/search-and-filters` | ✅ Concluída |
| 4 | Acessibilidade | 🟢 Baixo | 3-4h | `fix/accessibility` | ⏳ Pendente |
| 5 | Features Avançadas | 🟡 Médio | 16-24h | `feat/media-upload` | ⏳ Pendente |

---

## 🔴 FASE 1: Limpeza Crítica (URGENTE)

**Branch:** `fix/cleanup-debug-code`
**Risco:** 🟢 Baixo (sem impacto visual)
**Estimativa:** 1-2 horas

### Tarefas:

#### 1.1 Remover código de debug/logging para servidor externo
```
Arquivos afetados:
├── client/src/components/layout.tsx (linha 180)
├── client/src/components/auth-guard.tsx (linhas 11-12, 16-17)
```

**Ação:** Remover todas as chamadas `fetch` para `http://127.0.0.1:7243/ingest/...`

#### 1.2 Remover console.logs de produção
```
Arquivos afetados:
├── client/src/pages/courses.tsx (linhas 22-29)
├── client/src/pages/community-v2.tsx (linhas 92-104)
├── client/src/pages/home.tsx (linhas 163-166)
```

**Ação:** Remover ou condicionar com `import.meta.env.DEV`

#### 1.3 Corrigir isPremium hardcoded
```
Arquivo: client/src/components/layout.tsx (linha 73)
```

**Ação:** Criar hook `useIsPremium()` ou buscar do perfil do usuário

### Checklist Fase 1:
- [ ] Criar branch `fix/cleanup-debug-code`
- [ ] Remover fetch de debug em layout.tsx
- [ ] Remover fetch de debug em auth-guard.tsx
- [ ] Remover/condicionar console.logs
- [ ] Testar localmente
- [ ] Abrir PR
- [ ] Code review
- [ ] Merge → Deploy automático

---

## 🟡 FASE 2: Quick Wins UI/UX

**Branch:** `fix/ui-consistency`
**Risco:** 🟢 Baixo
**Estimativa:** 2-3 horas

### Tarefas:

#### 2.1 Padronizar branding
```
Arquivos afetados:
├── client/src/components/layout.tsx (linha 277) → "Aurius"
├── client/src/components/sidebar.tsx (linha 34) → "S-K-O-O-L"
├── client/index.html (title)
```

**Ação:** Definir nome oficial e padronizar em todos os lugares

#### 2.2 Remover/arquivar sidebar duplicada
```
Arquivo: client/src/components/sidebar.tsx
```

**Ação:** Verificar se está sendo usado. Se não, remover ou mover para `/deprecated`

#### 2.3 Corrigir cores hardcoded
```
Arquivo: client/src/components/sidebar.tsx (se mantido)
```

**Ação:** Substituir `bg-white`, `text-gray-*` por tokens CSS do tema

#### 2.4 Melhorar ícones de comunidade
```
Arquivo: client/src/components/layout.tsx (linhas 105, 149)
```

**Ação:** Usar `logo_url` da comunidade quando disponível

### Checklist Fase 2:
- [ ] Criar branch `fix/ui-consistency`
- [ ] Definir e documentar nome oficial do app
- [ ] Atualizar branding em todos os arquivos
- [ ] Remover sidebar.tsx não utilizado
- [ ] Corrigir cores hardcoded
- [ ] Implementar logo real das comunidades
- [ ] Testar dark/light mode
- [ ] Abrir PR
- [ ] Merge → Deploy

---

## 🟠 FASE 3: Funcionalidades Core

**Branch:** `feat/search-and-filters`
**Risco:** 🟡 Médio
**Estimativa:** 8-12 horas

### Tarefas:

#### 3.1 Implementar busca global
```
Arquivos a criar/modificar:
├── client/src/hooks/use-search.ts (NOVO)
├── client/src/components/layout.tsx (topbar search)
├── client/src/components/search-results.tsx (NOVO)
```

**Funcionalidade:**
- Buscar em: posts, cursos, usuários
- Debounce de 300ms
- Dropdown com resultados agrupados
- Atalho de teclado (Cmd/Ctrl + K)

#### 3.2 Implementar filtros de cursos
```
Arquivos a criar/modificar:
├── client/src/pages/courses.tsx
├── client/src/components/course-filters.tsx (NOVO)
```

**Filtros:**
- Por status (inscrito, gratuito, bloqueado)
- Por progresso (não iniciado, em andamento, concluído)
- Ordenação (mais recente, alfabético, progresso)

#### 3.3 Implementar sistema de reações funcional
```
Arquivos afetados:
├── client/src/pages/community-v2.tsx (linha 351)
├── client/src/hooks/use-reactions.ts (já existe - verificar)
```

**Ação:** Conectar UI ao hook existente de reações

#### 3.4 Implementar compartilhamento
```
Arquivos afetados:
├── client/src/components/social/post-actions.tsx
├── client/src/pages/home.tsx (linha 164)
```

**Funcionalidade:**
- Copiar link do post
- Compartilhar via Web Share API (mobile)
- Toast de confirmação

### Checklist Fase 3:
- [ ] Criar branch `feat/search-and-filters`
- [ ] Implementar hook de busca
- [ ] Criar componente de resultados
- [ ] Integrar busca na topbar
- [ ] Implementar filtros de cursos
- [ ] Conectar reações ao backend
- [ ] Implementar compartilhamento
- [ ] Testes manuais completos
- [ ] Abrir PR
- [ ] Code review
- [ ] Merge → Deploy

---

## 🔵 FASE 4: Acessibilidade e Responsividade

**Branch:** `fix/accessibility`
**Risco:** 🟢 Baixo
**Estimativa:** 3-4 horas

### Tarefas:

#### 4.1 Adicionar aria-labels
```
Arquivos afetados:
├── client/src/components/layout.tsx (botões de ícone)
├── client/src/components/social/post-actions.tsx
├── client/src/pages/courses.tsx (botão de filtro)
```

#### 4.2 Melhorar foco visível
```
Arquivo: client/src/index.css
```

**Ação:** Garantir `focus-visible:ring` em todos elementos interativos

#### 4.3 Adicionar alt text em imagens
```
Arquivos afetados:
├── Todos os componentes com Avatar
├── Cards de curso
```

#### 4.4 Melhorar responsividade mobile
```
Arquivos afetados:
├── client/src/pages/course-view.tsx (sidebar de módulos)
├── client/src/pages/home.tsx (sidebar de widgets)
```

**Ação:**
- Adicionar Sheet/Drawer para módulos em mobile
- Tornar sidebar de widgets colapsável

### Checklist Fase 4:
- [ ] Criar branch `fix/accessibility`
- [ ] Auditar com Lighthouse
- [ ] Adicionar aria-labels
- [ ] Corrigir contraste de cores
- [ ] Adicionar alt texts
- [ ] Implementar navegação por teclado
- [ ] Testar com screen reader
- [ ] Melhorar mobile UX
- [ ] Abrir PR
- [ ] Merge → Deploy

---

## 🟣 FASE 5: Features Avançadas

**Branch:** `feat/media-upload`
**Risco:** 🟡 Médio
**Estimativa:** 16-24 horas (dividir em sub-branches)

### 5A: Upload de arquivos em posts
**Sub-branch:** `feat/post-attachments`

```
Arquivos a criar/modificar:
├── client/src/components/post-composer/attachment-button.tsx (NOVO)
├── client/src/hooks/use-storage-upload.ts (já existe)
├── supabase/storage-policies.sql (verificar)
```

**Funcionalidade:**
- Upload de imagens (jpg, png, gif, webp)
- Upload de PDFs
- Preview antes de publicar
- Limite de 10MB por arquivo

### 5B: Embed de YouTube
**Sub-branch:** `feat/youtube-embed`

```
Arquivos a criar/modificar:
├── client/src/components/post-composer/youtube-embed.tsx (NOVO)
├── client/src/components/social/post-content.tsx
```

**Funcionalidade:**
- Input para URL do YouTube
- Preview do vídeo
- Renderização no post

### 5C: Sistema de enquetes
**Sub-branch:** `feat/polls`

```
Arquivos a criar/modificar:
├── client/src/components/post-composer/poll-creator.tsx (NOVO)
├── client/src/components/social/poll-display.tsx (NOVO)
├── client/src/hooks/use-polls.ts (NOVO)
├── supabase/migrations/014_polls.sql (NOVO)
```

**Funcionalidade:**
- Criar enquete com 2-6 opções
- Votar (1 voto por usuário)
- Ver resultados em tempo real
- Opção de enquete anônima

### Checklist Fase 5:
- [ ] Criar branch `feat/media-upload`
- [ ] Sub-branch para attachments
- [ ] Sub-branch para YouTube
- [ ] Sub-branch para polls
- [ ] Testes de integração
- [ ] Documentação
- [ ] Abrir PRs separados
- [ ] Deploy gradual

---

## 📅 Cronograma Sugerido

```
Semana 1:
├── Segunda: Fase 1 (Limpeza) ✅ Deploy
├── Terça: Fase 2 (UI/UX) ✅ Deploy
├── Quarta-Sexta: Fase 3 (Funcionalidades Core)

Semana 2:
├── Segunda: Fase 3 (continuação) ✅ Deploy
├── Terça-Quarta: Fase 4 (Acessibilidade) ✅ Deploy
├── Quinta-Sexta: Fase 5A (Upload)

Semana 3:
├── Segunda-Terça: Fase 5B (YouTube)
├── Quarta-Sexta: Fase 5C (Polls)
```

---

## 🔧 Configurações Vercel Recomendadas

### Preview Deployments
Cada PR gera um preview automático. Usar para testar antes do merge.

### Environment Variables
Verificar se estão configuradas:
```
VITE_SUPABASE_URL=***
VITE_SUPABASE_ANON_KEY=***
```

### Branch Protection (GitHub)
Configurar em Settings → Branches:
- [x] Require PR before merging
- [x] Require status checks (Vercel build)
- [x] Require conversation resolution

---

## 🧪 Testes Recomendados por Fase

| Fase | Testes |
|------|--------|
| 1 | Verificar console do browser em produção |
| 2 | Visual regression (dark/light mode) |
| 3 | E2E: busca, filtros, reações |
| 4 | Lighthouse audit, screen reader |
| 5 | Upload de diferentes formatos, limites |

---

## 📝 Template de PR

```markdown
## Descrição
[Breve descrição das mudanças]

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Testei localmente
- [ ] Testei no preview da Vercel
- [ ] Não há console.logs de debug
- [ ] Código segue padrões do projeto

## Screenshots (se aplicável)
[Antes/Depois]
```

---

## 🚨 Rollback Plan

Se algo der errado após deploy:

1. **Via Vercel Dashboard:**
   - Deployments → Selecionar deploy anterior → "Promote to Production"

2. **Via Git:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

---

**Documento criado em:** 17/12/2024
**Última atualização:** 17/12/2024
**Autor:** Cascade AI
