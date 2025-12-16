# Sistema Social - Posts e Comentários

Sistema completo de interação social com posts, comentários encadeados e reações.

## 📦 Componentes

### Post
Componente principal que exibe um post com todas as interações.

```tsx
import { Post } from '@/components/social';

<Post
  post={postData}
  currentUserId="user-123"
  currentUserName="João Silva"
  onCommentAdd={handleCommentAdd}
  onReactionChange={handleReactionChange}
/>
```

### PostActions
Barra de ações do post (reações, comentários, compartilhar).

### CommentComposer
Compositor de comentários com suporte a respostas.

### CommentList
Lista recursiva de comentários (suporta profundidade infinita).

### CommentItem
Item individual de comentário com respostas aninhadas.

### ReactionButton
Botão de reação reutilizável (like, love, laugh).

## 🔄 Fluxo de Estado

### Reações

```typescript
// Hook centralizado
const { reactionCounts, userReaction, toggleReaction } = useReactions({
  initialReactions: post.reactions,
  currentUserId: 'user-123',
  currentUserName: 'João',
});
```

### Comentários Encadeados

```typescript
// Estrutura recursiva
Comment {
  id: string;
  content: string;
  parentId?: string;  // Para respostas
  replies?: Comment[]; // Respostas aninhadas
}
```

## 🎯 Recursão

O sistema usa recursão para renderizar comentários encadeados:

```
Post
└── CommentList
    └── CommentItem
        └── CommentList (recursivo)
            └── CommentItem
                └── ...
```

**Otimizações:**
- `React.memo` em CommentList
- Indentação visual progressiva
- Limite de profundidade configurável

## 📱 Mobile-First

- Layout responsivo
- Botões acessíveis
- Hierarquia visual clara
- Estados hover/active sutis

## 🔌 Integração com API

```typescript
// Substituir callbacks por chamadas API
const handleCommentAdd = async (postId: string, content: string, parentId?: string) => {
  const response = await fetch('/api/posts/comments', {
    method: 'POST',
    body: JSON.stringify({ postId, content, parentId }),
  });
  // Atualizar estado
};
```

