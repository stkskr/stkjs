/**
 * Utility functions for portfolio image path handling
 * Uses build-time generated manifest for zero network requests
 */

import imageManifest from '../data/image-manifest.json';

// Placeholder SVG for items without images
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Get thumbnail path for a portfolio item (synchronous, no network requests!)
 * @param id - Portfolio item id (e.g., 'lg-2023-new-years-message')
 * @returns Thumbnail path or placeholder
 */
export function getThumbnailPath(id) {
  const item = imageManifest[id];
  return item?.thumbnail || PLACEHOLDER_SVG;
}

/**
 * Get slider images for a portfolio item (synchronous, no network requests!)
 * Returns single image or carousel images
 * @param id - Portfolio item id
 * @returns Array of image paths
 */
export function getFullImages(id) {
  const item = imageManifest[id];
  return item?.slider || [];
}

/**
 * Preload critical images for performance
 */
export function preloadImage(url) {
  if (url === PLACEHOLDER_SVG) return; // Don't preload placeholder

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}
