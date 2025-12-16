import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Link } from 'wouter';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DraggableCourseRowProps {
  course: {
    id: number;
    title: string;
    description?: string | null;
    community_id?: string | null;
    created_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function DraggableCourseRow({ course, onEdit, onDelete }: DraggableCourseRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'bg-muted/50'
      )}
    >
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{course.title}</div>
          {course.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {course.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {course.community_id || '-'}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(course.created_at), { addSuffix: true, locale: ptBR })}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8"
          >
            <Link href={`/admin/courses/${course.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
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
      </TableCell>
    </TableRow>
  );
}

