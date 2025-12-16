# Progresso da Refatoração V2

**Data:** Dezembro 2024  
**Status:** Em andamento

---

## ✅ Concluído

1. **Schema do Banco de Dados**
   - ✅ Migration criada (`supabase/migrations/001_v2_schema.sql`)
   - ✅ Removida role 'instructor'
   - ✅ Adicionado campo `video_embed_url` em courses e lessons
   - ✅ Índices criados

2. **Componentes Base**
   - ✅ `components/sidebar.tsx` - Sidebar simplificada (light mode)
   - ✅ `components/topbar.tsx` - Topbar com busca
   - ✅ `components/layout-v2.tsx` - Layout novo
   - ✅ `components/video-player.tsx` - Player para YouTube/Vimeo

3. **Hooks**
   - ✅ `hooks/use-user-role.ts` - Removido `useIsInstructor`, simplificado

4. **Páginas do Aluno**
   - ✅ `pages/dashboard.tsx` - Dashboard simplificado
   - ✅ `pages/courses-v2.tsx` - Listagem de cursos simplificada

5. **Rotas**
   - ✅ `App.tsx` atualizado para usar novo layout
   - ✅ Removidas rotas não necessárias (premium, instructor)
   - ✅ Removido ThemeProvider (light mode fixo)

---

## ✅ Concluído (Continuado)

6. **Páginas Admin**
   - ✅ Dashboard admin simplificado (`dashboard-v2.tsx`)
   - ✅ Gestão de cursos (`courses-v2.tsx`)

7. **Autenticação**
   - ✅ Login simplificado (`login-v2.tsx`)
   - ✅ Registro simplificado (`register-v2.tsx`)

8. **Fórum/Comunidade**
   - ✅ Lista de posts simplificada (`community-v2.tsx`)
   - ✅ Criação de posts via dialog

9. **Visualização de Curso**
   - ✅ Refatorado (`course-view-v2.tsx`) com novo layout
   - ✅ Player de vídeo YouTube/Vimeo integrado

---

## 📋 Próximos Passos

1. ✅ Substituir `layout.tsx` por `layout-v2.tsx` - FEITO
2. ✅ Criar página de dashboard simplificada - FEITO
3. ✅ Refatorar páginas de cursos - FEITO
4. ✅ Refatorar páginas admin - FEITO
5. ✅ Atualizar `App.tsx` com novas rotas - FEITO
6. ✅ Refatorar visualização de curso - FEITO
7. ✅ Simplificar autenticação - FEITO
8. ✅ Refatorar fórum/comunidade - FEITO
9. ⏳ Aplicar migration do banco de dados
10. ⏳ Testar todas as funcionalidades
11. ⏳ Remover componentes antigos não utilizados
12. ⏳ Ajustes finais de estilo (light mode)

---

## 🔄 Migração

### Para usar o novo layout:

```typescript
// Em App.tsx, substituir:
import Layout from "@/components/layout";

// Por:
import Layout from "@/components/layout-v2";
```

### Para aplicar migration do banco:

```sql
-- Executar no Supabase SQL Editor:
\i supabase/migrations/001_v2_schema.sql
```

---

## 📝 Notas

- O novo layout usa light mode por padrão
- Sidebar fixa de 240px (w-60)
- Design limpo estilo Stripe/Vercel
- Removidas features complexas (chat, notificações avançadas)

---

**Última atualização:** Dezembro 2024

