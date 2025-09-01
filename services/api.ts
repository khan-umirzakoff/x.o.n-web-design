// FIX: Removed reference to 'vite/client' to resolve 'Cannot find type definition file' error. This is a workaround due to the inability to configure TypeScript via tsconfig.json.
// The 'import.meta.glob' feature, which depends on these types, will now be accessed via a type assertion.

import { Game, User, Language, Banner } from '../types';
import { sanitizeGameTitle } from '../utils/imageUtils';

// --- Content-based games loader (MVP)
// If you add JSON manifests under content/games/**/game.json, we will auto-load them at build/runtime
// and map assets to content folder paths directly.
interface GameManifest {
  id?: number;
  title: string;
  genres: string[];
  isFree?: boolean;
  rtx?: boolean;
  stores?: ('steam' | 'epicgames' | 'gog' | 'uplay' | 'battlenet' | 'eaapp' | 'origin' | 'ubisoft' | 'xbox' | 'playstation' | 'nintendo' | 'rockstar' | 'itch' | 'humble' | 'microsoft')[];
  // New: allow external store links per store
  storeLinks?: Record<string, string>;
  publisher?: string;
  ageRating?: string;
  description?: string;
  descriptions?: Record<Language, string>;
  assets?: {
    coverArt?: string; // default: {folder}_art.jpg
    wideArt?: string; // default: {folder}_wide_art.jpg
    screenshots?: string[]; // default: {folder}_screenshot_1.jpg ...
  };
}

// Banner content loader
interface BannerManifestFile {
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

const loadBannersFromContent = (): Banner[] => {
  try {
    // FIX: Used a type assertion `(import.meta as any)` to bypass the TypeScript error "Property 'glob' does not exist on type 'ImportMeta'". This assumes the code runs in a Vite environment where this property is available at runtime.
    const modules = (import.meta as any).glob('../content/banners/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
    const entries = Object.entries(modules) as Array<[string, BannerManifestFile]>;
    if (!entries || entries.length === 0) return [];

    // We currently support a single file home.json, but support multiple files and merge
    const all: Banner[] = [];
    for (const [path, mf] of entries) {
      const normalized = path.replace(/\\/g, '/');
      const baseDirMatch = normalized.match(/(.*)\/[^/]+\.json$/);
      const baseDir = baseDirMatch ? baseDirMatch[1].replace(/^\.\./, '') : '../content/banners';

      mf.banners
        .filter(b => b.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach(b => {
          const desktop = b.assets?.desktop ?? `${b.key}-desktop.jpg`;
          const mobile = b.assets?.mobile ?? `${b.key}-mobile.jpg`;
          const base = `${baseDir}`.replace('..', '');
          const banner: Banner = {
            id: b.id,
            gameTitle: b.gameTitle,
            key: b.key,
            image: `${base}/${desktop}`.replace('/content', '/content'),
            mobileImage: `${base}/${mobile}`.replace('/content', '/content'),
            label: b.label,
            title: b.title,
            text: b.text,
            isActive: b.isActive ?? true,
            order: b.order,
          };
          all.push(banner);
        });
    }
    return all;
  } catch {
    return [];
  }
};

const CONTENT_BANNERS: Banner[] = loadBannersFromContent();
const loadGamesFromContent = (): Game[] => {
  try {
    // Glob all manifests if any exist. If none, this returns an empty object.
    // FIX: Used a type assertion `(import.meta as any)` to bypass the TypeScript error "Property 'glob' does not exist on type 'ImportMeta'". This assumes the code runs in a Vite environment where this property is available at runtime.
    const modules = (import.meta as any).glob('../content/games/**/game.json', { eager: true, import: 'default' }) as Record<string, unknown>;

    const entries = Object.entries(modules) as Array<[string, GameManifest]>;
    if (!entries || entries.length === 0) return [];

    // Map to Game[]
    const games: Game[] = entries.map(([path, mf], idx) => {
      // Extract folder name from path: e.g. ../content/games/lockdown_protocol/game.json -> lockdown_protocol
      const normalized = path.replace(/\\/g, '/');
      const m = normalized.match(/content\/games\/([^/]+)\/game\.json$/);
      const folder = m ? m[1] : sanitizeGameTitle(mf.title);

       const base = `/content/games/${folder}`;
      const cover = mf.assets?.coverArt ? `${base}/${mf.assets.coverArt}` : `${base}/${folder}_art.jpg`;
      const wide = mf.assets?.wideArt ? `${base}/${mf.assets.wideArt}` : `${base}/${folder}_wide_art.jpg`;
      const screenshots = (mf.assets?.screenshots && mf.assets.screenshots.length > 0)
        ? mf.assets.screenshots.map(name => `${base}/${name}`)
        : Array.from({ length: 6 }, (_, i) => `${base}/${folder}_screenshot_${i + 1}.jpg`);

      const game: Game = {
        id: mf.id ?? (idx + 1),
        title: mf.title,
        genres: mf.genres,
        image: cover,
        wideImage: wide,
        rtx: mf.rtx,
        isFree: mf.isFree,
        stores: mf.stores,
        // propagate storeLinks if provided by manifest
        storeLinks: mf.storeLinks,
        publisher: mf.publisher,
        ageRating: mf.ageRating,
        description: mf.description,
        descriptions: mf.descriptions,
        screenshots,
      };
      return game;
    });
    return games;
  } catch {
    // On any error (e.g., path not found), silently fallback to static data
    return [];
  }
};

const CONTENT_GAMES: Game[] = loadGamesFromContent();
// Use ONLY local content games throughout the app
const ACTIVE_GAMES: Game[] = CONTENT_GAMES;

// --- Mock User Database ---
// In a real app, this would be a database. We use sessionStorage for better security.
const MOCK_USERS_KEY = 'mock_users_db';

// The stored user includes the password, but the User type for the app does not.
type StoredUser = User & { password?: string };

const getMockUsers = (): Record<string, StoredUser> => {
  try {
    let users = sessionStorage.getItem(MOCK_USERS_KEY);
    if (!users) {
      const defaultUser: StoredUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: hashPassword('password'),
        balance: 10000,
        createdAt: new Date().toISOString(),
      };
      const initialUsers = { [defaultUser.email]: defaultUser };
      users = JSON.stringify(initialUsers);
      sessionStorage.setItem(MOCK_USERS_KEY, users);
    }
    return JSON.parse(users);
  } catch {
    return {};
  }
};

const saveMockUsers = (users: Record<string, StoredUser>) => {
  sessionStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

// Hash password before storing (simple implementation)
const hashPassword = (password: string): string => {
  // In a real app, use a proper hashing library
  return btoa(password + "salt_value");
};

// Data is now internal to this "service" file
const genresData = [
  { title: 'Action', icon: '/assets/images/icons/genres/action.svg', slug: 'action' },
  { title: 'Adventure', icon: '/assets/images/icons/genres/adventures.svg', slug: 'adventure' },
  { title: 'Racing', icon: '/assets/images/icons/genres/racing.svg', slug: 'racing' },
  { title: 'Simulation', icon: '/assets/images/icons/genres/simulator.svg', slug: 'simulation' },
  { title: 'Strategy', icon: '/assets/images/icons/genres/strategy.svg', slug: 'strategy' },
];

// Simulate network delay for demo purposes (reduced from 300ms to 100ms)
const DEMO_LATENCY = 100; // ms

// Instead of exporting data, we export a service object with async methods
export const api = {
  async getGames(options?: { filter?: string; search?: string; sort?: string; genre?: string; limit?: number }): Promise<Game[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let games: Game[] = [...ACTIVE_GAMES];

          // Handle filtering (from both filter and genre options for different pages)
          const activeFilter = options?.filter || options?.genre;
          if (activeFilter) {
              if (activeFilter === 'Free-to-Play') {
                  games = games.filter(game => game.isFree);
              } else if (activeFilter !== 'All Games') {
                  games = games.filter(game => game.genres.includes(activeFilter));
              }
          }

          // Handle searching on the (potentially) filtered list
          if (options?.search) {
              const lowercasedQuery = options.search.toLowerCase().trim();
              if (lowercasedQuery) {
                games = games.filter(game => 
                    game.title.toLowerCase().includes(lowercasedQuery) ||
                    game.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery))
                );
              }
          }
          
          if (options?.sort) {
            if (options.sort === 'asc') {
                games.sort((a, b) => a.title.localeCompare(b.title));
            } else if (options.sort === 'desc') {
                games.sort((a, b) => b.title.localeCompare(a.title));
            }
          }

          if(options?.limit) {
              games = games.slice(0, options.limit);
          }

          resolve(games);
        } catch {
          reject(new Error('Failed to fetch games'));
        }
      }, DEMO_LATENCY);
    });
  },

  async getTopGames(): Promise<Game[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Return top (first 10) from local content games only
          resolve([...ACTIVE_GAMES].slice(0, 10));
        } catch {
          reject(new Error('Failed to fetch top games'));
        }
      }, DEMO_LATENCY);
    });
  },
  
  async getStaticGenres(): Promise<{ title: string; icon: string; slug: string; }[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
              resolve([...genresData]);
            } catch {
              reject(new Error('Failed to fetch genres'));
            }
        }, DEMO_LATENCY);
    });
  },
  
  async getGameById(id: string): Promise<Game | undefined> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
              const game = ACTIVE_GAMES.find(g => g.id.toString() === id);
              resolve(game);
            } catch {
              reject(new Error('Failed to fetch game'));
            }
        }, DEMO_LATENCY);
    });
  },

  async getGameByTitle(title: string): Promise<Game | undefined> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
              const game = ACTIVE_GAMES.find(g => g.title === title);
              resolve(game);
            } catch {
              reject(new Error('Failed to fetch game'));
            }
        }, DEMO_LATENCY);
    });
  },

  async getAvailableFilters(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
              const genreSet = new Set<string>();
              ACTIVE_GAMES.forEach(game => game.genres.forEach(g => genreSet.add(g.trim())));
              resolve(Array.from(genreSet).sort());
            } catch {
              reject(new Error('Failed to fetch filters'));
            }
        }, DEMO_LATENCY);
    });
  },

  // --- Mock Auth API ---

  // Auth methods with improved security
async register(username: string, email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      if (Object.values(users).some(user => user.email === email)) {
        return reject(new Error('emailAlreadyExists'));
      }
      if (password.length < 6) {
        return reject(new Error('weakPassword'));
      }
      
      const newUser: StoredUser = { 
        id: Date.now(), 
        username, 
        email, 
        password: hashPassword(password),
        balance: 0,
        createdAt: new Date().toISOString()
      };
      users[email] = newUser;
      saveMockUsers(users);
      
      // Don't return password to the client
      const userToReturn = { ...newUser };
      delete userToReturn.password;
      resolve(userToReturn);
    }, DEMO_LATENCY * 5);
  });
},

async login(email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      const users = getMockUsers();
      const userRecord = Object.values(users).find(u => u.email === email);
      
      if (userRecord && userRecord.password === hashPassword(password)) {
        const userToReturn = { ...userRecord };
        delete userToReturn.password;
        resolve(userToReturn);
      } else {
        reject(new Error('invalidCredentials'));
        }
      }, DEMO_LATENCY * 5);
    });
  },

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, DEMO_LATENCY);
    });
  },

  async updateBalance(userId: number, topUpAmount: number): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getMockUsers();
          const userEmail = Object.keys(users).find(email => users[email].id === userId);

          if (userEmail && users[userEmail]) {
            users[userEmail].balance = (users[userEmail].balance || 0) + topUpAmount;
            saveMockUsers(users);

            const userToReturn = { ...users[userEmail] };
            delete userToReturn.password;
            resolve(userToReturn);
          } else {
            reject(new Error('userNotFound'));
          }
        } catch {
          reject(new Error('Failed to update balance'));
        }
      }, DEMO_LATENCY * 3);
    });
  },

  async getBanners(): Promise<Banner[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(CONTENT_BANNERS);
      }, DEMO_LATENCY);
    });
  },
};