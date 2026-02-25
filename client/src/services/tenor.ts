const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY || '';
const TENOR_API_URL = 'https://tenor.googleapis.com/v2';

export interface TenorGif {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

function mapResults(results: any[]): TenorGif[] {
  return results.map((r: any) => {
    const gif = r.media_formats?.gif || r.media_formats?.mediumgif || {};
    const preview = r.media_formats?.tinygif || r.media_formats?.nanogif || {};
    return {
      id: r.id,
      title: r.title || r.content_description || '',
      url: gif.url || '',
      preview: preview.url || gif.url || '',
      width: preview.dims?.[0] || 200,
      height: preview.dims?.[1] || 200,
    };
  });
}

export async function searchGifs(query: string, limit = 20): Promise<TenorGif[]> {
  if (!TENOR_API_KEY) return [];

  const params = new URLSearchParams({
    q: query,
    key: TENOR_API_KEY,
    client_key: 'feedfy',
    limit: String(limit),
    media_filter: 'gif,tinygif',
  });

  const response = await fetch(`${TENOR_API_URL}/search?${params}`);
  if (!response.ok) return [];

  const data = await response.json();
  return mapResults(data.results || []);
}

export async function getTrendingGifs(limit = 20): Promise<TenorGif[]> {
  if (!TENOR_API_KEY) return [];

  const params = new URLSearchParams({
    key: TENOR_API_KEY,
    client_key: 'feedfy',
    limit: String(limit),
    media_filter: 'gif,tinygif',
  });

  const response = await fetch(`${TENOR_API_URL}/featured?${params}`);
  if (!response.ok) return [];

  const data = await response.json();
  return mapResults(data.results || []);
}
