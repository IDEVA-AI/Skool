import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DraggableCourseCardProps {
  course: {
    id: number;
    title: string;
    description?: string | null;
    community_id?: string | null;
    created_at: string;
    order?: number | null;
  };
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function DraggableCourseCard({ course, index, onEdit, onDelete }: DraggableCourseCardProps) {
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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group cursor-move',
        isDragging && 'ring-2 ring-primary ring-offset-2 shadow-lg'
      )}
    >
      {/* Badge de ordem */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md z-10">
        {index + 1}
      </div>

      {/* Handle de arraste */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded transition-colors"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2 pr-8">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {course.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {formatDistanceToNow(new Date(course.created_at), { addSuffix: true, locale: ptBR })}
          </span>
          {course.community_id && (
            <span className="truncate max-w-[120px]" title={course.community_id}>
              {course.community_id.slice(0, 8)}...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <Link href={`/admin/courses/${course.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

