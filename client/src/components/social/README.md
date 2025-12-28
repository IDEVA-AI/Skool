# Sistema Social - Posts e Comentários

Sistema completo de interação social com posts, comentários encadeados e reações.

## 📦 Componentes

### Feed
Container principal que renderiza a lista de posts com composer.

```tsx
import { Feed, SocialProvider } from '@/components/social';

<SocialProvider>
  <Feed
    posts={posts}
    onPostCreate={handleCreate}
    onPostClick={handlePostClick}
  />
</SocialProvider>
```

### PostComponent
Card de post para o feed. Memoizado para performance.

### PostDetailModal
Modal com detalhes do post e comentários. Carrega comentários sob demanda.

### PostContent
Renderiza conteúdo HTML do post (TipTap output). Suporta truncate para previews.

### CommentComposer
Compositor de comentários com suporte a @mentions e respostas.

### CommentItem
Comentário individual com reações, edição inline e respostas.

### ReactionBar
Barra de reações unificada com popover (versão normal e compacta).

## 🎯 Context API

```tsx
import { SocialProvider, useSocialContext } from '@/components/social';

// No App ou Layout
<SocialProvider>
  <App />
</SocialProvider>

// Em qualquer componente
const { currentUser, permissions } = useSocialContext();
```

**Benefícios:**
- Elimina props drilling de `currentUserId`, `currentUserName`, etc.
- Centraliza lógica de permissões
- Compatível com componentes que não usam o provider (fallback para props)

## 🔄 Reações

A `ReactionBar` unifica as reações em um único componente:

```tsx
// Versão normal (posts) - mostra emojis populares
<ReactionBar
  reactions={reactions}
  userReaction={userReaction}
  onReact={handleReact}
/>

// Versão compacta (comentários) - pill pequena
<ReactionBar compact />
```

**Comportamento:**
- Hover/click expande popover com todas as reações
- Mostra ícones das reações mais populares
- Contador total visível

## 🧵 Comentários Encadeados

```
Post
└── CommentList
    └── CommentItem (com ReactionBar compact)
        └── CommentList (recursivo)
            └── ...
```

**Otimizações:**
- `React.memo` em CommentList e CommentItem
- Lazy loading de comentários no modal
- Delete inline sem modal bloqueante
- Menu de ações visível apenas no hover

## 📱 Performance

1. **Memoização**: Componentes principais são memoizados
2. **Lazy Comments**: Comentários carregam apenas quando modal abre
3. **Truncate**: Posts no feed mostram preview truncado
4. **SocialContext**: Evita prop drilling e re-renders

## 📂 Estrutura

```
social/
├── index.ts              # Exports
├── social-context.tsx    # Provider e hooks
├── feed.tsx              # Container do feed
├── post.tsx              # Card de post
├── post-detail-modal.tsx # Modal de detalhes
├── post-content.tsx      # Conteúdo HTML
├── post-header.tsx       # Avatar + nome + data
├── post-actions.tsx      # Reações + comentários + share
├── post-actions-menu.tsx # Menu dropdown (edit/delete)
├── post-edit-dialog.tsx  # Dialog de edição
├── post-composer-simple.tsx # Compositor de post
├── comment-composer.tsx  # Compositor de comentário
├── comment-list.tsx      # Lista recursiva
├── comment-item.tsx      # Item de comentário
├── reaction-bar.tsx      # Barra de reações unificada
├── reaction-button.tsx   # Botão individual (legacy)
└── activity-indicator.tsx # Indicador de atividade
```
