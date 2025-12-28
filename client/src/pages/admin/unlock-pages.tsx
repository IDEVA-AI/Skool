import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Loader2, Lock, X, RefreshCw } from 'lucide-react';
import {
  useUnlockPages,
  useCreateUnlockPage,
  useUpdateUnlockPage,
  useDeleteUnlockPage,
  type CourseUnlockPage,
} from '@/hooks/use-unlock-pages';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminCourses } from '@/hooks/use-admin-courses';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export default function AdminUnlockPages() {
  const { data: pages, isLoading } = useUnlockPages();
  const { data: courses } = useAdminCourses();
  const createMutation = useCreateUnlockPage();
  const updateMutation = useUpdateUnlockPage();
  const deleteMutation = useDeleteUnlockPage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CourseUnlockPage | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    hero_image_url: '',
    checkout_url: '',
    button_text: 'Desbloquear Agora',
    price_text: '',
    bonus_value: '',
    features: [] as string[],
    bonus: [] as { name: string; price: string }[],
    additional_content: '',
    guarantee_text: '',
    payment_info: '',
    is_active: true,
  });
  const [newFeature, setNewFeature] = useState('');
  const [newBonusName, setNewBonusName] = useState('');
  const [newBonusPrice, setNewBonusPrice] = useState('');

  const filteredPages = (pages || []).filter((page) =>
    page.courses?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenForm = (page?: CourseUnlockPage) => {
    if (page) {
      setEditingPage(page);
      
      // Converter bônus do formato antigo (string[]) para novo ({ name, price }[])
      let bonusArray: { name: string; price: string }[] = [];
      if (Array.isArray(page.bonus)) {
        bonusArray = page.bonus.map((b: any) => {
          if (typeof b === 'string') {
            // Formato antigo: string simples
            return { name: b, price: '' };
          } else if (b && typeof b === 'object' && 'name' in b) {
            // Formato novo: objeto com name e price
            return { name: b.name || '', price: b.price || '' };
          }
          return { name: '', price: '' };
        }).filter(b => b.name);
      }
      
      setFormData({
        course_id: page.course_id.toString(),
        title: page.title || '',
        description: page.description || '',
        hero_image_url: page.hero_image_url || '',
        checkout_url: page.checkout_url || '',
        button_text: page.button_text || 'Desbloquear Agora',
        price_text: page.price_text || '',
        bonus_value: page.bonus_value || '',
        features: Array.isArray(page.features) ? page.features : [],
        bonus: bonusArray,
        additional_content: page.additional_content || '',
        guarantee_text: page.guarantee_text || '',
        payment_info: page.payment_info || '',
        is_active: page.is_active,
      });
    } else {
      setEditingPage(null);
      setFormData({
        course_id: '',
        title: '',
        description: '',
        hero_image_url: '',
        checkout_url: '',
        button_text: 'Desbloquear Agora',
        price_text: '',
        bonus_value: '',
        features: [],
        bonus: [],
        additional_content: '',
        guarantee_text: '',
        payment_info: '',
        is_active: true,
      });
    }
    setNewBonusName('');
    setNewBonusPrice('');
    setIsFormOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleAddBonus = () => {
    if (newBonusName.trim()) {
      setFormData({
        ...formData,
        bonus: [...formData.bonus, { name: newBonusName.trim(), price: newBonusPrice.trim() }],
      });
      setNewBonusName('');
      setNewBonusPrice('');
    }
  };

  const handleRemoveBonus = (index: number) => {
    setFormData({
      ...formData,
      bonus: formData.bonus.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    if (!formData.course_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um curso',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingPage) {
        await updateMutation.mutateAsync({
          id: editingPage.id,
          ...formData,
          course_id: parseInt(formData.course_id),
        });
        toast({
          title: 'Sucesso',
          description: 'Página de desbloqueio atualizada com sucesso',
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          course_id: parseInt(formData.course_id),
        });
        toast({
          title: 'Sucesso',
          description: 'Página de desbloqueio criada com sucesso',
        });
      }
      setIsFormOpen(false);
      setEditingPage(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a página',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingPageId) return;

    try {
      await deleteMutation.mutateAsync(deletingPageId);
      setDeletingPageId(null);
      toast({
        title: 'Sucesso',
        description: 'Página de desbloqueio removida com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar a página',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (page: CourseUnlockPage) => {
    try {
      await updateMutation.mutateAsync({
        id: page.id,
        is_active: !page.is_active,
      });
      toast({
        title: 'Sucesso',
        description: `Página ${!page.is_active ? 'ativada' : 'desativada'} com sucesso`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Páginas de Desbloqueio</h1>
          <p className="text-muted-foreground mt-1">
            Configure o conteúdo personalizado para cada página de desbloqueio de curso
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['unlock-pages'] });
              queryClient.invalidateQueries({ queryKey: ['unlock-page'] });
              toast({
                title: 'Cache atualizado',
                description: 'Páginas recarregadas',
              });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Páginas Configuradas</CardTitle>
          <CardDescription>
            Gerencie as páginas de desbloqueio dos cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por curso ou título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredPages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      {page.courses?.title || `Curso #${page.course_id}`}
                    </TableCell>
                    <TableCell>{page.title || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={page.is_active ? 'default' : 'secondary'}>
                        {page.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(page.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(page)}
                          title={page.is_active ? 'Desativar página' : 'Ativar página'}
                        >
                          {page.is_active ? (
                            <Lock className="h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(page)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPageId(page.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p className="mb-4">
                {searchQuery ? 'Nenhuma página encontrada' : 'Nenhuma página configurada ainda'}
              </p>
              {!searchQuery && (
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Página
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Editar Página de Desbloqueio' : 'Nova Página de Desbloqueio'}
            </DialogTitle>
            <DialogDescription>
              Configure o conteúdo da página de desbloqueio para o curso selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="course_id">Curso *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                disabled={!!editingPage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título da Página</Label>
              <Input
                id="title"
                placeholder="Ex: Desbloqueie seu acesso completo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar o título do curso
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição personalizada da página..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_image_url">URL da Imagem Hero</Label>
              <Input
                id="hero_image_url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.hero_image_url}
                onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout_url">URL de Checkout</Label>
              <Input
                id="checkout_url"
                placeholder="https://hotmart.com/checkout/..."
                value={formData.checkout_url}
                onChange={(e) => setFormData({ ...formData, checkout_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Link para onde o usuário será redirecionado ao clicar em desbloquear
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Texto do Botão</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_text">Texto do Preço</Label>
                <Input
                  id="price_text"
                  placeholder="Ex: R$ 297,00"
                  value={formData.price_text}
                  onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus_value">Valor do Bônus (Riscado)</Label>
              <Input
                id="bonus_value"
                placeholder="Ex: R$ 497,00"
                value={formData.bonus_value}
                onChange={(e) => setFormData({ ...formData, bonus_value: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Este valor aparecerá riscado acima do preço final para mostrar o desconto
              </p>
            </div>

            <div className="space-y-2">
              <Label>Benefícios/Features</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar benefício..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddFeature}>
                  Adicionar
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bônus</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Nome do bônus..."
                    value={newBonusName}
                    onChange={(e) => setNewBonusName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBonus();
                      }
                    }}
                  />
                </div>
                <div className="w-32">
                  <Input
                    placeholder="Preço"
                    value={newBonusPrice}
                    onChange={(e) => setNewBonusPrice(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBonus();
                      }
                    }}
                  />
                </div>
                <Button type="button" onClick={handleAddBonus}>
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemplo: "Ebook exclusivo" - "R$ 97,00"
              </p>
              {formData.bonus.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.bonus.map((bonus, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{bonus.name}</span>
                        {bonus.price && (
                          <span className="text-sm text-muted-foreground ml-2">
                            - {bonus.price}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBonus(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guarantee_text">Texto de Garantia</Label>
              <Input
                id="guarantee_text"
                placeholder="Ex: Garantia de 7 dias ou seu dinheiro de volta"
                value={formData.guarantee_text}
                onChange={(e) => setFormData({ ...formData, guarantee_text: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_info">Informações de Pagamento</Label>
              <Textarea
                id="payment_info"
                placeholder="Informações sobre formas de pagamento..."
                value={formData.payment_info}
                onChange={(e) => setFormData({ ...formData, payment_info: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_content">Conteúdo Adicional</Label>
              <Textarea
                id="additional_content"
                placeholder="Conteúdo HTML ou texto adicional..."
                value={formData.additional_content}
                onChange={(e) => setFormData({ ...formData, additional_content: e.target.value })}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Você pode usar HTML básico aqui
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Página Ativa</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingPage ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingPageId !== null}
        onOpenChange={(open) => !open && setDeletingPageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta página de desbloqueio? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
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

