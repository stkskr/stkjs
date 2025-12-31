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
 * Note: Not all videos have maxresdefault, so sd/hq are safer defaults
 */
export function getYoutubeThumbnail(videoId, quality = 'sd') {
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
