import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { GripVertical, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableModuleItemProps {
  module: {
    id: number;
    title: string;
  };
  lessonsCount?: number;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onCreateLesson: () => void;
}

export function DraggableModuleItem({
  module,
  lessonsCount,
  children,
  onEdit,
  onDelete,
  onCreateLesson,
}: DraggableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      value={module.id.toString()}
      className={cn('border-border/50', isDragging && 'bg-muted/50')}
      style={style}
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label="Arrastar para reordenar módulo"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="font-semibold">{module.title}</span>
            {lessonsCount !== undefined && (
              <span className="text-sm text-muted-foreground">
                ({lessonsCount} {lessonsCount === 1 ? 'aula' : 'aulas'})
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={onCreateLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

