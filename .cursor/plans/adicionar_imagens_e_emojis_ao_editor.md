# Adicionar suporte a imagens e emojis ao editor TipTap

## Objetivo
Expandir o editor TipTap para suportar criação de artigos/tutoriais com:
1. **Inserção de imagens** - Upload para Supabase Storage e inserção no editor
2. **Emojis** - Seletor de emojis para inserção no conteúdo
3. **Links** - Já funciona, manter como está

## Análise do Estado Atual

### Recursos Existentes
- Hook `useStorageUpload` em [`client/src/hooks/use-storage-upload.ts`](client/src/hooks/use-storage-upload.ts) - já faz upload para Supabase Storage
- Componente `TipTapEditor` em [`client/src/components/tiptap-editor.tsx`](client/src/components/tiptap-editor.tsx) - editor base com formatação básica
- Extensão Link já configurada e funcionando

### Dependências Necessárias
- `@tiptap/extension-image` - extensão para imagens no TipTap
- `@tiptap/extension-emoji` ou biblioteca de emoji picker (ex: `emoji-mart-react`)

## Implementação

### 1. Instalar Dependências
```bash
npm install @tiptap/extension-image emoji-mart-react
```

### 2. Adicionar Extensão de Imagem ao TipTap

No arquivo [`client/src/components/tiptap-editor.tsx`](client/src/components/tiptap-editor.tsx):

- Importar `Image` extension do TipTap
- Importar `useStorageUpload` hook
- Adicionar extensão Image configurada para aceitar uploads
- Criar função `handleImageUpload` que:
  - Abre file picker
  - Faz upload usando `useStorageUpload` para bucket `post-images` (ou `course-media`)
  - Insere imagem no editor usando `editor.chain().focus().setImage({ src: url }).run()`
- Adicionar botão de imagem na toolbar

### 3. Adicionar Seletor de Emojis

- Importar `EmojiPicker` de `emoji-mart-react`
- Criar estado para controlar abertura do picker
- Adicionar botão de emoji na toolbar
- Quando emoji selecionado, inserir no editor usando `editor.chain().focus().insertContent(emoji.native).run()`

### 4. Estrutura de Arquivos

```
client/src/components/tiptap-editor.tsx
  - Adicionar imports necessários
  - Adicionar extensão Image
  - Adicionar lógica de upload
  - Adicionar botão de imagem na toolbar
  - Adicionar botão de emoji na toolbar
  - Adicionar componente EmojiPicker (popover/dialog)
```

## Detalhes Técnicos

### Upload de Imagens
- Usar bucket `post-images` no Supabase Storage (ou criar se não existir)
- Path: `posts/${userId}/${timestamp}-${filename}`
- Suportar formatos: jpg, jpeg, png, gif, webp
- Limite de tamanho: 10MB por imagem
- Mostrar loading durante upload
- Tratar erros de upload

### Emoji Picker
- Usar biblioteca `emoji-mart-react` (leve e moderna)
- Posicionar como Popover ao lado do botão
- Inserir emoji na posição do cursor
- Suportar busca de emojis

## Componentes a Modificar

1. **`client/src/components/tiptap-editor.tsx`**
   - Adicionar extensão Image
   - Adicionar lógica de upload
   - Adicionar botões na toolbar
   - Adicionar EmojiPicker

## Estilos CSS

Adicionar estilos para imagens no editor:
```css
.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}
```

## Testes

- [ ] Upload de imagem funciona corretamente
- [ ] Imagem aparece no editor após upload
- [ ] Emoji picker abre e fecha corretamente
- [ ] Emoji é inserido na posição do cursor
- [ ] Erros de upload são tratados adequadamente
- [ ] Imagens são salvas no HTML do post

