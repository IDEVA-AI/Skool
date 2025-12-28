# Adicionar redimensionamento de imagens e vídeos no editor TipTap

## Objetivo
Permitir que usuários redimensionem imagens e vídeos embedados diretamente no editor, arrastando handles de redimensionamento.

## Análise do Estado Atual
- Imagens são inseridas usando `@tiptap/extension-image`
- Vídeos são inseridos como iframes no HTML (YouTube, Vimeo)
- Não há suporte nativo de redimensionamento no TipTap

## Solução

### Abordagem: Extensão Customizada com Handles de Redimensionamento

Criar extensões customizadas que:
1. Adicionam atributos `width` e `height` às imagens/iframes
2. Renderizam handles de redimensionamento quando o elemento está selecionado
3. Permitem arrastar os handles para redimensionar
4. Atualizam os atributos width/height em tempo real

## Implementação

### 1. Criar extensão customizada de Image com redimensionamento

Arquivo: `client/src/components/tiptap-extensions/resizable-image.tsx`

- Estender `Image` do TipTap
- Adicionar atributos `width` e `height`
- Criar componente React que renderiza handles de redimensionamento
- Implementar lógica de drag para redimensionar

### 2. Criar extensão customizada para Iframe/Video

Arquivo: `client/src/components/tiptap-extensions/resizable-iframe.tsx`

- Criar extensão customizada para iframes
- Adicionar atributos `width` e `height`
- Renderizar handles de redimensionamento
- Suportar YouTube, Vimeo e outros iframes

### 3. Componente de Handles de Redimensionamento

Arquivo: `client/src/components/tiptap-extensions/resize-handles.tsx`

- Componente React que renderiza 8 handles (cantos e bordas)
- Lógica de drag para redimensionar
- Manter proporção (opcional, com Shift)
- Atualizar atributos do node

### 4. Integração no TipTapEditor

- Substituir extensão Image padrão pela customizada
- Adicionar extensão ResizableIframe
- Configurar para salvar width/height no HTML

## Estrutura de Arquivos

```
client/src/components/tiptap-extensions/
  ├── resizable-image.tsx      # Extensão de imagem redimensionável
  ├── resizable-iframe.tsx     # Extensão de iframe/vídeo redimensionável
  └── resize-handles.tsx       # Componente de handles de redimensionamento
```

## Detalhes Técnicos

### Handles de Redimensionamento
- 8 handles: 4 cantos + 4 bordas (top, right, bottom, left)
- Visual: pequenos quadrados/círculos nas bordas
- Cursor muda ao passar sobre handles (nw-resize, ne-resize, etc)
- Drag para redimensionar
- Shift+drag para manter proporção

### Atributos HTML
- Salvar como `width` e `height` em pixels ou porcentagem
- Exemplo: `<img src="..." width="640" height="360" />`
- Para iframes: `<iframe src="..." width="640" height="360" />`

### Limites
- Tamanho mínimo: 100px
- Tamanho máximo: 100% da largura do container
- Manter proporção original (opcional)

## Componentes a Criar/Modificar

1. **`client/src/components/tiptap-extensions/resizable-image.tsx`** (novo)
   - Extensão customizada de Image
   - Renderiza handles quando selecionado

2. **`client/src/components/tiptap-extensions/resizable-iframe.tsx`** (novo)
   - Extensão para iframes/vídeos
   - Detecta e renderiza YouTube/Vimeo

3. **`client/src/components/tiptap-extensions/resize-handles.tsx`** (novo)
   - Componente de handles
   - Lógica de drag

4. **`client/src/components/tiptap-editor.tsx`** (modificar)
   - Substituir Image por ResizableImage
   - Adicionar ResizableIframe
   - Configurar extensões

## Estilos CSS

```css
.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: hsl(var(--primary));
  border: 2px solid hsl(var(--background));
  border-radius: 50%;
  cursor: nwse-resize;
  z-index: 10;
}
```

## Testes

- [ ] Imagens podem ser redimensionadas arrastando handles
- [ ] Vídeos embedados podem ser redimensionados
- [ ] Proporção é mantida quando Shift é pressionado
- [ ] Tamanhos são salvos corretamente no HTML
- [ ] Handles aparecem apenas quando elemento está selecionado
- [ ] Funciona em diferentes navegadores

