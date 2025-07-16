import { Game, User } from '../types';

// --- Mock User Database ---
// In a real app, this would be a database. We use sessionStorage for better security.
const MOCK_USERS_KEY = 'mock_users_db';

// The stored user includes the password, but the User type for the app does not.
type StoredUser = User & { password?: string };

const getMockUsers = (): Record<string, StoredUser> => {
  try {
    const users = sessionStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : {};
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
  { title: 'Action', icon: 'https://gfn.am/games/wp-content/themes/gfngames/img/genres/action.svg', slug: 'action' },
  { title: 'Adventure', icon: 'https://gfn.am/games/wp-content/themes/gfngames/img/genres/adventures.svg', slug: 'adventure' },
  { title: 'Racing', icon: 'https://gfn.am/games/wp-content/themes/gfngames/img/genres/racing.svg', slug: 'racing' },
  { title: 'Simulation', icon: 'https://gfn.am/games/wp-content/themes/gfngames/img/genres/simulator.svg', slug: 'simulation' },
  { title: 'Strategy', icon: 'https://gfn.am/games/wp-content/themes/gfngames/img/genres/strategy.svg', slug: 'strategy' },
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
    { id: 19, title: "Apex Legends", genres: ['Action', 'Shooter'], isFree: true, image: 'https://storage.googleapis.com/gfn-am-games-catalogue-assets/apex_legends_art.jpg', stores: ['steam'] },
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
    { id: 31, title: 'Warhammer 40,000: Space Marine 2', genres: ['Action', 'Shooter'], image: 'https://image.api.playstation.com/vulcan/ap/rnd/202308/1715/056972457d420c82cf5180f68d290623a31e8c25f4639909.png', stores: ['steam'] },
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
          let games: Game[] = [...allGamesData];

          if (options?.search) {
              const lowercasedQuery = options.search.toLowerCase();
              games = games.filter(game => 
                  game.title.toLowerCase().includes(lowercasedQuery) ||
                  game.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery))
              );
          } else if (options?.filter) {
              if (options.filter === 'Free-to-Play') {
                  games = games.filter(game => game.isFree);
              } else if (options.filter !== 'All Games') {
                  games = games.filter(game => game.genres.includes(options.filter!));
              }
          }
          
          if (options?.genre) {
            if (options.genre === 'Free-to-Play') {
              games = games.filter(g => g.isFree);
            } else {
              games = games.filter(g => g.genres.includes(options.genre!));
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
          resolve([...topGamesData]);
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
              const game = allGamesData.find(g => g.title === title);
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
              allGamesData.forEach(game => game.genres.forEach(g => genreSet.add(g.trim())));
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
  }
};
