import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/embed/")[1]?.split("/")[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/shorts/")[1]?.split("/")[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (parsed.pathname.startsWith("/live/")) {
        const id = parsed.pathname.split("/live/")[1]?.split("/")[0]
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
    }

    return null
  } catch {
    return null
  }
}

export function getCloudflareStreamUrl(url: string): string | null {
  try {
    // Bare CF video ID: 32-char hex string (or longer UID)
    if (/^[a-f0-9]{32,}$/i.test(url.trim())) {
      return `https://iframe.videodelivery.net/${url.trim()}`;
    }
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // https://iframe.videodelivery.net/VIDEO_ID
    if (hostname === 'iframe.videodelivery.net') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://iframe.videodelivery.net/${id}` : null;
    }

    // https://cloudflarestream.com/VIDEO_ID/iframe
    // https://customer-XXX.cloudflarestream.com/VIDEO_ID/iframe
    if (hostname.includes('cloudflarestream.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://iframe.videodelivery.net/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}
