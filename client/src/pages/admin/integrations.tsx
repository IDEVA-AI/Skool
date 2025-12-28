import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Trash2, Loader2, ShoppingCart, Link as LinkIcon, Zap } from 'lucide-react';
import {
  useHotmartProducts,
  useHotmartPurchases,
  useCreateHotmartProduct,
  useUpdateHotmartProduct,
  useDeleteHotmartProduct,
} from '@/hooks/use-hotmart-products';
import { useAdminCourses } from '@/hooks/use-admin-courses';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Componente para a seção Hotmart
function HotmartSection() {
  const { data: products, isLoading: productsLoading } = useHotmartProducts();
  const { data: purchases, isLoading: purchasesLoading } = useHotmartPurchases();
  const { data: courses } = useAdminCourses();
  const createMutation = useCreateHotmartProduct();
  const updateMutation = useUpdateHotmartProduct();
  const deleteMutation = useDeleteHotmartProduct();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    course_id: '',
    hotmart_product_id: '',
    hotmart_product_name: '',
  });

  const filteredProducts = (products || []).filter((product) =>
    product.hotmart_product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.hotmart_product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.courses?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPurchases = (purchases || []).filter((purchase) =>
    purchase.buyer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.hotmart_transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.courses?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenForm = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        course_id: product.course_id.toString(),
        hotmart_product_id: product.hotmart_product_id,
        hotmart_product_name: product.hotmart_product_name || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        course_id: '',
        hotmart_product_id: '',
        hotmart_product_name: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.course_id || !formData.hotmart_product_id) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          course_id: parseInt(formData.course_id),
          hotmart_product_id: formData.hotmart_product_id,
          hotmart_product_name: formData.hotmart_product_name || undefined,
        });
        toast({
          title: 'Sucesso',
          description: 'Produto Hotmart atualizado com sucesso',
        });
      } else {
        await createMutation.mutateAsync({
          course_id: parseInt(formData.course_id),
          hotmart_product_id: formData.hotmart_product_id,
          hotmart_product_name: formData.hotmart_product_name || undefined,
        });
        toast({
          title: 'Sucesso',
          description: 'Produto Hotmart vinculado com sucesso',
        });
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      setFormData({
        course_id: '',
        hotmart_product_id: '',
        hotmart_product_name: '',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;

    try {
      await deleteMutation.mutateAsync(deletingProductId);
      setDeletingProductId(null);
      toast({
        title: 'Sucesso',
        description: 'Produto Hotmart removido com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o produto',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      approved: 'default',
      pending: 'secondary',
      refunded: 'destructive',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'approved' ? 'Aprovado' : status === 'pending' ? 'Pendente' : status === 'refunded' ? 'Reembolsado' : 'Cancelado'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotmart</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie produtos Hotmart vinculados aos cursos e visualize histórico de compras
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Vincular Produto
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <LinkIcon className="h-4 w-4 mr-2" />
            Produtos Vinculados
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Histórico de Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Hotmart Vinculados</CardTitle>
              <CardDescription>
                Vincule produtos da Hotmart aos cursos da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por produto ID, nome ou curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {productsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Nome do Produto</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.courses?.title || `Curso #${product.course_id}`}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {product.hotmart_product_id}
                          </code>
                        </TableCell>
                        <TableCell>{product.hotmart_product_name || '-'}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(product.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenForm(product)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingProductId(product.id)}
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
                    {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto vinculado ainda'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Vincular Primeiro Produto
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Compras</CardTitle>
              <CardDescription>
                Visualize todas as compras recebidas via webhook da Hotmart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email, transação ou curso..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {purchasesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredPurchases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Comprador</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Transação</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          {formatDistanceToNow(new Date(purchase.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{purchase.buyer_name || '-'}</div>
                            <div className="text-sm text-muted-foreground">
                              {purchase.buyer_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {purchase.courses?.title || `Curso #${purchase.course_id || 'N/A'}`}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {purchase.hotmart_transaction_id}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p>Nenhuma compra encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto Hotmart' : 'Vincular Produto Hotmart'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Atualize as informações do produto vinculado'
                : 'Vincule um produto da Hotmart a um curso da plataforma'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course_id">Curso *</Label>
              <Select
                value={formData.course_id}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
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
              <Label htmlFor="hotmart_product_id">Product ID da Hotmart *</Label>
              <Input
                id="hotmart_product_id"
                placeholder="Ex: 123456"
                value={formData.hotmart_product_id}
                onChange={(e) =>
                  setFormData({ ...formData, hotmart_product_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                O Product ID pode ser encontrado no painel da Hotmart
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hotmart_product_name">Nome do Produto (opcional)</Label>
              <Input
                id="hotmart_product_name"
                placeholder="Ex: Curso Completo de Marketing"
                value={formData.hotmart_product_name}
                onChange={(e) =>
                  setFormData({ ...formData, hotmart_product_name: e.target.value })
                }
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
              {editingProduct ? 'Atualizar' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingProductId !== null}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desvincular este produto Hotmart? Esta ação não pode ser
              desfeita, mas as compras já processadas não serão afetadas.
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

// Placeholder para futuras integrações
function ComingSoonSection({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Integração {name}</h3>
        <p className="text-muted-foreground">
          Esta integração estará disponível em breve
        </p>
      </CardContent>
    </Card>
  );
}

// Componente principal
export default function AdminIntegrations() {
  const [activeIntegration, setActiveIntegration] = useState<'hotmart' | 'stripe' | 'kiwify'>('hotmart');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie integrações com plataformas de pagamento e afiliados
        </p>
      </div>

      <Tabs value={activeIntegration} onValueChange={(value) => setActiveIntegration(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="hotmart">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Hotmart
          </TabsTrigger>
          <TabsTrigger value="stripe" disabled>
            <Zap className="h-4 w-4 mr-2" />
            Stripe
            <Badge variant="secondary" className="ml-2 text-xs">Em breve</Badge>
          </TabsTrigger>
          <TabsTrigger value="kiwify" disabled>
            <Zap className="h-4 w-4 mr-2" />
            Kiwify
            <Badge variant="secondary" className="ml-2 text-xs">Em breve</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotmart">
          <HotmartSection />
        </TabsContent>

        <TabsContent value="stripe">
          <ComingSoonSection name="Stripe" />
        </TabsContent>

        <TabsContent value="kiwify">
          <ComingSoonSection name="Kiwify" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

