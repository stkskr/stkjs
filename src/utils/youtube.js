/**
 * YouTube utility functions for lazy-loading videos
 */

/**
 * Extract YouTube video ID from URL
 * Supports both youtube.com/watch?v=ID and youtu.be/ID formats
 */
export function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  return match ? match[1] : '';
}

/**
 * Extract timestamp from YouTube URL
 * Supports &t=XXX or ?t=XXX format
 * @returns timestamp in seconds or null
 */
export function extractTimestamp(url) {
  const match = url.match(/[?&]t=(\d+)/);
  return match ? match[1] : null;
}

/**
 * Get YouTube thumbnail URL for a video
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality (maxres, sd, hq, mq, default)
 * Note: Tries maxres first, with fallback chain for reliability
 */
export function getYoutubeThumbnail(videoId, quality = 'maxres') {
  const qualityMap = {
    maxres: 'maxresdefault',
    sd: 'sddefault',
    hq: 'hqdefault',
    mq: 'mqdefault',
    default: 'default',
  };

  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get array of YouTube thumbnail URLs in fallback order (best to worst quality)
 * Used for progressive fallback when higher quality thumbnails fail to load
 * @param videoId - YouTube video ID
 * @returns Array of thumbnail URLs to try in order
 */
export function getYoutubeThumbnailUrls(videoId) {
  return [
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,  // 1920×1080
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,      // 640×480
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,      // 480×360
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,      // 320×180
  ];
}

/**
 * Get fallback thumbnail URL when current quality fails to load
 * @param videoId - YouTube video ID
 * @param currentQuality - Current quality that failed (e.g., 'maxresdefault', 'sddefault')
 * @returns Next quality thumbnail URL in the fallback chain
 */
export function getFallbackThumbnail(videoId, currentQuality) {
  const fallbackChain = [
    'maxresdefault',  // 1920×1080
    'sddefault',      // 640×480
    'hqdefault',      // 480×360
    'mqdefault',      // 320×180
    'default'         // 120×90 (always available)
  ];

  const currentIndex = fallbackChain.indexOf(currentQuality);
  if (currentIndex >= 0 && currentIndex < fallbackChain.length - 1) {
    const nextQuality = fallbackChain[currentIndex + 1];
    return `https://i.ytimg.com/vi/${videoId}/${nextQuality}.jpg`;
  }

  // Last resort - default quality always exists
  return `https://i.ytimg.com/vi/${videoId}/default.jpg`;
}

/**
 * Resolve the best available YouTube thumbnail by testing each quality
 * Avoids timing issues with img.onerror by using a separate Image instance
 * Uses size heuristics to detect gray placeholder images that load but are fake
 * @param videoId - YouTube video ID
 * @param onResolved - Callback function that receives (url, quality, width, height) when a real thumbnail is found
 */
export function resolveYoutubeThumbnail(videoId, onResolved) {
  const candidates = [
    { quality: 'maxresdefault', minWidth: 640 },
    { quality: 'sddefault',     minWidth: 400 },
    { quality: 'hqdefault',     minWidth: 400 },
    { quality: 'mqdefault',     minWidth: 200 },
    { quality: 'default',       minWidth: 0   }
  ];

  let index = 0;

  function tryNext() {
    if (index >= candidates.length) {
      return;
    }

    const { quality, minWidth } = candidates[index++];
    const url = `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
    const img = new Image();

    img.onload = function() {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      console.log('[resolveYoutubeThumbnail]', { videoId, quality, url, w, h, minWidth });

      // Heuristic: if we expected a large thumbnail but got something tiny,
      // treat it as a placeholder and try the next quality.
      if (w < minWidth && index < candidates.length) {
        console.log('[resolveYoutubeThumbnail] size too small, trying next quality');
        tryNext();
        return;
      }

      if (typeof onResolved === 'function') {
        onResolved(url, quality, w, h);
      }
    };

    img.onerror = function() {
      console.log('[resolveYoutubeThumbnail] load error for', quality, 'trying next');
      // 404 or other network error, move on to the next quality
      tryNext();
    };

    img.src = url;
  }

  tryNext();
}

/**
 * Replace YouTube facade with actual iframe
 */
export function activateYoutubeFacade(container, videoId, title = 'Video', timestamp = null) {
  const timestampParam = timestamp ? `&start=${timestamp}` : '';
  container.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1${timestampParam}"
      title="${title}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  `;
}
