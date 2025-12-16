import { useEffect, useState } from "react";

interface VideoPlayerProps {
  embedUrl?: string | null;
  title?: string;
}

export function VideoPlayer({ embedUrl, title }: VideoPlayerProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | null>(null);

  useEffect(() => {
    if (!embedUrl) {
      setVideoId(null);
      setVideoType(null);
      return;
    }

    // YouTube
    const youtubeMatch = embedUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (youtubeMatch) {
      setVideoId(youtubeMatch[1]);
      setVideoType("youtube");
      return;
    }

    // Vimeo
    const vimeoMatch = embedUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      setVideoId(vimeoMatch[1]);
      setVideoType("vimeo");
      return;
    }

    // Se já for uma URL de embed completa
    if (embedUrl.includes("youtube.com/embed") || embedUrl.includes("youtu.be")) {
      const embedMatch = embedUrl.match(/embed\/([^"&?\/\s]{11})/);
      if (embedMatch) {
        setVideoId(embedMatch[1]);
        setVideoType("youtube");
        return;
      }
    }

    if (embedUrl.includes("vimeo.com/video")) {
      const embedMatch = embedUrl.match(/video\/(\d+)/);
      if (embedMatch) {
        setVideoId(embedMatch[1]);
        setVideoType("vimeo");
        return;
      }
    }

    setVideoId(null);
    setVideoType(null);
  }, [embedUrl]);

  if (!embedUrl || !videoId || !videoType) {
    return (
      <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Nenhum vídeo disponível</p>
          {title && <p className="text-xs mt-1">{title}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-900">
      {videoType === "youtube" && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
      {videoType === "vimeo" && (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title || "Video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  );
}

