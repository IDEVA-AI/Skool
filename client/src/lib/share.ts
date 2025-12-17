/**
 * Utilitário para compartilhamento de conteúdo
 * Usa Web Share API quando disponível, ou copia para clipboard
 */

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export async function shareContent(data: ShareData): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  // Tentar usar Web Share API (disponível em mobile e alguns browsers)
  if (navigator.share && isMobileDevice()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return { success: true, method: 'native' };
    } catch (error) {
      // Usuário cancelou ou erro - fall back para clipboard
      if ((error as Error).name === 'AbortError') {
        return { success: false, method: 'native' };
      }
    }
  }

  // Fallback: copiar para clipboard
  try {
    await navigator.clipboard.writeText(data.url);
    return { success: true, method: 'clipboard' };
  } catch (error) {
    // Fallback manual para browsers antigos
    const textArea = document.createElement('textarea');
    textArea.value = data.url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      return { success: true, method: 'clipboard' };
    } catch {
      textArea.remove();
      return { success: false, method: 'clipboard' };
    }
  }
}

function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function getPostUrl(postId: string | number, communitySlug?: string): string {
  const baseUrl = window.location.origin;
  if (communitySlug) {
    return `${baseUrl}/c/${communitySlug}/post/${postId}`;
  }
  return `${baseUrl}/post/${postId}`;
}
