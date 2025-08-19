import { Game, User, Language, Banner, BannerManifest } from '../types';
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
  stores?: ('steam' | 'epicgames' | 'gog' | 'uplay' | 'battlenet')[];
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
    const modules = import.meta.glob('../content/banners/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
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
  } catch (e) {
    return [];
  }
};

const CONTENT_BANNERS: Banner[] = loadBannersFromContent();
const loadGamesFromContent = (): Game[] => {
  try {
    // Glob all manifests if any exist. If none, this returns an empty object.
    const modules = import.meta.glob('../content/games/**/game.json', { eager: true, import: 'default' }) as Record<string, unknown>;

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
  } catch (e) {
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
const topGamesData: Game[] = [
  { 
    id: 1, 
    title: 'Genshin Impact', 
    genres: ['Adventure', 'RPG'], 
    isFree: true,
    image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/genshin_impact_art.jpg', 
    wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/genshin_impact_wide_art.jpg',
    stores: [],
    publisher: 'Cognosphere PTE. LTD.',
    ageRating: '16',
    description: 'Genshin Impact is an action role-playing game developed by miHoYo, featuring an open-world environment and action-based battle system using elemental magic and character-switching.',
    screenshots: [
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/genshin_impact/genshin_impact_screenshot_1.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/genshin_impact/genshin_impact_screenshot_2.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/genshin_impact/genshin_impact_screenshot_3.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/genshin_impact/genshin_impact_screenshot_4.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/genshin_impact/genshin_impact_screenshot_5.jpg',
    ]
  },
  { 
    id: 2, 
    title: 'Fortnite®', 
    genres: ['Action', 'Shooter'], 
    isFree: true,
    image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/fortnite_art.jpg', 
    wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/fortnite_wide_art.jpg', 
    rtx: true, 
    stores: ['epicgames'],
    publisher: 'Epic Games',
    ageRating: '12'
  },
  { 
    id: 3, 
    title: 'Counter-Strike 2', 
    genres: ['Action', 'Shooter'], 
    isFree: true,
    image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/counter_strike_4_art.jpg', 
    wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/counter_strike_4_hero_art.jpg', 
    stores: ['steam'],
    publisher: 'Valve Software',
    ageRating: '18',
    description: 'For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe. And now the next chapter in the CS story is about to begin. This is Counter-Strike 2.',
    screenshots: [
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_1.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_2.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_3.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_4.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_5.jpg',
        'https://gfn.am/games/wp-content/themes/gfngames/img/games/counter_strike_4/counter_strike_4_screenshot_6.jpg'
    ]
  },
  { id: 4, title: 'Dota 2®', genres: ['Action', 'MOBA'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dota_2_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dota_2_art.jpg', stores: ['steam'] },
  { id: 5, title: 'Zenless Zone Zero', genres: ['Action', 'Adventure'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/zenless_zone_zero_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/zenless_zone_zero_art.jpg', stores: [] },
  { id: 6, title: 'Honkai: Star Rail', genres: ['RPG', 'MMO'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/honkai:_star_rail_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/honkai:_star_rail_art.jpg', stores: [] },
  { id: 7, title: 'Wuthering Waves', genres: ['Action', 'Adventure'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/wuthering_waves_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/wuthering_waves_art.jpg', stores: ['epicgames'] },
  { id: 8, title: 'Rust', genres: ['Action', 'Adventure'], wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/rust_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/rust_art.jpg', stores: ['steam'] },
  { id: 9, title: 'War Thunder', genres: ['Action', 'Simulation'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/war_thunder_s_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/war_thunder_s_art.jpg', stores: ['steam'] },
  { id: 10, title: 'Path of Exile', genres: ['Adventure', 'RPG'], isFree: true, wideImage: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/path_of_exile_wide_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/path_of_exile_01_art.jpg', stores: ['epicgames', 'steam'] },
];

const genresData = [
  { title: 'Action', icon: '/assets/images/icons/genres/action.svg', slug: 'action' },
  { title: 'Adventure', icon: '/assets/images/icons/genres/adventures.svg', slug: 'adventure' },
  { title: 'Racing', icon: '/assets/images/icons/genres/racing.svg', slug: 'racing' },
  { title: 'Simulation', icon: '/assets/images/icons/genres/simulator.svg', slug: 'simulation' },
  { title: 'Strategy', icon: '/assets/images/icons/genres/strategy.svg', slug: 'strategy' },
];

const otherGames: Game[] = [
    { id: 11, title: 'Dead by Daylight', genres: ['Action', 'Horror'], wideImage: '', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dead_by_daylight_art.jpg', stores: ['epicgames', 'steam'] },
    { id: 12, title: 'Cyberpunk 2077®', publisher: 'CD PROJEKT RED', ageRating: '18', genres: ['Action', 'Adventure', 'RPG'], rtx: true, wideImage: 'https://gfn.am/games/wp-content/themes/gfngames/img/games/cyberpunk_2077/cyberpunk_2077_hero_art.jpg', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/cyberpunk_2077_art.jpg', stores: ['epicgames', 'gog', 'steam'] },
    { id: 13, title: 'Marvel Rivals', genres: ['Action', 'Shooter'], isFree: true, wideImage: '', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/marvel_rivals_art.jpg', stores: ['steam'] },
    { id: 14, title: 'S.T.A.L.K.E.R. 2: Heart of Chornobyl', genres: ['Action', 'Adventure', 'Shooter'], wideImage: '', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/s.t.a.l.k.e.r._2:_heart_of_chornobyl_art.jpg', stores: ['steam'] },
    { id: 15, title: 'DayZ', genres: ['Action', 'Adventure', 'Shooter'], wideImage: '', image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/dayz_art.jpg', stores: ['steam'] },
    { id: 16, title: "Baldur's Gate 3", genres: ['Adventure', 'RPG', 'Strategy'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/baldurs_gate_3_art.jpg', rtx: false, stores: ['steam', 'gog'] },
    { id: 17, title: "Alan Wake 2", genres: ['Adventure', 'Action', 'Horror'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/alan_wake_2_art.jpg', rtx: true, stores: ['epicgames'] },
    { id: 18, title: "The Witcher 3: Wild Hunt", genres: ['Adventure', 'RPG'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/the_witcher_3_art.jpg', rtx: true, stores: ['steam', 'gog', 'epicgames'] },
    { id: 19, title: "Apex Legends", genres: ['Action', 'Shooter', 'MMO'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/apex_legends_art.jpg', stores: ['steam'] },
    { id: 20, title: "League of Legends", genres: ['Action', 'MOBA'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/league_of_legends_art.jpg', stores: [] },
    { id: 21, title: "World of Warcraft", genres: ['MMO', 'RPG'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/world_of_warcraft_art.jpg', stores: ['battlenet'] },
    { id: 22, title: "Overwatch 2", genres: ['Action', 'Shooter'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/overwatch_2_art.jpg', stores: ['battlenet'] },
    { id: 23, title: "Destiny 2", genres: ['Action', 'Shooter', 'MMO'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/destiny_2_art.jpg', stores: ['steam'] },
    { id: 24, title: "Rocket League", genres: ['Racing', 'Sports'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/rocket_league_art.jpg', stores: ['epicgames'] },
    { id: 25, title: "Minecraft Dungeons", genres: ['Action', 'Adventure'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/minecraft_dungeons_art.jpg', stores: ['steam'] },
    { id: 26, title: "Phasmophobia", genres: ['Horror', 'Indie'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/phasmophobia_art.jpg', stores: ['steam'] },
    { id: 27, title: "Valheim", genres: ['Adventure', 'Indie'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/valheim_art.jpg', stores: ['steam'] },
    { id: 28, title: "Among Us", genres: ['Indie'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/among_us_art.jpg', stores: ['steam', 'epicgames'] },
    { id: 29, title: "Stardew Valley", genres: ['Indie', 'RPG', 'Simulation'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/stardew_valley_art.jpg', stores: ['steam', 'gog'] },
    { id: 30, title: "Forza Horizon 5", genres: ['Racing', 'Simulation'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/forza_horizon_5_art.jpg', rtx: true, stores: ['steam'] },
    { id: 31, title: 'Warhammer 40,000: Space Marine 2', genres: ['Action', 'Shooter'], image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/warhammer_40,000_space_marine_2_art.jpg', stores: ['steam'] },
];

const uniqueGames = new Map<number, Game>();
topGamesData.forEach(game => uniqueGames.set(game.id, game));
otherGames.forEach(game => uniqueGames.set(game.id, game));

const allGamesData: Game[] = Array.from(uniqueGames.values());

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
        } catch (error) {
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
        } catch (error) {
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
            } catch (error) {
              reject(new Error('Failed to fetch genres'));
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
            } catch (error) {
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
            } catch (error) {
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
        } catch(error) {
          reject(error instanceof Error ? error : new Error('Failed to update balance'));
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