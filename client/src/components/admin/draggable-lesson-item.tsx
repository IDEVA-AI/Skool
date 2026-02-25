import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableLessonItemProps {
  lesson: {
    id: number;
    title: string;
    content_type?: string | null;
    duration?: number | null;
    content_url?: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function DraggableLessonItem({
  lesson,
  onEdit,
  onDelete,
}: DraggableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      className={cn('border-zinc-200', isDragging && 'bg-muted/50')}
      style={style}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
              aria-label="Arrastar para reordenar aula"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{lesson.title}</span>
                {lesson.content_type && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {lesson.content_type}
                  </span>
                )}
                {lesson.duration && (
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
              {lesson.content_url && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {lesson.content_url}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

