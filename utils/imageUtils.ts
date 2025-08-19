// Image utilities for local-first image loading with fallback to external URLs

/**
 * Convert game title to filename-safe format
 */
export const sanitizeGameTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[®™]/g, '') // Remove trademark symbols
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
};

/**
 * Generate local image path from game title (content folder)
 */
export const getLocalImagePath = (
  gameTitle: string,
  imageType: 'art' | 'wide_art' | 'screenshot',
  screenshotIndex?: number
): string => {
  const safeName = sanitizeGameTitle(gameTitle);
  const base = `/content/games/${safeName}`;

  if (imageType === 'screenshot' && screenshotIndex !== undefined) {
    return `${base}/${safeName}_screenshot_${screenshotIndex + 1}.jpg`;
  }

  return `${base}/${safeName}_${imageType}.jpg`;
};

/**
 * Check if local image exists by trying to load it
 */
export const checkImageExists = (imagePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imagePath;
  });
};

/**
 * Get image source - prefer the provided URL (now pointing to content folder)
 */
export const getImageSrc = async (
  _gameTitle: string,
  providedUrl: string,
  _imageType: 'art' | 'wide_art' | 'screenshot',
  _screenshotIndex?: number
): Promise<string> => {
  // The api now constructs correct content URLs, so just return it
  return providedUrl;
};

/**
 * Get all screenshot paths for a game - prefer provided list from API (already content URLs)
 */
export const getLocalScreenshots = async (
  _gameTitle: string,
  fallbackScreenshots: string[] = []
): Promise<string[]> => {
  return fallbackScreenshots;
};