import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandlesProps {
  node: HTMLElement;
  onResize: (width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function ResizeHandles({
  node,
  onResize,
  minWidth = 100,
  minHeight = 100,
  maxWidth,
  maxHeight,
  maintainAspectRatio = false,
}: ResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const startSizeRef = useRef<{ width: number; height: number } | null>(null);
  const aspectRatioRef = useRef<number>(1);

  useEffect(() => {
    if (node) {
      const rect = node.getBoundingClientRect();
      aspectRatioRef.current = rect.width / rect.height;
    }
  }, [node]);

  const handleMouseDown = (e: React.MouseEvent, position: HandlePosition) => {
    e.preventDefault();
    e.stopPropagation();

    if (!node) return;

    const rect = node.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;

    startPosRef.current = { x: startX, y: startY };
    startSizeRef.current = { width: startWidth, height: startHeight };
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!startPosRef.current || !startSizeRef.current) return;

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;

      // Calcular novo tamanho baseado na posição do handle
      switch (position) {
        case 'nw':
          newWidth = startSizeRef.current.width - deltaX;
          newHeight = startSizeRef.current.height - deltaY;
          break;
        case 'n':
          newHeight = startSizeRef.current.height - deltaY;
          break;
        case 'ne':
          newWidth = startSizeRef.current.width + deltaX;
          newHeight = startSizeRef.current.height - deltaY;
          break;
        case 'e':
          newWidth = startSizeRef.current.width + deltaX;
          break;
        case 'se':
          newWidth = startSizeRef.current.width + deltaX;
          newHeight = startSizeRef.current.height + deltaY;
          break;
        case 's':
          newHeight = startSizeRef.current.height + deltaY;
          break;
        case 'sw':
          newWidth = startSizeRef.current.width - deltaX;
          newHeight = startSizeRef.current.height + deltaY;
          break;
        case 'w':
          newWidth = startSizeRef.current.width - deltaX;
          break;
      }

      // Manter proporção se necessário
      if (maintainAspectRatio && (e.shiftKey || maintainAspectRatio)) {
        const aspectRatio = aspectRatioRef.current;
        if (position.includes('n') || position.includes('s')) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      }

      // Aplicar limites
      newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth || Infinity));
      newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight || Infinity));

      // Se mantiver proporção, ajustar ambos
      if (maintainAspectRatio && (e.shiftKey || maintainAspectRatio)) {
        const aspectRatio = aspectRatioRef.current;
        if (newWidth / newHeight > aspectRatio) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      onResize(newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      startPosRef.current = null;
      startSizeRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getCursor = (position: HandlePosition): string => {
    const cursors: Record<HandlePosition, string> = {
      nw: 'nw-resize',
      n: 'n-resize',
      ne: 'ne-resize',
      e: 'e-resize',
      se: 'se-resize',
      s: 's-resize',
      sw: 'sw-resize',
      w: 'w-resize',
    };
    return cursors[position];
  };

  if (!node) return null;

  const handleSize = 8;
  const handleOffset = handleSize / 2;

  const handles: Array<{ position: HandlePosition; style: React.CSSProperties }> = [
    // Cantos
    { position: 'nw', style: { top: -handleOffset, left: -handleOffset } },
    { position: 'ne', style: { top: -handleOffset, right: -handleOffset } },
    { position: 'se', style: { bottom: -handleOffset, right: -handleOffset } },
    { position: 'sw', style: { bottom: -handleOffset, left: -handleOffset } },
    // Bordas
    { position: 'n', style: { top: -handleOffset, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'e', style: { right: -handleOffset, top: '50%', transform: 'translateY(-50%)' } },
    { position: 's', style: { bottom: -handleOffset, left: '50%', transform: 'translateX(-50%)' } },
    { position: 'w', style: { left: -handleOffset, top: '50%', transform: 'translateY(-50%)' } },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {handles.map(({ position, style }) => (
        <div
          key={position}
          className={cn(
            'absolute w-2 h-2 bg-primary border-2 border-background rounded-full',
            'hover:bg-primary/80 transition-colors z-50 pointer-events-auto'
          )}
          style={{
            ...style,
            width: handleSize,
            height: handleSize,
            cursor: getCursor(position),
          }}
          onMouseDown={(e) => handleMouseDown(e, position)}
        />
      ))}
    </div>
  );
}

