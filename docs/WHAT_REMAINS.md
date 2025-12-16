# O Que Ainda Falta - Refatoração V2

**Data:** Dezembro 2024

---

## 🔴 Crítico (Precisa ser feito)

### 1. Aplicar Migration do Banco de Dados
**Status:** ⚠️ **NÃO APLICADO**

```sql
-- Executar no Supabase SQL Editor:
-- Arquivo: supabase/migrations/001_v2_schema.sql
```

**O que faz:**
- Remove role 'instructor'
- Adiciona campo `video_embed_url` em courses e lessons
- Atualiza constraints e índices
- Atualiza RLS policies

**Como aplicar:**
1. Acesse Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de `supabase/migrations/001_v2_schema.sql`
4. Execute

---

## 🟡 Importante (Recomendado)

### 2. Refatorar AdminLayout
**Arquivo:** `client/src/components/admin-layout.tsx`

**Problema:** Ainda usa classes dark mode (`bg-background`, `text-foreground`, etc)

**O que fazer:**
- Converter para light mode
- Usar cores específicas (gray-900, gray-600, etc)
- Seguir o mesmo padrão do `layout-v2.tsx`

### 3. Refatorar AdminCourseDetail
**Arquivo:** `client/src/pages/admin/course-detail.tsx`

**Status:** ⏳ Não refatorado

**O que fazer:**
- Simplificar interface
- Usar light mode
- Garantir suporte a `video_embed_url` em lessons

### 4. Refatorar AdminMedia
**Arquivo:** `client/src/pages/admin/media.tsx`

**Status:** ⏳ Não refatorado

**Nota:** Esta página pode ser removida ou simplificada, já que agora usamos YouTube/Vimeo embeds

### 5. Refatorar ForgotPassword
**Arquivo:** `client/src/pages/forgot-password.tsx`

**Status:** ⏳ Não refatorado

**O que fazer:**
- Converter para light mode
- Seguir padrão do `login-v2.tsx`

---

## 🟢 Opcional (Limpeza)

### 6. Remover Arquivos Antigos Não Utilizados

**Páginas antigas (podem ser removidas):**
- `client/src/pages/home.tsx` (substituído por `dashboard.tsx`)
- `client/src/pages/courses.tsx` (substituído por `courses-v2.tsx`)
- `client/src/pages/course-view.tsx` (substituído por `course-view-v2.tsx`)
- `client/src/pages/login.tsx` (substituído por `login-v2.tsx`)
- `client/src/pages/register.tsx` (substituído por `register-v2.tsx`)
- `client/src/pages/premium.tsx` (não usado no MVP V2)
- `client/src/pages/instructor-dashboard.tsx` (não usado, instructor removido)
- `client/src/pages/admin/dashboard.tsx` (substituído por `dashboard-v2.tsx`)
- `client/src/pages/admin/courses.tsx` (substituído por `courses-v2.tsx`)

**Componentes antigos:**
- `client/src/components/layout.tsx` (substituído por `layout-v2.tsx`)
- `client/src/components/chat-dropdown.tsx` (não usado no MVP V2)
- `client/src/components/notification-dropdown.tsx` (não usado no MVP V2)
- `client/src/components/post-modal.tsx` (pode ser removido se não usado)

### 7. Renomear Arquivos V2

Após testes, renomear arquivos `-v2.tsx` para remover o sufixo:
- `courses-v2.tsx` → `courses.tsx`
- `login-v2.tsx` → `login.tsx`
- etc.

### 8. Remover ThemeProvider

**Arquivo:** `client/src/components/theme-provider.tsx`

**Status:** Já removido do App.tsx, mas arquivo ainda existe

**Ação:** Pode ser removido se não for usado em outros lugares

---

## 📋 Checklist de Testes

Após aplicar migration e refatorações:

- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard carrega corretamente
- [ ] Listagem de cursos funciona
- [ ] Visualização de curso funciona (com vídeo embed)
- [ ] Inscrição em curso funciona
- [ ] Marcar aula como concluída funciona
- [ ] Dashboard admin carrega
- [ ] Criar curso funciona
- [ ] Editar curso funciona
- [ ] Deletar curso funciona
- [ ] Criar módulo funciona
- [ ] Criar aula funciona
- [ ] Comunidade/Fórum funciona
- [ ] Criar post funciona
- [ ] Sidebar navegação funciona
- [ ] Topbar busca funciona

---

## 🎯 Prioridades

### Alta Prioridade
1. ✅ Aplicar migration do banco
2. ✅ Refatorar AdminLayout (light mode)
3. ✅ Refatorar AdminCourseDetail

### Média Prioridade
4. ✅ Refatorar ForgotPassword
5. ✅ Refatorar AdminMedia (ou remover)

### Baixa Prioridade
6. ✅ Remover arquivos antigos
7. ✅ Renomear arquivos V2
8. ✅ Limpar imports não utilizados

---

## 📊 Progresso Atual

| Item | Status | Prioridade |
|------|--------|------------|
| Migration DB | ⚠️ Não aplicada | 🔴 Crítica |
| AdminLayout | ⏳ Não refatorado | 🟡 Importante |
| AdminCourseDetail | ⏳ Não refatorado | 🟡 Importante |
| AdminMedia | ⏳ Não refatorado | 🟡 Importante |
| ForgotPassword | ⏳ Não refatorado | 🟡 Importante |
| Limpeza arquivos | ⏳ Pendente | 🟢 Opcional |

**Progresso Total: 85%**

---

**Última atualização:** Dezembro 2024

