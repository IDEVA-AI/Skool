# Como Implementar React-Quill

## 📦 Passo 1: Instalar Dependências

```bash
npm install react-quill quill
```

## 🎨 Passo 2: Criar Componente Customizado

Crie o arquivo `client/src/components/react-quill-editor.tsx`:

```tsx
import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ReactQuillEditor({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: ReactQuillEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <div className={cn("react-quill-wrapper", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style>{`
        .react-quill-wrapper .ql-container {
          font-size: 1rem;
          min-height: 120px;
        }
        .react-quill-wrapper .ql-editor {
          min-height: 120px;
        }
        .react-quill-wrapper .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        .react-quill-wrapper .ql-toolbar {
          border-top: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          background: hsl(var(--muted) / 0.3);
        }
        .react-quill-wrapper .ql-container {
          border-bottom: 1px solid hsl(var(--border));
          border-left: 1px solid hsl(var(--border));
          border-right: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .react-quill-wrapper .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .react-quill-wrapper .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        .react-quill-wrapper .ql-toolbar button:hover,
        .react-quill-wrapper .ql-toolbar button.ql-active {
          background: hsl(var(--muted));
        }
        .dark .react-quill-wrapper .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .dark .react-quill-wrapper .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
}
```

## 🔄 Passo 3: Substituir no Componente de Post

Em `client/src/pages/community-v2.tsx`:

```tsx
// Trocar:
import { RichTextEditor } from '@/components/rich-text-editor';

// Por:
import { ReactQuillEditor } from '@/components/react-quill-editor';

// E trocar o uso:
<ReactQuillEditor
  placeholder="Escreva algo..." 
  value={postContent}
  onChange={setPostContent}
  className="border-none shadow-none bg-transparent"
/>
```

## 🎯 Funcionalidades Incluídas

- ✅ Negrito, Itálico, Sublinhado, Tachado
- ✅ Títulos (H1, H2, H3)
- ✅ Listas ordenadas e com marcadores
- ✅ Alinhamento de texto
- ✅ Links
- ✅ Imagens (precisa configurar upload)
- ✅ Limpar formatação

## 🖼️ Adicionar Upload de Imagens

Para adicionar upload de imagens, você precisaria:

1. Criar um handler de upload
2. Configurar o módulo image:

```tsx
const modules = useMemo(() => ({
  toolbar: {
    // ... outras opções
    handlers: {
      image: () => {
        // Abrir seletor de arquivo
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = async () => {
          const file = input.files?.[0];
          if (file) {
            // Fazer upload e inserir URL
            const url = await uploadImage(file);
            const quill = quillRef.current?.getEditor();
            const range = quill?.getSelection();
            quill?.insertEmbed(range?.index || 0, 'image', url);
          }
        };
      }
    }
  }
}), []);
```

## 📝 Vantagens sobre o Componente Atual

1. ✅ **Mais funcionalidades** - Títulos, listas, etc.
2. ✅ **Melhor UX** - Interface mais polida
3. ✅ **Suporte a imagens** - Mais fácil de implementar
4. ✅ **Menos bugs** - Biblioteca testada
5. ✅ **Melhor acessibilidade** - Por padrão
6. ✅ **Suporte a Markdown** - Pode converter se necessário

## ⚠️ Considerações

- O bundle aumenta em ~45KB
- Precisa importar CSS (`react-quill/dist/quill.snow.css`)
- Pode precisar ajustar estilos para combinar com o tema

