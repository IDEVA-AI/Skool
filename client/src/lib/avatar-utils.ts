/**
 * Converte avatar_url do banco de dados para formato exibível
 * Se for base64 puro, adiciona o prefixo data:image
 * Se já for data URL ou HTTP URL, retorna como está
 */
export function getAvatarUrl(avatarUrl: string | null | undefined, fallbackName?: string): string | null {
  if (!avatarUrl) {
    // Se não há avatar, gerar um baseado no nome
    if (fallbackName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`;
    }
    return null;
  }

  // Se já é uma URL completa (data:image ou http), usar diretamente
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) {
    return avatarUrl;
  }

  // Se é base64 puro, adicionar prefixo
  return `data:image/png;base64,${avatarUrl}`;
}

