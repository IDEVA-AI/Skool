import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStorageUpload } from '@/hooks/use-storage-upload';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileVideo, FileText, X, Loader2, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function AdminMedia() {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState('lessons');
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const { uploadFile: uploadToStorage, uploading, progress, deleteFile } = useStorageUpload();
  const { toast } = useToast();

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['admin-media-files', uploadPath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('course-media')
        .list(uploadPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        // Se o bucket não existe, retornar array vazio
        if (error.message.includes('Bucket not found')) {
          return [];
        }
        throw error;
      }
      return data || [];
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (50MB)
    if (file.size > 52428800) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const url = await uploadToStorage(uploadFile, uploadPath);
    if (url) {
      setUploadFile(null);
      refetch();
      toast({
        title: 'Upload concluído!',
        description: 'Arquivo enviado com sucesso',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingFile) return;

    const success = await deleteFile(deletingFile);
    if (success) {
      refetch();
      setDeletingFile(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.mp4') || fileName.includes('.mov') || fileName.includes('.webm')) {
      return <FileVideo className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-red-500" />;
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('course-media')
      .getPublicUrl(`${uploadPath}/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-heading font-bold text-foreground">Media Library</h1>
        <p className="text-muted-foreground mt-2">Gerencie arquivos de mídia para os cursos</p>
      </header>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upload-path">Pasta de Destino</Label>
            <select
              id="upload-path"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="lessons">Lessons</option>
              <option value="courses">Courses</option>
              <option value="modules">Modules</option>
            </select>
          </div>

          {uploadFile ? (
            <div className="border border-border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(uploadFile.name)}
                  <div>
                    <p className="font-medium">{uploadFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setUploadFile(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enviando...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
              <Input
                type="file"
                accept="video/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Clique para fazer upload ou arraste o arquivo</p>
                <p className="text-xs text-muted-foreground">
                  Vídeo ou PDF (máx. 50MB)
                </p>
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Arquivos Enviados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : files && files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => {
                const publicUrl = getPublicUrl(file.name);
                return (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.metadata?.size ? `${(file.metadata.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                          {file.created_at && ` • ${new Date(file.created_at).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl);
                          toast({
                            title: 'URL copiada!',
                            description: 'A URL do arquivo foi copiada para a área de transferência',
                          });
                        }}
                        className="h-8 w-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingFile(publicUrl)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum arquivo enviado ainda</p>
              <p className="text-sm mt-2">
                Faça upload de arquivos acima para começar
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deletingFile !== null} onOpenChange={(open) => !open && setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este arquivo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

