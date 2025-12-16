# PostComposer Component

Um componente reutilizável e modular para criação de posts, similar a interfaces de redes sociais.

## Estrutura de Arquivos

```
post-composer/
├── index.ts                 # Exports principais
├── post-composer.tsx        # Componente principal
├── composer-header.tsx      # Cabeçalho com avatar e contexto
├── composer-title.tsx       # Campo de título
├── composer-editor.tsx      # Editor de texto (rich text ou plain)
├── composer-actions.tsx     # Barra de ações com ícones
└── README.md               # Documentação
```

## Arquitetura

### Decisões de Design

1. **Modularidade**: Componente dividido em subcomponentes menores e reutilizáveis
2. **State Lifting**: Estado gerenciado pelo componente principal, mas pode ser controlado externamente
3. **Props-based Configuration**: Máxima flexibilidade através de props
4. **Acessibilidade**: ARIA labels, navegação por teclado, tooltips
5. **Type Safety**: TypeScript com interfaces bem definidas

### Subcomponentes

- **ComposerHeader**: Exibe avatar, nome do usuário e contexto (onde está postando)
- **ComposerTitle**: Campo de entrada para o título do post
- **ComposerEditor**: Área de edição que suporta rich text (TipTap) ou texto simples (Textarea)
- **ComposerActions**: Barra de ações com ícones para mídia, GIF, enquete, etc.

## Uso Básico

```tsx
import { PostComposer } from '@/components/post-composer';

function MyComponent() {
  const handlePublish = async ({ title, content }: { title: string; content: string }) => {
    // Publicar post
    console.log('Publicando:', { title, content });
  };

  return (
    <PostComposer
      name="João Silva"
      avatar="https://example.com/avatar.jpg"
      context="ZONA COMMUNITY"
      onPublish={handlePublish}
    />
  );
}
```

## Uso Avançado

```tsx
import { PostComposer } from '@/components/post-composer';
import { useState } from 'react';

function AdvancedExample() {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async ({ title, content }: { title: string; content: string }) => {
    setIsPublishing(true);
    try {
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAttach = () => {
    // Abrir seletor de arquivo
  };

  return (
    <PostComposer
      name="Maria Santos"
      avatar="/avatar.jpg"
      context="publicando em"
      contextHighlight="ZONA COMMUNITY"
      placeholder="O que você está pensando?"
      useRichText={true}
      onPublish={handlePublish}
      onCancel={() => console.log('Cancelado')}
      onAttach={handleAttach}
      onLink={() => console.log('Link')}
      onVideo={() => console.log('Vídeo')}
      onPoll={() => console.log('Enquete')}
      onEmoji={() => console.log('Emoji')}
      onGif={() => console.log('GIF')}
      isPublishing={isPublishing}
      minLength={10}
      maxLength={5000}
      autoFocus={true}
    />
  );
}
```

## Props

### PostComposerProps

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `name` | `string` | **required** | Nome do usuário |
| `avatar` | `string?` | - | URL do avatar |
| `context` | `string?` | - | Contexto (ex: "publicando em") |
| `contextHighlight` | `string?` | - | Texto destacado no contexto |
| `titleValue` | `string?` | - | Valor do título (modo controlado) |
| `initialTitle` | `string` | `''` | Título inicial |
| `onTitleChange` | `(title: string) => void?` | - | Callback quando título muda |
| `titlePlaceholder` | `string` | `'Título'` | Placeholder do título |
| `showTitle` | `boolean` | `true` | Mostrar campo de título |
| `value` | `string?` | - | Valor do conteúdo (modo controlado) |
| `initialContent` | `string` | `''` | Conteúdo inicial |
| `onChange` | `(content: string) => void?` | - | Callback quando conteúdo muda |
| `placeholder` | `string` | `'Escreva algo...'` | Placeholder do editor |
| `useRichText` | `boolean` | `true` | Usar editor rico (TipTap) ou texto simples |
| `onPublish` | `(data: { title: string; content: string }) => Promise<void> \| void` | **required** | Callback ao publicar |
| `onCancel` | `() => void?` | - | Callback ao cancelar |
| `onAttach` | `() => void?` | - | Handler para anexar arquivo |
| `onLink` | `() => void?` | - | Handler para inserir link |
| `onVideo` | `() => void?` | - | Handler para inserir vídeo |
| `onPoll` | `() => void?` | - | Handler para criar enquete |
| `onEmoji` | `() => void?` | - | Handler para inserir emoji |
| `onGif` | `() => void?` | - | Handler para inserir GIF |
| `isPublishing` | `boolean` | `false` | Estado de publicação |
| `disabled` | `boolean` | `false` | Desabilitar componente |
| `minTitleLength` | `number` | `1` | Comprimento mínimo do título |
| `minContentLength` | `number` | `1` | Comprimento mínimo do conteúdo |
| `maxLength` | `number?` | - | Comprimento máximo do conteúdo |
| `className` | `string?` | - | Classes CSS adicionais |
| `showActions` | `boolean` | `true` | Mostrar barra de ações |
| `autoFocus` | `boolean` | `false` | Focar no editor ao montar |

## Estados

### Loading State
O botão "PUBLICAR" mostra um spinner quando `isPublishing={true}`.

### Disabled State
O componente pode ser desabilitado via prop `disabled` ou automaticamente quando:
- `isPublishing` é `true`
- Conteúdo não atende `minLength`

### Validação
- Valida título e conteúdo separadamente
- Valida automaticamente se há conteúdo válido (não apenas HTML vazio)
- Botão "PUBLICAR" só é habilitado quando título e conteúdo são válidos
- Tooltip no botão explica por que está desabilitado (título ou conteúdo)

## Customização

### Usar apenas Textarea (sem rich text)

```tsx
<PostComposer
  useRichText={false}
  // ... outras props
/>
```

### Ocultar título

```tsx
<PostComposer
  showTitle={false}
  // ... outras props
/>
```

### Ocultar barra de ações

```tsx
<PostComposer
  showActions={false}
  // ... outras props
/>
```

### Usar subcomponentes individualmente

```tsx
import { ComposerHeader, ComposerEditor } from '@/components/post-composer';

function CustomComposer() {
  return (
    <div>
      <ComposerHeader name="João" context="ZONA COMMUNITY" />
      <ComposerEditor value={content} onChange={setContent} />
    </div>
  );
}
```

## Acessibilidade

- ✅ ARIA labels em todos os botões
- ✅ Tooltips informativos
- ✅ Navegação por teclado
- ✅ Estados de loading claramente indicados
- ✅ Feedback visual para ações

## Performance

- Componentes memoizados quando necessário
- Lazy loading do TipTap (editor rico)
- Validação otimizada (não re-renderiza desnecessariamente)

