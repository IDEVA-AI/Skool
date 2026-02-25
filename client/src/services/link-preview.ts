import { supabase } from '@/lib/supabase';

export interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

/**
 * Fetch link preview via Edge Function
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(
      `${supabaseUrl}/functions/v1/link-preview?url=${encodeURIComponent(url)}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    return data as LinkPreviewData;
  } catch {
    return null;
  }
}
