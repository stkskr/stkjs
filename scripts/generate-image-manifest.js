import { readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '../public');
const thumbnailsDir = join(publicDir, 'assets/portfolio/thumbnails');
const sliderDir = join(publicDir, 'assets/portfolio/slider');

/**
 * Extract portfolio ID from filename
 * Examples:
 *   "01_lg-2023-new-years-message.jpg" → "lg-2023-new-years-message"
 *   "14_innisfree-brand-slogan_01.jpg" → "innisfree-brand-slogan"
 */
function extractId(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif)$/i, '');

  // Match pattern: ##_id or ##_id_## (carousel)
  const match = nameWithoutExt.match(/^\d+_([^_]+(?:_[^_]+)*?)(?:_\d+)?$/);

  return match ? match[1] : null;
}

/**
 * Check if filename is a carousel image
 */
function isCarouselImage(filename) {
  return /_\d{2}\.(jpg|jpeg|png|gif)$/i.test(filename);
}

/**
 * Get carousel number from filename
 */
function getCarouselNumber(filename) {
  const match = filename.match(/_(\d{2})\.(jpg|jpeg|png|gif)$/i);
  return match ? parseInt(match[1], 10) : null;
}

// Scan directories
const thumbnails = readdirSync(thumbnailsDir);
const sliderImages = readdirSync(sliderDir);

const manifest = {};

// Process thumbnails
thumbnails.forEach(filename => {
  if (filename.startsWith('.')) return; // Skip hidden files

  const id = extractId(filename);
  if (!id) return;

  if (!manifest[id]) {
    manifest[id] = {};
  }

  manifest[id].thumbnail = `/assets/portfolio/thumbnails/${filename}`;
});

// Process slider images
sliderImages.forEach(filename => {
  if (filename.startsWith('.')) return; // Skip hidden files

  const id = extractId(filename);
  if (!id) return;

  if (!manifest[id]) {
    manifest[id] = {};
  }

  if (isCarouselImage(filename)) {
    // Carousel image
    if (!manifest[id].slider) {
      manifest[id].slider = [];
    }

    const carouselNum = getCarouselNumber(filename);
    manifest[id].slider.push({
      path: `/assets/portfolio/slider/${filename}`,
      index: carouselNum
    });
  } else {
    // Single image
    manifest[id].slider = [`/assets/portfolio/slider/${filename}`];
  }
});

// Sort carousel images by index
Object.keys(manifest).forEach(id => {
  if (Array.isArray(manifest[id].slider) && manifest[id].slider[0]?.index !== undefined) {
    manifest[id].slider.sort((a, b) => a.index - b.index);
    manifest[id].slider = manifest[id].slider.map(item => item.path);
  }

  // Ensure all items have a slider property (empty array if no slider images)
  if (!manifest[id].slider) {
    manifest[id].slider = [];
  }
});

// Write manifest
const outputPath = join(__dirname, '../src/data/image-manifest.json');
writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Image manifest generated with ${Object.keys(manifest).length} portfolio items`);
console.log(`   Output: ${outputPath}`);
