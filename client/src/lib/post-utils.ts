import { Post as PostType } from '@/types/social';
import { getAvatarUrl } from './avatar-utils';

/**
 * Converte um post do formato Supabase para o formato esperado pelo Feed/PostComponent
 */
export function convertSupabasePostToFeedPost(supabasePost: any): PostType {
  const postUser = supabasePost.users || {};
  const course = supabasePost.courses || {};
  
  // Contar comentários (vem do campo comment_count adicionado pela query)
  const commentCount = supabasePost.comment_count || 0;

  // Determinar role do autor (assumindo que vem do banco ou é 'user' por padrão)
  const authorRole = postUser.role === 'admin' ? 'admin' : 'user';

  return {
    id: String(supabasePost.id),
    title: supabasePost.title || '',
    content: supabasePost.content || '',
    authorId: supabasePost.user_id || postUser.id || '',
    authorName: postUser.name || postUser.email?.split('@')[0] || 'Usuário',
    authorAvatar: getAvatarUrl(postUser.avatar_url, postUser.name || postUser.email),
    authorRole,
    createdAt: new Date(supabasePost.created_at),
    reactions: [], // Será preenchido se houver dados de reações
    comments: [], // Será preenchido se houver dados de comentários
    commentCount: commentCount,
    pinned: supabasePost.pinned || false,
    category: course.title,
    // Campos opcionais de atividade
    lastActivityAt: supabasePost.updated_at ? new Date(supabasePost.updated_at) : undefined,
    recentAvatars: [], // Será preenchido se houver dados
  };
}

/**
 * Converte blocos de PostContent para formato de string HTML para armazenamento no banco
 */
export function convertBlocksToContent(blocks: any[]): string {
  // Se não há blocos, retorna string vazia
  if (!blocks || blocks.length === 0) {
    return '';
  }

  // Para simplificar, vamos converter apenas blocos de texto em HTML
  // Em uma implementação real, você poderia serializar todos os blocos em JSON
  const textBlocks = blocks
    .filter(block => block.type === 'text')
    .map(block => block.content)
    .join('');

  return textBlocks || '';
}

