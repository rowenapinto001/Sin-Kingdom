export type ScreenName =
  | 'splash'
  | 'loading'
  | 'home'
  | 'modes'
  | 'missions'
  | 'bosses'
  | 'bodyguards'
  | 'shop'
  | 'garage'
  | 'weapons'
  | 'powerups'
  | 'outfits'
  | 'settings'
  | 'leaderboard'
  | 'daily'
  | 'profile'
  | 'addaIntro'
  | 'gameplay'
  | 'missionComplete'
  | 'runComplete'
  | 'gameOver';

export type ModeId = 'train' | 'plane' | 'ship' | 'restaurant' | 'training';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Gender = 'Male' | 'Female';
export type RankClass =
  | 'Champion'
  | 'Emerald'
  | 'Platinum'
  | 'Ruby'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'No Rank';

export interface BossCharacter {
  id: string;
  name: string;
  gender: Gender;
  style: string;
  abilities: string[];
  health: number;
  speed: number;
  shield: number;
}

export interface BodyguardCharacter {
  id: string;
  name: string;
  gender: Gender;
  role: string;
  unlockModeId: ModeId | 'starter';
  requiredMissions: number;
  price: number;
  powerLevel: number;
  specialAbility: string;
  health: number;
  speed: number;
  defense: number;
  attack: number;
  stealth: number;
  starter?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  modeIds: ModeId[];
  price: number;
  speed: number;
  armor: number;
  handling: number;
  fuel: number;
  escapeBoost: number;
  secretStorage: number;
}

export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  upgradeCost: number;
  temporary: boolean;
  power: number;
  secretAreas: string[];
}

export interface Powerup {
  id: string;
  name: string;
  price: number;
  effect: string;
  durationSeconds?: number;
}

export interface Mode {
  id: ModeId;
  name: string;
  ranked: boolean;
  totalMissions: number;
  tagline: string;
  locations: string[];
  accent: string;
}

export interface Mission {
  id: string;
  modeId: ModeId;
  missionNumber: number;
  runNumber: number;
  type: string;
  title: string;
  objective: string;
  location: string;
  dance?: string;
  secretArea?: string;
  miniBoss?: boolean;
  cashReward: number;
  gemReward: number;
  difficulty: number;
}

export interface MissionProgress {
  completedMissionIds: string[];
  activeBatch: number;
}

export interface LifeSystem {
  lives: number;
  maxLives: number;
  nextLifeAt: number | null;
}

export interface Inventory {
  vehicles: string[];
  weapons: Record<string, number>;
  outfits: string[];
  powerups: Record<string, number>;
  purchasedBodyguards: string[];
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  graphicsQuality: 'Low' | 'Medium' | 'High';
  controls: 'Floating joystick' | 'Fixed joystick' | 'Tap to move';
  language: string;
  notifications: boolean;
  account: 'Local Guest' | 'Supabase Ready';
}

export interface PlayerProfile {
  id: string;
  playerName: string;
  avatar: string;
  cash: number;
  gems: number;
  lifeSystem: LifeSystem;
  selectedBossId: string;
  selectedBodyguardId: string;
  selectedVehicleId: string;
  selectedWeaponId: string;
  selectedPowerupId: string;
  modeProgress: Record<ModeId, MissionProgress>;
  inventory: Inventory;
  settings: GameSettings;
  totalMissionsCompleted: number;
  totalRunsCompleted: number;
  totalKOs: number;
  cashEarned: number;
  gemsEarned: number;
  perfectRuns: number;
  noDamageMissions: number;
  fastestTimeSeconds: number;
  leaderboardScore: number;
  rankNumber: number;
}

export interface GameSession {
  modeId: ModeId;
  batch: number;
  missionIds: string[];
  currentIndex: number;
  runCash: number;
  runGems: number;
  runKOs: number;
  bossHealth: number;
  bodyguardHealth: number;
  startedAt: number;
  foundWeapons: string[];
  completedThisRun: string[];
}

export interface RewardResult {
  missionId?: string;
  cashEarned: number;
  gemsEarned: number;
  bonusGems: number;
  kos: number;
  stars: number;
  timeSeconds: number;
  bossDamageTaken: number;
  bodyguardDamageTaken: number;
  lootCollected: string[];
  grade: 'S' | 'A' | 'B' | 'C';
}

export interface LeaderboardEntry {
  rankNumber: number;
  rankClass: RankClass;
  performanceScore: number;
  playerName: string;
  avatar: string;
  totalMissionsCompleted: number;
  totalRunsCompleted: number;
  totalKOs: number;
  currentBoss: string;
  currentBodyguard: string;
}
