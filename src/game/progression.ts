import { allMissions, bodyguardById, bosses, modes } from '../data/gameData';
import { GameSession, LeaderboardEntry, Mission, ModeId, PlayerProfile, RankClass, RewardResult } from '../data/types';

export const MAX_LIVES = 5;
export const LIFE_REFRESH_MS = 6 * 60 * 60 * 1000;
export const REVIVE_GEM_COST = 8;

export const emptyProgress = () =>
  modes.reduce(
    (progress, mode) => ({
      ...progress,
      [mode.id]: {
        completedMissionIds: [],
        activeBatch: 1,
      },
    }),
    {} as PlayerProfile['modeProgress'],
  );

export const createDefaultProfile = (): PlayerProfile => ({
  id: 'local-player',
  playerName: 'Rowena',
  avatar: 'RK',
  cash: 7500,
  gems: 32,
  lifeSystem: {
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    nextLifeAt: null,
  },
  selectedBossId: bosses[0].id,
  selectedBodyguardId: 'jake-stone',
  selectedVehicleId: 'classic-boss-car',
  selectedWeaponId: 'arcade-blade',
  selectedPowerupId: 'speed-boost',
  modeProgress: emptyProgress(),
  inventory: {
    vehicles: ['classic-boss-car'],
    weapons: { 'arcade-blade': 1 },
    outfits: ['Midnight Suit'],
    powerups: { 'speed-boost': 2, shield: 1 },
    purchasedBodyguards: ['jake-stone'],
  },
  settings: {
    sound: true,
    music: true,
    graphicsQuality: 'High',
    controls: 'Floating joystick',
    language: 'English',
    notifications: true,
    account: 'Local Guest',
  },
  totalMissionsCompleted: 0,
  totalRunsCompleted: 0,
  totalKOs: 0,
  cashEarned: 0,
  gemsEarned: 0,
  perfectRuns: 0,
  noDamageMissions: 0,
  fastestTimeSeconds: 999,
  leaderboardScore: 0,
  rankNumber: 12000,
});

export const hydrateLives = (profile: PlayerProfile, now = Date.now()): PlayerProfile => {
  const { lifeSystem } = profile;
  if (lifeSystem.lives >= lifeSystem.maxLives || !lifeSystem.nextLifeAt) {
    return profile;
  }

  if (now < lifeSystem.nextLifeAt) {
    return profile;
  }

  const refreshes = Math.floor((now - lifeSystem.nextLifeAt) / LIFE_REFRESH_MS) + 1;
  const lives = Math.min(lifeSystem.maxLives, lifeSystem.lives + refreshes);
  return {
    ...profile,
    lifeSystem: {
      ...lifeSystem,
      lives,
      nextLifeAt: lives >= lifeSystem.maxLives ? null : lifeSystem.nextLifeAt + refreshes * LIFE_REFRESH_MS,
    },
  };
};

export const spendLife = (profile: PlayerProfile, now = Date.now()): PlayerProfile => {
  if (profile.lifeSystem.lives <= 0) {
    return profile;
  }

  const lives = profile.lifeSystem.lives - 1;
  return {
    ...profile,
    lifeSystem: {
      ...profile.lifeSystem,
      lives,
      nextLifeAt: lives < profile.lifeSystem.maxLives && !profile.lifeSystem.nextLifeAt ? now + LIFE_REFRESH_MS : profile.lifeSystem.nextLifeAt,
    },
  };
};

export const countdownText = (nextLifeAt: number | null, now = Date.now()) => {
  if (!nextLifeAt || nextLifeAt <= now) return 'Ready';
  const seconds = Math.ceil((nextLifeAt - now) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getMissionsForBatch = (modeId: ModeId, batch: number): Mission[] => {
  const start = (batch - 1) * 5 + 1;
  const end = start + 4;
  return allMissions.filter((mission) => mission.modeId === modeId && mission.missionNumber >= start && mission.missionNumber <= end);
};

export const getCompletedCountForMode = (profile: PlayerProfile, modeId: ModeId) =>
  profile.modeProgress[modeId]?.completedMissionIds.length ?? 0;

export const isMissionCompleted = (profile: PlayerProfile, missionId: string) =>
  Object.values(profile.modeProgress).some((progress) => progress.completedMissionIds.includes(missionId));

export const getFirstIncompleteIndex = (profile: PlayerProfile, modeId: ModeId, batch: number) => {
  const missionIds = getMissionsForBatch(modeId, batch).map((mission) => mission.id);
  const completed = profile.modeProgress[modeId].completedMissionIds;
  const index = missionIds.findIndex((id) => !completed.includes(id));
  return index === -1 ? 0 : index;
};

export const canStartRun = (profile: PlayerProfile, modeId: ModeId) => {
  const isTraining = modeId === 'training';
  return isTraining || profile.lifeSystem.lives > 0;
};

export const createSession = (profile: PlayerProfile, modeId: ModeId): GameSession => {
  const batch = profile.modeProgress[modeId].activeBatch;
  const missions = getMissionsForBatch(modeId, batch);
  const guard = bodyguardById(profile.selectedBodyguardId);
  return {
    modeId,
    batch,
    missionIds: missions.map((mission) => mission.id),
    currentIndex: getFirstIncompleteIndex(profile, modeId, batch),
    runCash: 0,
    runGems: 0,
    runKOs: 0,
    bossHealth: modeId === 'training' ? 100 : 88,
    bodyguardHealth: Math.min(100, guard.health),
    startedAt: Date.now(),
    foundWeapons: [],
    completedThisRun: [],
  };
};

export const createMissionReward = (mission: Mission, bossHealth: number, bodyguardHealth: number, elapsedSeconds: number): RewardResult => {
  const damageTaken = Math.max(0, 200 - bossHealth - bodyguardHealth);
  const stars = damageTaken < 12 ? 3 : damageTaken < 35 ? 2 : 1;
  const grade = stars === 3 && elapsedSeconds < 55 ? 'S' : stars === 3 ? 'A' : stars === 2 ? 'B' : 'C';
  const kos = mission.miniBoss ? 5 : 2 + (mission.difficulty % 4);
  return {
    missionId: mission.id,
    cashEarned: mission.cashReward,
    gemsEarned: mission.gemReward,
    bonusGems: 0,
    kos,
    stars,
    timeSeconds: elapsedSeconds,
    bossDamageTaken: 100 - bossHealth,
    bodyguardDamageTaken: 100 - bodyguardHealth,
    lootCollected: [mission.secretArea ? `Secret find: ${mission.secretArea}` : 'Gem loot', mission.dance ? mission.dance : 'Cash stack'],
    grade,
  };
};

export const calculateLeaderboardScore = (profile: PlayerProfile) =>
  profile.totalMissionsCompleted * 320 +
  profile.totalRunsCompleted * 950 +
  profile.totalKOs * 45 +
  profile.cashEarned * 0.05 +
  profile.gemsEarned * 80 +
  profile.perfectRuns * 1200 +
  profile.noDamageMissions * 350 +
  Math.max(0, 900 - profile.fastestTimeSeconds) * 12;

export const rankNumberFromScore = (score: number) => {
  if (score <= 0) return 12000;
  return Math.max(1, Math.round(12000 - Math.min(11999, score / 18)));
};

export const rankClassForRank = (rankNumber: number): RankClass => {
  if (rankNumber <= 100) return 'Champion';
  if (rankNumber <= 500) return 'Emerald';
  if (rankNumber <= 1000) return 'Platinum';
  if (rankNumber <= 2000) return 'Ruby';
  if (rankNumber <= 3000) return 'Gold';
  if (rankNumber <= 7000) return 'Silver';
  if (rankNumber <= 10000) return 'Bronze';
  return 'No Rank';
};

export const applyMissionComplete = (profile: PlayerProfile, session: GameSession, reward: RewardResult) => {
  const missionId = reward.missionId;
  if (!missionId) return profile;
  const modeProgress = profile.modeProgress[session.modeId];
  const alreadyComplete = modeProgress.completedMissionIds.includes(missionId);
  const ranked = session.modeId !== 'training';
  const nextCompleted = alreadyComplete ? modeProgress.completedMissionIds : [...modeProgress.completedMissionIds, missionId];
  const nextProfile: PlayerProfile = {
    ...profile,
    cash: profile.cash + reward.cashEarned,
    gems: profile.gems + reward.gemsEarned,
    modeProgress: {
      ...profile.modeProgress,
      [session.modeId]: {
        ...modeProgress,
        completedMissionIds: nextCompleted,
      },
    },
    totalMissionsCompleted: ranked && !alreadyComplete ? profile.totalMissionsCompleted + 1 : profile.totalMissionsCompleted,
    totalKOs: ranked ? profile.totalKOs + reward.kos : profile.totalKOs,
    cashEarned: ranked ? profile.cashEarned + reward.cashEarned : profile.cashEarned,
    gemsEarned: ranked ? profile.gemsEarned + reward.gemsEarned : profile.gemsEarned,
    noDamageMissions: ranked && reward.bossDamageTaken === 0 && reward.bodyguardDamageTaken === 0 ? profile.noDamageMissions + 1 : profile.noDamageMissions,
    fastestTimeSeconds: ranked ? Math.min(profile.fastestTimeSeconds, reward.timeSeconds) : profile.fastestTimeSeconds,
  };
  return refreshRank(nextProfile);
};

export const applyRunComplete = (profile: PlayerProfile, session: GameSession, bonusGems: number, perfectRun: boolean) => {
  const ranked = session.modeId !== 'training';
  const progress = profile.modeProgress[session.modeId];
  const nextBatch = Math.min(progress.activeBatch + 1, Math.ceil((session.modeId === 'training' ? 25 : 100) / 5));
  const nextProfile: PlayerProfile = {
    ...profile,
    gems: profile.gems + bonusGems,
    gemsEarned: ranked ? profile.gemsEarned + bonusGems : profile.gemsEarned,
    totalRunsCompleted: ranked ? profile.totalRunsCompleted + 1 : profile.totalRunsCompleted,
    perfectRuns: ranked && perfectRun ? profile.perfectRuns + 1 : profile.perfectRuns,
    modeProgress: {
      ...profile.modeProgress,
      [session.modeId]: {
        ...progress,
        activeBatch: nextBatch,
      },
    },
  };
  return refreshRank(nextProfile);
};

export const refreshRank = (profile: PlayerProfile): PlayerProfile => {
  const leaderboardScore = Math.round(calculateLeaderboardScore(profile));
  const rankNumber = rankNumberFromScore(leaderboardScore);
  return {
    ...profile,
    leaderboardScore,
    rankNumber,
  };
};

export const toLeaderboardEntry = (profile: PlayerProfile, bossName: string, bodyguardName: string): LeaderboardEntry => ({
  rankNumber: profile.rankNumber,
  rankClass: rankClassForRank(profile.rankNumber),
  performanceScore: profile.leaderboardScore,
  playerName: profile.playerName,
  avatar: profile.avatar,
  totalMissionsCompleted: profile.totalMissionsCompleted,
  totalRunsCompleted: profile.totalRunsCompleted,
  totalKOs: profile.totalKOs,
  currentBoss: bossName,
  currentBodyguard: bodyguardName,
});
