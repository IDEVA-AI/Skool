import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReports, useUpdateReport, useDeletePostByAdmin } from '@/hooks/use-reports';
import { useAuth } from '@/hooks/use-auth';
import { Flag, CheckCircle, XCircle, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Assédio',
  inappropriate: 'Inapropriado',
  misinformation: 'Desinformação',
  other: 'Outro',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'destructive' },
  reviewed: { label: 'Revisado', variant: 'secondary' },
  dismissed: { label: 'Dispensado', variant: 'outline' },
  actioned: { label: 'Ação tomada', variant: 'default' },
};

export default function AdminModeration() {
  const { user } = useAuth();
  const { data: reports, isLoading } = useReports();
  const updateReport = useUpdateReport();
  const deletePost = useDeletePostByAdmin();
  const [deleteTarget, setDeleteTarget] = useState<{ reportId: string; postId: number } | null>(null);

  const pendingReports = reports?.filter(r => r.status === 'pending') || [];
  const resolvedReports = reports?.filter(r => r.status !== 'pending') || [];

  const handleDismiss = (reportId: string) => {
    if (!user) return;
    updateReport.mutate({ reportId, status: 'dismissed', reviewerId: user.id });
  };

  const handleMarkReviewed = (reportId: string) => {
    if (!user) return;
    updateReport.mutate({ reportId, status: 'reviewed', reviewerId: user.id });
  };

  const handleDeletePost = async () => {
    if (!deleteTarget || !user) return;
    await deletePost.mutateAsync(deleteTarget.postId);
    updateReport.mutate({ reportId: deleteTarget.reportId, status: 'actioned', reviewerId: user.id });
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Moderação</h2>
          <p className="text-zinc-500 mt-1">Gerenciar denúncias de conteúdo</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Moderação</h2>
        <p className="text-zinc-500 mt-1">
          Gerenciar denúncias de conteúdo
          {pendingReports.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingReports.length} pendente{pendingReports.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </p>
      </div>

      {/* Pending reports */}
      {pendingReports.length === 0 && resolvedReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Flag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-zinc-700">Nenhuma denúncia</h3>
            <p className="text-sm text-muted-foreground mt-1">Não há denúncias para revisar.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingReports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Pendentes ({pendingReports.length})
              </h3>
              {pendingReports.map((report) => (
                <Card key={report.id} className="border-amber-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="destructive">
                            {REASON_LABELS[report.reason] || report.reason}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Denunciado por <strong>{report.reporter?.name || 'Usuário'}</strong>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {report.description && (
                          <p className="text-sm text-zinc-600 bg-zinc-50 rounded p-2">
                            "{report.description}"
                          </p>
                        )}

                        {report.post && (
                          <div className="border rounded-lg p-3 bg-white">
                            <p className="text-xs text-muted-foreground mb-1">
                              Post de <strong>{report.post.author_name}</strong>
                            </p>
                            {report.post.title && (
                              <p className="font-medium text-sm text-zinc-900">{report.post.title}</p>
                            )}
                            <p className="text-sm text-zinc-600 line-clamp-3"
                               dangerouslySetInnerHTML={{ __html: report.post.content.slice(0, 300) }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkReviewed(report.id)}
                          disabled={updateReport.isPending}
                          className="gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Revisar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismiss(report.id)}
                          disabled={updateReport.isPending}
                          className="gap-1.5"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Dispensar
                        </Button>
                        {report.post && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget({ reportId: report.id, postId: report.post_id })}
                            disabled={deletePost.isPending}
                            className="gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Deletar Post
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Resolved reports */}
          {resolvedReports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Resolvidas ({resolvedReports.length})
              </h3>
              {resolvedReports.map((report) => (
                <Card key={report.id} className="opacity-70">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={STATUS_CONFIG[report.status]?.variant || 'outline'}>
                          {STATUS_CONFIG[report.status]?.label || report.status}
                        </Badge>
                        <Badge variant="outline">
                          {REASON_LABELS[report.reason] || report.reason}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Post #{report.post_id} — por {report.reporter?.name || 'Usuário'}
                        </span>
                        {report.reviewed_at && (
                          <span className="text-xs text-muted-foreground">
                            Revisado em {new Date(report.reviewed_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar post denunciado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é permanente. O post será removido do feed e a denúncia será marcada como "ação tomada".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePost.isPending}
            >
              {deletePost.isPending ? 'Deletando...' : 'Deletar Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
