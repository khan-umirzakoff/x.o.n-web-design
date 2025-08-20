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
export const STORE_ICON_MAP = {
    steam: '/assets/images/icons/support/steam.svg',
    epicgames: '/assets/images/icons/support/epicgames.svg',
    gog: '/assets/images/icons/support/gog.svg',
    eaapp: '/assets/images/icons/support/eaapp.svg',
    origin: '/assets/images/icons/support/eaapp.svg',
    uplay: '/assets/images/icons/support/uplay.svg',
    ubisoft: '/assets/images/icons/support/uplay.svg',
    battlenet: '/assets/images/icons/support/battlenet.svg',
    xbox: '/assets/images/icons/support/xbox.svg',
} as const;

export const resolveStoreIcon = (store: string): string | undefined => {
    const s = store.toLowerCase();
    if (s.includes('steam')) return STORE_ICON_MAP.steam;
    if (s.includes('epic')) return STORE_ICON_MAP.epicgames;
    if (s.includes('gog')) return STORE_ICON_MAP.gog;
    if (s.includes('ea') || s.includes('origin')) return STORE_ICON_MAP.eaapp;
    if (s.includes('uplay') || s.includes('ubisoft')) return STORE_ICON_MAP.uplay;
    if (s.includes('battle') || s.includes('blizzard')) return STORE_ICON_MAP.battlenet;
    if (s.includes('xbox')) return STORE_ICON_MAP.xbox;
    return undefined;
};

/**
 * Get image source - prefer the provided URL (now pointing to content folder)
 */
export const getImageSrc = async (
  _gameTitle: string,
  providedUrl: string,
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