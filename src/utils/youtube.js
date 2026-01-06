/**
 * YouTube utility functions for lazy-loading videos
 */

/**
 * Extract YouTube video ID from URL
 * Supports both youtube.com/watch?v=ID and youtu.be/ID formats
 */
export function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : '';
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
 * Replace YouTube facade with actual iframe
 */
export function activateYoutubeFacade(container, videoId, title = 'Video') {
  container.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1"
      title="${title}"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  `;
}
