import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { ResizeHandles } from './resize-handles';
import { useRef } from 'react';
import type { NodeViewProps } from '@tiptap/react';

function ResizableImageComponent({ node, selected, updateAttributes }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSize = (width: number, height: number) => {
    updateAttributes({
      width: Math.round(width),
      height: Math.round(height),
    });
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={selected ? 'ProseMirror-selectednode' : ''}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{
          maxWidth: '100%',
          height: node.attrs.height ? `${node.attrs.height}px` : 'auto',
          borderRadius: '0.5rem',
          margin: '1rem 0',
          display: 'block',
          width: node.attrs.width ? `${node.attrs.width}px` : undefined,
        }}
        draggable={false}
      />
      {selected && imageRef.current && (
        <ResizeHandles
          node={imageRef.current}
          onResize={updateSize}
          minWidth={100}
          minHeight={100}
          maintainAspectRatio={false}
        />
      )}
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

