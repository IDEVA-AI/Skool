import { User } from '@supabase/supabase-js';

/**
 * Tipos de ações que podem ser realizadas em posts
 */
export type PostAction = 'create' | 'read' | 'update' | 'delete' | 'moderate' | 'pin' | 'unpin';

/**
 * Tipos de ações que podem ser realizadas em comentários
 */
export type CommentAction = 'create' | 'read' | 'update' | 'delete' | 'moderate';

/**
 * Interface para um comentário do banco de dados
 */
export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

/**
 * Interface para um post do banco de dados
 * Compatível com a estrutura retornada pelo Supabase
 */
export interface Post {
  id: number;
  user_id: string;
  title: string;
  content: string;
  course_id: number;
  created_at: string;
  pinned?: boolean;
  updated_at?: string;
  users?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  courses?: {
    id: number;
    title?: string;
  };
}

/**
 * Interface para informações do usuário com role
 */
export interface UserWithRole {
  id: string;
  role?: 'admin' | 'student' | null;
}

/**
 * Verifica se um usuário pode realizar uma ação em um post
 * 
 * REGRAS:
 * - ADMIN: pode realizar todas as ações em qualquer post
 * - Usuários regulares: podem criar posts, ler todos os posts, 
 *   mas só podem editar/deletar seus próprios posts
 * 
 * @param user - Usuário autenticado (do Supabase Auth)
 * @param userRole - Role do usuário ('admin' | 'student' | null)
 * @param action - Ação a ser verificada
 * @param post - Post alvo (opcional, necessário para update/delete)
 * @returns true se o usuário pode realizar a ação
 */
export function can(
  user: User | null,
  userRole: 'admin' | 'student' | null | undefined,
  action: PostAction,
  post?: Post | null
): boolean {
  // Usuário não autenticado não pode fazer nada (exceto read, que pode ser público)
  if (!user) {
    return action === 'read';
  }

  // ADMIN tem acesso total a todas as ações
  if (userRole === 'admin') {
    return true;
  }

  // Para ações que não requerem um post específico
  if (action === 'create') {
    return true; // Qualquer usuário autenticado pode criar posts
  }

  if (action === 'read') {
    return true; // Qualquer usuário autenticado pode ler posts
  }

  // Para ações que requerem um post específico
  if (!post) {
    return false;
  }

  // Usuários regulares só podem editar/deletar seus próprios posts
  if (action === 'update' || action === 'delete') {
    return post.user_id === user.id;
  }

  // Moderação é apenas para admins (já verificado acima)
  if (action === 'moderate') {
    return false;
  }

  // Pin/Unpin é apenas para admins (já verificado acima)
  if (action === 'pin' || action === 'unpin') {
    return false;
  }

  return false;
}

/**
 * Verifica se um usuário pode realizar uma ação em um comentário
 * 
 * REGRAS:
 * - ADMIN: pode realizar todas as ações em qualquer comentário
 * - Usuários regulares: podem criar comentários, ler todos os comentários,
 *   mas só podem editar/deletar/moderar seus próprios comentários
 * 
 * @param user - Usuário autenticado (do Supabase Auth)
 * @param userRole - Role do usuário ('admin' | 'student' | null)
 * @param action - Ação a ser verificada
 * @param comment - Comentário alvo (opcional, necessário para update/delete/moderate)
 * @returns true se o usuário pode realizar a ação
 */
export function canComment(
  user: User | null,
  userRole: 'admin' | 'student' | null | undefined,
  action: CommentAction,
  comment?: Comment | null
): boolean {
  // Usuário não autenticado não pode fazer nada (exceto read, que pode ser público)
  if (!user) {
    return action === 'read';
  }

  // ADMIN tem acesso total a todas as ações em qualquer comentário
  if (userRole === 'admin') {
    return true;
  }

  // Para ações que não requerem um comentário específico
  if (action === 'create') {
    return true; // Qualquer usuário autenticado pode criar comentários
  }

  if (action === 'read') {
    return true; // Qualquer usuário autenticado pode ler comentários
  }

  // Para ações que requerem um comentário específico
  if (!comment) {
    return false;
  }

  // Usuários regulares só podem editar/deletar/moderar seus próprios comentários
  if (action === 'update' || action === 'delete' || action === 'moderate') {
    return comment.authorId === user.id;
  }

  return false;
}

/**
 * Hook helper para verificar permissões (para uso em componentes)
 * Retorna funções de verificação de permissão
 */
export function usePermissions(
  user: User | null,
  userRole: 'admin' | 'student' | null | undefined
) {
  return {
    canCreate: () => can(user, userRole, 'create'),
    canRead: () => can(user, userRole, 'read'),
    canUpdate: (post: Post | null) => can(user, userRole, 'update', post),
    canDelete: (post: Post | null) => can(user, userRole, 'delete', post),
    canModerate: (post: Post | null) => can(user, userRole, 'moderate', post),
    canPin: (post: Post | null) => can(user, userRole, 'pin', post),
    canUnpin: (post: Post | null) => can(user, userRole, 'unpin', post),
    isAdmin: () => userRole === 'admin',
    // Permissões para comentários
    canCommentUpdate: (comment: Comment | null) => canComment(user, userRole, 'update', comment),
    canCommentDelete: (comment: Comment | null) => canComment(user, userRole, 'delete', comment),
    canCommentModerate: (comment: Comment | null) => canComment(user, userRole, 'moderate', comment),
  };
}

