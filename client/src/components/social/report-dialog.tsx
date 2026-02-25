import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useReportPost } from '@/hooks/use-reports';
import { Loader2 } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  reporterId: string;
}

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Assédio ou bullying' },
  { value: 'inappropriate', label: 'Conteúdo inapropriado' },
  { value: 'misinformation', label: 'Informação falsa' },
  { value: 'other', label: 'Outro motivo' },
] as const;

export function ReportDialog({ isOpen, onClose, postId, reporterId }: ReportDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const reportMutation = useReportPost();

  const handleSubmit = () => {
    if (!reason) return;
    reportMutation.mutate(
      {
        postId,
        reporterId,
        reason: reason as 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other',
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReason('');
          setDescription('');
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Denunciar publicação</AlertDialogTitle>
          <AlertDialogDescription>
            Por que você está denunciando esta publicação?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup value={reason} onValueChange={setReason}>
            {REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                <Label htmlFor={`reason-${r.value}`} className="cursor-pointer">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="report-description">Detalhes (opcional)</Label>
            <Textarea
              id="report-description"
              placeholder="Descreva o problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason || reportMutation.isPending}
          >
            {reportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Denunciar'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
