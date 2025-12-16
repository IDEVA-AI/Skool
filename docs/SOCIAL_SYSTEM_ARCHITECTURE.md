# Sistema Social - Arquitetura e Fluxo de Estado

## 📁 Estrutura de Arquivos

```
client/src/
├── types/
│   └── social.ts                    # Type definitions
├── hooks/
│   └── use-reactions.ts            # Hook reutilizável para reações
├── components/
│   └── social/
│       ├── index.ts                # Exports
│       ├── post.tsx                # Componente principal do post
│       ├── post-actions.tsx        # Barra de ações do post
│       ├── comment-composer.tsx    # Compositor de comentários
│       ├── comment-list.tsx        # Lista recursiva de comentários
│       ├── comment-item.tsx        # Item individual de comentário
│       └── reaction-button.tsx      # Botão de reação
└── components/
    └── post-composer-blocks/
        ├── index.ts
        ├── post-composer-blocks.tsx # Compositor principal
        ├── media-toolbar.tsx        # Barra de ferramentas
        ├── media-preview-list.tsx   # Lista de previews
        ├── media-block.tsx          # Renderizador de blocos
        └── content-editor.tsx       # Editor de conteúdo
```

## 🔄 Fluxo de Estado

### Sistema de Posts e Comentários

#### 1. Estado de Reações (`useReactions`)

```typescript
// Hook centralizado para gerenciar reações
const { reactions, reactionCounts, userReaction, toggleReaction } = useReactions({
  initialReactions: post.reactions,
  currentUserId: 'user-123',
  currentUserName: 'João',
});
```

**Fluxo:**
1. Hook recebe reações iniciais
2. Calcula contagens por tipo (like, love, laugh)
3. Identifica reação do usuário atual
4. `toggleReaction` adiciona/remove/substitui reação

**Otimizações:**
- Usa `useCallback` para evitar re-criação de funções
- Estado local otimizado para performance

#### 2. Comentários Encadeados (Recursão)

```typescript
// Estrutura de dados
interface Comment {
  id: string;
  content: string;
  parentId?: string;  // Para comentários encadeados
  replies?: Comment[]; // Respostas aninhadas
}
```

**Fluxo de Recursão:**

```
Post
└── CommentList (depth: 0)
    ├── CommentItem (comment-1)
    │   └── CommentList (depth: 1)
    │       ├── CommentItem (reply-1)
    │       └── CommentItem (reply-2)
    │           └── CommentList (depth: 2)
    │               └── CommentItem (reply-2-1)
    └── CommentItem (comment-2)
```

**Implementação Recursiva:**

```tsx
// CommentList renderiza CommentItem
// CommentItem renderiza CommentList para replies
// Processo se repete até maxDepth
```

**Otimizações:**
- `React.memo` em `CommentList` para evitar re-renders desnecessários
- Indentação visual progressiva (`ml-8` por nível)
- Limite de profundidade (`maxDepth`) para performance

#### 3. Estado de Comentários

```typescript
// Estado gerenciado no componente Post
const [showComments, setShowComments] = useState(false);
const [showComposer, setShowComposer] = useState(false);

// Callbacks para adicionar comentários
const handleCommentSubmit = async (content: string, parentId?: string) => {
  await onCommentAdd?.(post.id, content, parentId);
  // Atualiza estado local ou chama API
};
```

**Fluxo de Adição:**
1. Usuário clica em "Comentar"
2. `showComposer` = true
3. Usuário escreve e submete
4. `onCommentAdd` é chamado
5. Estado atualizado (local ou via API)
6. Comentário aparece na lista

## 🎨 Estratégia de Renderização de Blocos

### PostComposerBlocks

#### Estrutura de Dados

```typescript
type PostContent = PostBlock[];

interface PostBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'link';
  content: string;
  metadata?: {
    url?: string;
    alt?: string;
    thumbnail?: string;
  };
}
```

#### Fluxo de Renderização

```
PostComposerBlocks
├── MediaToolbar (adiciona blocos)
├── Loop sobre blocks[]
│   ├── Se type === 'text'
│   │   └── ContentEditor (TipTap ou Textarea)
│   └── Se type !== 'text'
│       └── MediaBlock (renderiza preview)
└── MediaPreviewList (estado vazio)
```

#### Estratégia de Blocos

1. **Adição de Bloco:**
   - Usuário clica em ícone na toolbar
   - Novo bloco adicionado ao array `blocks`
   - Bloco renderizado baseado no tipo

2. **Edição de Bloco:**
   - Texto: Editor inline (TipTap)
   - Mídia: Preview com botão de remover

3. **Remoção de Bloco:**
   - Botão X aparece no hover
   - Remove do array `blocks`
   - Re-renderiza lista

4. **Publicação:**
   - Valida que há conteúdo válido
   - Envia array completo de blocos
   - Reset após publicação

## 🚀 Integração com API

### Preparação para API

#### Posts e Comentários

```typescript
// Substituir callbacks locais por chamadas API
const handleCommentAdd = async (postId: string, content: string, parentId?: string) => {
  const response = await fetch('/api/posts/comments', {
    method: 'POST',
    body: JSON.stringify({ postId, content, parentId }),
  });
  const newComment = await response.json();
  // Atualizar estado ou invalidar query
};

const handleReactionChange = async (postId: string, reactions: Reaction[]) => {
  await fetch(`/api/posts/${postId}/reactions`, {
    method: 'PUT',
    body: JSON.stringify({ reactions }),
  });
};
```

#### PostComposerBlocks

```typescript
const handlePublish = async (blocks: PostContent) => {
  // Transformar blocos para formato da API
  const payload = {
    title: extractTitle(blocks),
    content: serializeBlocks(blocks),
    blocks: blocks.map(block => ({
      type: block.type,
      content: block.content,
      metadata: block.metadata,
    })),
  };

  await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
```

## 📊 Otimizações Implementadas

### 1. Re-renders Otimizados

- **CommentList memoizado:** Só re-renderiza quando `comments` array muda
- **useCallback:** Funções estáveis para evitar re-renders filhos
- **Separação de estado:** Estado local vs estado compartilhado

### 2. Performance de Árvores Grandes

- **Lazy loading:** Comentários carregados sob demanda
- **Virtualização:** Preparado para `react-window` se necessário
- **Limite de profundidade:** `maxDepth` previne árvores infinitas

### 3. Validação Eficiente

- **Validação de HTML:** Remove tags vazias antes de validar
- **Validação de blocos:** Verifica conteúdo real, não apenas estrutura

## 🎯 Decisões de Arquitetura

### 1. Hook `useReactions`

**Por quê?**
- Lógica de reações reutilizável
- Fácil de testar isoladamente
- Consistente entre posts e comentários

### 2. Recursão em Comentários

**Por quê?**
- Suporta profundidade infinita
- Código mais limpo e manutenível
- Indentação visual natural

### 3. Modelo de Blocos

**Por quê?**
- Extensível para novos tipos
- Estrutura de dados clara
- Fácil serialização para API
- Suporta ordem customizada

### 4. Separação de Componentes

**Por quê?**
- Reutilização individual
- Testes mais fáceis
- Manutenção simplificada
- Responsabilidades claras

## 📝 Exemplo de Uso Completo

```tsx
import { Post } from '@/components/social';
import { PostComposerBlocks } from '@/components/post-composer-blocks';

function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  const handlePublish = async (blocks: PostContent) => {
    const newPost = await createPost({ blocks });
    setPosts([newPost, ...posts]);
  };

  const handleCommentAdd = async (postId: string, content: string, parentId?: string) => {
    const comment = await addComment({ postId, content, parentId });
    // Atualizar post específico
  };

  return (
    <div>
      <PostComposerBlocks
        name="João"
        onPublish={handlePublish}
      />
      
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          currentUserId="user-123"
          currentUserName="João"
          onCommentAdd={handleCommentAdd}
        />
      ))}
    </div>
  );
}
```

## 🔮 Extensibilidade Futura

### Novos Tipos de Bloco

```typescript
// Adicionar novo tipo
type BlockType = 'text' | 'image' | 'video' | 'link' | 'poll' | 'code';

// Adicionar renderer em MediaBlock
case 'poll':
  return <PollBlock block={block} />;
```

### Novos Tipos de Reação

```typescript
// Adicionar em social.ts
type ReactionType = 'like' | 'love' | 'laugh' | 'angry' | 'sad';

// Adicionar ícone em reaction-button.tsx
angry: { icon: Angry, label: 'Raiva', color: 'text-orange-500' }
```

### Colaboração em Tempo Real

```typescript
// Preparado para WebSockets
useEffect(() => {
  socket.on('comment-added', (comment) => {
    // Adicionar comentário em tempo real
  });
}, []);
```

