export type ReactionType = 'like' | 'love' | 'laugh';

export interface Reaction {
  id: string;
  type: ReactionType;
  userId: string;
  userName: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  reactions: Reaction[];
  parentId?: string; // For threaded comments
  replies?: Comment[]; // Nested replies
}

export interface Post {
  id: string;
  title: string;
  content: string; // Fallback para posts antigos
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: 'admin' | 'user'; // Role badge
  createdAt: Date;
  reactions: Reaction[];
  comments: Comment[];
  commentCount: number;
  // Novos campos para feed completo
  blocks?: PostBlock[]; // Conteúdo baseado em blocos
  pinned?: boolean; // Post fixado
  category?: string; // Categoria/tag opcional
  lastActivityAt?: Date; // Última atividade
  lastActivityType?: 'comment' | 'reaction'; // Tipo de atividade
  recentAvatars?: string[]; // Avatares de quem interagiu recentemente
}

export interface PostBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'link';
  content: string;
  metadata?: {
    url?: string;
    alt?: string;
    width?: number;
    height?: number;
    thumbnail?: string;
  };
}

export type PostContent = PostBlock[];

