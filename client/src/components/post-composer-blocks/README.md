# PostComposerBlocks - Compositor Baseado em Blocos

Compositor de posts com modelo de blocos para suportar texto, imagens, vídeos e links.

## 🧩 Modelo de Blocos

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

## 📦 Componentes

### PostComposerBlocks
Componente principal que gerencia o array de blocos.

### MediaToolbar
Barra de ferramentas para adicionar novos blocos.

### MediaBlock
Renderizador genérico para cada tipo de bloco.

### ContentEditor
Editor de conteúdo (TipTap para texto rico ou Textarea).

### MediaPreviewList
Lista de previews de mídia com estado vazio.

## 🎨 Estratégia de Renderização

### Blocos de Texto
- Usa TipTap (rich text) ou Textarea (texto simples)
- Edição inline
- Suporta formatação completa

### Blocos de Mídia
- Preview visual
- Botão de remover no hover
- Metadata para URLs e thumbnails

## 🔄 Fluxo de Uso

1. **Adicionar Bloco:**
   - Clicar em ícone na toolbar
   - Bloco adicionado ao array
   - Renderizado baseado no tipo

2. **Editar Bloco:**
   - Texto: Editor inline
   - Mídia: Preview com opções

3. **Remover Bloco:**
   - Botão X no hover
   - Remove do array

4. **Publicar:**
   - Valida conteúdo
   - Envia array completo
   - Reset após publicação

## 📝 Exemplo de Uso

```tsx
import { PostComposerBlocks } from '@/components/post-composer-blocks';

<PostComposerBlocks
  name="João Silva"
  avatar="/avatar.jpg"
  context="ZONA COMMUNITY"
  onPublish={async (blocks) => {
    await createPost({ blocks });
  }}
  useRichText={true}
/>
```

## 🔌 Integração com API

```typescript
const handlePublish = async (blocks: PostContent) => {
  const payload = {
    title: extractTitle(blocks),
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

## 🚀 Extensibilidade

### Adicionar Novo Tipo de Bloco

```typescript
// 1. Adicionar tipo
type BlockType = 'text' | 'image' | 'video' | 'link' | 'poll';

// 2. Adicionar handler na toolbar
case 'poll':
  handleAddPoll();

// 3. Adicionar renderer em MediaBlock
case 'poll':
  return <PollBlock block={block} />;
```

