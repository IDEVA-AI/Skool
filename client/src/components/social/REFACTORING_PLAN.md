# Plano de Refatoração: Sistema de Posts e Comentários

## 🎯 Objetivo

Criar uma versão enxuta, performática e com excelente experiência do usuário, seguindo princípios de design modernos (Skool, Discord, LinkedIn).

---

## 📊 Análise Atual

### Componentes Existentes (16 arquivos)

| Componente | Linhas | Complexidade | Dependências |
|------------|--------|--------------|--------------|
| `post.tsx` | 122 | Média | 8 imports |
| `post-actions.tsx` | 204 | Alta | 9 imports, hooks pesados |
| `post-header.tsx` | 65 | Baixa | 5 imports |
| `post-content.tsx` | 180 | Alta | 4 imports, lógica complexa |
| `post-detail-modal.tsx` | 280 | Alta | 12 imports |
| `post-composer-simple.tsx` | ~200 | Alta | 10+ imports |
| `post-edit-dialog.tsx` | ~150 | Média | 8 imports |
| `post-actions-menu.tsx` | ~100 | Média | 6 imports |
| `comment-item.tsx` | 381 | Alta | 15 imports! |
| `comment-composer.tsx` | 166 | Média | 5 imports |
| `comment-list.tsx` | 55 | Baixa | 2 imports |
| `reaction-button.tsx` | 78 | Baixa | 4 imports |
| `feed.tsx` | 157 | Média | 8 imports |
| `activity-indicator.tsx` | ~50 | Baixa | 3 imports |

### Problemas Identificados

1. **Over-engineering**: `CommentItem` tem 381 linhas para um único comentário
2. **Reações fragmentadas**: 3 botões de reação separados ocupam espaço excessivo
3. **Duplicação**: Lógica de permissões repetida em múltiplos componentes
4. **Props drilling**: `currentUserId`, `currentUserName` passados por 4+ níveis
5. **Inconsistência visual**: Posts e comentários têm estilos diferentes para mesmas ações
6. **Performance**: Múltiplos `useEffect` para sincronização de estado
7. **Modal pesado**: `PostDetailModal` reimplementa lógica que já existe no `Post`

---

## 🏗️ Arquitetura Proposta

### Nova Estrutura (9 arquivos)

```
social/
├── index.ts                    # Exports
├── types.ts                    # Tipos locais (se necessário)
├── hooks/
│   └── use-social-context.tsx  # Context para dados do usuário
├── components/
│   ├── feed.tsx                # Feed principal
│   ├── post-card.tsx           # Card de post (lista)
│   ├── post-detail.tsx         # Modal de detalhes
│   ├── post-composer.tsx       # Compositor de post
│   ├── comment.tsx             # Comentário unificado
│   └── reaction-bar.tsx        # Barra de reações unificada
└── README.md
```

### Redução de ~1600 linhas → ~800 linhas (50% menos)

---

## 📋 Mudanças Detalhadas

### 1. Contexto Social (Eliminar Props Drilling)

**Criar:** `use-social-context.tsx`

```tsx
interface SocialContextValue {
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  permissions: {
    canCreate: boolean;
    canModerate: boolean;
  };
  // Callbacks centralizados
  onReact: (targetType: 'post' | 'comment', targetId: string, reaction: ReactionType) => void;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onShare: (postId: string) => void;
}
```

**Benefício:** Remove `currentUserId`, `currentUserName`, `currentUserAvatar` de todas as props.

---

### 2. Unificar Reações em Barra Compacta

**Substituir:** `ReactionButton` (3 instâncias separadas)

**Por:** `ReactionBar` (componente único)

```tsx
<ReactionBar
  reactions={reactions}
  userReaction={userReaction}
  onReact={handleReact}
  compact={true} // Para comentários
/>
```

**Design:**
- Mostrar apenas ícone principal (👍) + contador total
- Hover/click expande para mostrar todas as opções
- Estilo "pill" compacto: `[👍 12]`
- Popover com todas as reações ao clicar

**Inspiração:** LinkedIn reactions, Discord reactions

---

### 3. Simplificar CommentItem

**Atual:** 381 linhas com 15 imports

**Proposto:** ~150 linhas

**Mudanças:**

1. **Remover estados locais desnecessários:**
   - `showReplies` → Sempre mostrar (colapsado via CSS se muitos)
   - `isEditing` → Usar modal inline simples

2. **Extrair lógica de permissões:**
   ```tsx
   const { canEdit, canDelete } = useCommentPermissions(comment);
   ```

3. **Simplificar edição:**
   - Edição inline com `contentEditable` ao invés de `Textarea`
   - Ou modal pequeno

4. **Remover dialog de confirmação:**
   - Usar toast com undo ao invés de dialog bloqueante

---

### 4. Unificar Post e PostDetailModal

**Problema:** `PostDetailModal` reimplementa muito do `Post`

**Solução:** Usar o mesmo componente com prop `variant`

```tsx
<PostCard
  post={post}
  variant="card" // Na lista
  onClick={openDetail}
/>

<PostCard
  post={post}
  variant="detail" // No modal
  showComments={true}
/>
```

---

### 5. Simplificar PostContent

**Atual:** Suporta blocks (text, image, video, link) com 180 linhas

**Análise:** O sistema de blocks não está sendo usado na prática

**Decisão:**
- **Opção A (Recomendada):** Manter apenas `content` HTML (TipTap output)
- **Opção B:** Simplificar para apenas text + images

**Mudança:**
```tsx
// Antes
{post.blocks?.map(block => <BlockRenderer block={block} />)}

// Depois
<div 
  className="prose prose-sm dark:prose-invert"
  dangerouslySetInnerHTML={{ __html: post.content }}
/>
```

---

### 6. Otimizar Feed Performance

**Mudanças:**

1. **Virtualização:** Usar `react-window` ou `@tanstack/react-virtual` para feeds grandes

2. **Lazy loading de comentários:**
   ```tsx
   const { comments, loadMore, hasMore } = useComments(postId, {
     enabled: isExpanded // Só carrega quando expande
   });
   ```

3. **Memoização agressiva:**
   ```tsx
   const MemoizedPost = React.memo(PostCard, (prev, next) => {
     return prev.post.id === next.post.id && 
            prev.post.reactions.length === next.post.reactions.length;
   });
   ```

---

### 7. Melhorar UX de Comentários

**Problemas atuais:**
- Caixa de comentário muito complexa (icons, botões)
- Resposta precisa scroll para caixa principal

**Soluções:**

1. **Comentário simplificado:**
   ```
   [Avatar] [Input: "Escreva um comentário..."] [Enviar]
   ```
   - Sem ícones de link/emoji/GIF na versão básica
   - Mostrar toolbar apenas quando focado

2. **Resposta inline:**
   - Ao clicar "Responder", mostrar input pequeno logo abaixo
   - `@mention` automático e visível
   - Enviar com Enter, cancelar com Esc

3. **Threading visual melhorado:**
   - Linha conectora visual entre respostas
   - Colapsar automaticamente após 3 níveis
   - Mostrar "Ver mais X respostas"

---

### 8. Melhorar Estados de Loading

**Atual:** Skeletons genéricos

**Proposto:**

1. **Skeleton que preserva layout:**
   ```tsx
   <PostCardSkeleton variant="card" />
   <PostCardSkeleton variant="detail" />
   ```

2. **Optimistic updates:**
   - Reações: Atualizar UI imediatamente
   - Comentários: Mostrar com fade enquanto envia
   - Erros: Reverter com toast

---

### 9. Acessibilidade

**Adicionar:**

1. **Navegação por teclado:**
   - `Tab` entre posts
   - `Enter` para abrir detalhes
   - `Esc` para fechar modal
   - `Arrow keys` para navegar comentários

2. **Screen readers:**
   - `aria-label` em ações
   - `role="article"` em posts
   - `aria-expanded` em comentários

3. **Focus management:**
   - Trap focus em modals
   - Restaurar foco ao fechar

---

## 📅 Fases de Implementação

### Fase 1: Contexto e Reações (1-2 dias)
- [ ] Criar `SocialContext` e provider
- [ ] Criar `ReactionBar` unificado
- [ ] Migrar `PostActions` para usar novo componente
- [ ] Testes

### Fase 2: Comentários (2-3 dias)
- [ ] Simplificar `CommentItem`
- [ ] Melhorar threading visual
- [ ] Implementar resposta inline
- [ ] Optimistic updates
- [ ] Testes

### Fase 3: Posts (2-3 dias)
- [ ] Unificar `Post` e `PostDetailModal`
- [ ] Simplificar `PostContent`
- [ ] Melhorar composer
- [ ] Testes

### Fase 4: Performance (1-2 dias)
- [ ] Virtualização do feed
- [ ] Lazy loading de comentários
- [ ] Memoização
- [ ] Lighthouse audit

### Fase 5: Polish (1 dia)
- [ ] Acessibilidade
- [ ] Animações suaves
- [ ] Estados de erro
- [ ] Documentação

---

## 🎨 Design System Recomendado

### Espaçamentos
- Entre posts: `space-y-4` (16px)
- Padding interno: `p-4` mobile, `p-6` desktop
- Gap entre elementos: `gap-3` (12px)

### Cores
- Background post: `bg-card`
- Border: `border-border/50`
- Hover: `hover:border-primary/30`
- Text muted: `text-muted-foreground`

### Tipografia
- Título post: `text-lg font-bold`
- Autor: `text-sm font-semibold`
- Conteúdo: `text-sm leading-relaxed`
- Timestamp: `text-xs text-muted-foreground`

### Animações
- Hover: `transition-all duration-200`
- Modal: `animate-in fade-in-0 zoom-in-95`
- Reações: `transition-transform scale-110` (active)

---

## 📊 Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Linhas de código | ~1600 | <900 |
| Arquivos | 16 | 9 |
| Bundle size (social) | ~45KB | <25KB |
| First paint (feed) | ~300ms | <150ms |
| Lighthouse Accessibility | 85 | 95+ |

---

## ⚠️ Riscos e Mitigações

1. **Breaking changes:** Manter exports compatíveis em `index.ts`
2. **Perda de funcionalidade:** Criar feature flags para rollback
3. **Performance regression:** Benchmark antes/depois
4. **Bugs em produção:** Testes E2E para fluxos críticos

---

## 🔜 Próximos Passos

1. Revisar este plano com stakeholders
2. Priorizar fases baseado em impacto/esforço
3. Criar branch `refactor/social-v2`
4. Implementar em sprints de 1 semana
5. Review incremental de cada fase

