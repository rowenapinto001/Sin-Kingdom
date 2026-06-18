import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateLives, createDefaultProfile, refreshRank } from '../game/progression';
import { PlayerProfile } from '../data/types';

const SAVE_KEY = 'sin-kingdom:player-profile:v1';

export interface SaveAdapter {
  loadProfile: () => Promise<PlayerProfile>;
  saveProfile: (profile: PlayerProfile) => Promise<void>;
  resetProfile: () => Promise<PlayerProfile>;
}

export const localSaveAdapter: SaveAdapter = {
  async loadProfile() {
    const stored = await AsyncStorage.getItem(SAVE_KEY);
    if (!stored) return createDefaultProfile();
    try {
      return refreshRank(hydrateLives(JSON.parse(stored) as PlayerProfile));
    } catch {
      return createDefaultProfile();
    }
  },
  async saveProfile(profile) {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(profile));
  },
  async resetProfile() {
    const profile = createDefaultProfile();
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(profile));
    return profile;
  },
};

export const supabaseReadyAdapterNotes = {
  futureTables: [
    'player_profiles',
    'mission_progress',
    'inventories',
    'leaderboard_entries',
    'life_refresh_events',
    'daily_reward_claims',
  ],
  syncStrategy: 'Local first. Replace localSaveAdapter with an authenticated Supabase adapter when backend tables exist.',
};
