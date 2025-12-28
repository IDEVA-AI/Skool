import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { ResizeHandles } from './resize-handles';
import { useRef } from 'react';
import type { NodeViewProps } from '@tiptap/react';

function ResizableIframeComponent({ node, selected, updateAttributes }: NodeViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
      <iframe
        ref={iframeRef}
        src={node.attrs.src}
        width={node.attrs.width || '560'}
        height={node.attrs.height || '315'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          borderRadius: '0.5rem',
          margin: '1rem 0',
          display: 'block',
          border: 'none',
          width: node.attrs.width ? `${node.attrs.width}px` : undefined,
          height: node.attrs.height ? `${node.attrs.height}px` : undefined,
        }}
      />
      {selected && iframeRef.current && (
        <ResizeHandles
          node={iframeRef.current}
          onResize={updateSize}
          minWidth={200}
          minHeight={150}
          maintainAspectRatio={false}
        />
      )}
    </NodeViewWrapper>
  );
}

export const ResizableIframe = Node.create({
  name: 'iframe',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowFullscreen: true,
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
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
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
        renderHTML: () => ({
          allowfullscreen: this.options.allowFullscreen,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableIframeComponent);
  },

});

