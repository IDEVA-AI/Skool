import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Search, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { 
  useOwnedCommunities, 
  useDeleteCommunity,
  type Community 
} from '@/hooks/use-communities';
import { CommunityForm } from '@/components/admin/community-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export default function AdminCommunities() {
  const { data: communities, isLoading } = useOwnedCommunities();
  const deleteMutation = useDeleteCommunity();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [deletingCommunityId, setDeletingCommunityId] = useState<string | null>(null);

  const filteredCommunities = communities?.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Comunidade deletada',
        description: 'A comunidade foi removida com sucesso.',
      });
      setDeletingCommunityId(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.message || 'Não foi possível deletar a comunidade.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCommunity(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    toast({
      title: editingCommunity ? 'Comunidade atualizada' : 'Comunidade criada',
      description: editingCommunity 
        ? 'A comunidade foi atualizada com sucesso.'
        : 'A comunidade foi criada com sucesso.',
    });
  };

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case 'invite_only':
        return 'Apenas Convite';
      case 'public_paid':
        return 'Pago';
      case 'both':
        return 'Convite + Pago';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Comunidades</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as comunidades da plataforma
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunidade
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar comunidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? 'Nenhuma comunidade encontrada' : 'Nenhuma comunidade criada'}
              </p>
              <p className="text-sm mb-4">
                {searchQuery 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando sua primeira comunidade'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Comunidade
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Tipo de Acesso</TableHead>
                  <TableHead>Criada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell>
                      <div className="font-medium">{community.name}</div>
                      {community.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {community.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {community.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getAccessTypeLabel(community.access_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(community.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/admin/communities/${community.slug}`}>
                            <Users className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(community)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCommunityId(community.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CommunityForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        community={editingCommunity}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog
        open={deletingCommunityId !== null}
        onOpenChange={(open) => !open && setDeletingCommunityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Comunidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta comunidade? Esta ação não pode ser desfeita.
              Todos os dados associados (cursos, posts, membros) serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCommunityId && handleDelete(deletingCommunityId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

