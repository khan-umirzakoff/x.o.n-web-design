
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
    stores?: ('steam' | 'epicgames' | 'gog' | 'uplay' | 'battlenet')[];
    publisher?: string;
    ageRating?: string;
    description?: string;
    screenshots?: string[];
}
