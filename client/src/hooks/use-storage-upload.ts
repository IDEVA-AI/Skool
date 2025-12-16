import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const BUCKET_NAME = 'course-media';

export function useStorageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    path: string,
    options?: {
      onProgress?: (progress: number) => void;
      cacheControl?: string;
    }
  ): Promise<string | null> => {
    setUploading(true);
    setProgress(0);

    try {
      // Verificar se o bucket existe, se não, criar
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

      if (!bucketExists) {
        // Tentar criar o bucket (pode falhar se não tiver permissão)
        await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
      }

      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: false,
        });

      if (error) {
        // Se o bucket não existe e não conseguiu criar, usar URL externa como fallback
        if (error.message.includes('Bucket not found')) {
          toast({
            title: 'Bucket não configurado',
            description: 'Configure o bucket "course-media" no Supabase Storage ou use URLs externas',
            variant: 'destructive',
          });
          return null;
        }
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      setProgress(100);
      setUploading(false);

      return urlData.publicUrl;
    } catch (error: any) {
      setUploading(false);
      setProgress(0);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload do arquivo',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
      // Extrair o caminho do arquivo da URL completa
      const path = filePath.split(`${BUCKET_NAME}/`)[1];
      if (!path) return false;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar arquivo',
        description: error.message || 'Não foi possível deletar o arquivo',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  };
}

