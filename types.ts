
export type Language = 'ENG' | 'RUS' | 'UZB';

export interface NavigateOptions {
  game?: Game;
  filter?: string;
  search?: string;
  platform?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  subscription?: 'standard' | 'premium';
  createdAt: string;
}

export interface ApiError extends Error {
  code: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SearchFilters {
  search?: string;
  genre?: string;
  filter?: string;
  sort?: 'asc' | 'desc' | 'popularity';
  limit?: number;
  offset?: number;
}

export interface GameSession {
  id: string;
  gameId: number;
  userId: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  cost?: number;
}

export interface Game {
    id: number;
    title: string;
    genres: string[];
    image: string;
    wideImage?: string;
    rtx?: boolean;
    isFree?: boolean;
    stores?: ('steam' | 'epicgames' | 'gog' | 'uplay' | 'battlenet' | 'eaapp' | 'origin' | 'ubisoft' | 'xbox' | 'playstation' | 'nintendo' | 'rockstar' | 'itch' | 'humble' | 'microsoft')[];
    // New: optional mapping of store name -> external link
    storeLinks?: Record<string, string>;
    publisher?: string;
    ageRating?: string;
    description?: string;
    descriptions?: Record<Language, string>; // Multi-language descriptions
    screenshots?: string[];
}

export interface Banner {
    id: number;
    gameTitle: string;
    key: string;
    image: string;
    mobileImage?: string;
    label?: Record<Language, string>;
    title: Record<Language, string>;
    text: Record<Language, string>;
    isActive?: boolean;
    order?: number;
}

export interface BannerManifest {
    banners: Array<{
        id: number;
        gameTitle: string;
        key: string;
        label?: Record<Language, string>;
        title: Record<Language, string>;
        text: Record<Language, string>;
        isActive?: boolean;
        order?: number;
        assets?: {
            desktop?: string; // default: {key}-desktop.jpg
            mobile?: string; // default: {key}-mobile.jpg
        };
    }>;
}
