import {
  BodyguardCharacter,
  BossCharacter,
  LeaderboardEntry,
  Mission,
  Mode,
  ModeId,
  Powerup,
  Vehicle,
  Weapon,
} from './types';

export const GAME_TITLE = 'Sin Kingdom';
export const GAME_SUBTITLE = 'Shadow Boss: Escape Empire';

export const loadingTips = [
  'Protect the Boss at all costs.',
  'Complete all 5 missions to unlock the next run.',
  'Use gems to revive.',
  'Training mode does not affect rank.',
  'Search secret areas for stronger weapons.',
];

export const funnyDances = [
  'Moonwalk Escape Dance',
  'Robot Guard Dance',
  'Chicken Panic Dance',
  'Boss Victory Spin',
  'Restaurant Salsa Dance',
  'Ship Deck Shuffle',
  'Airport Penguin Walk',
  'Belly Dance',
  'Fake Cry Dance',
  'Freeze Dance Challenge',
];

export const secretAreas = [
  'behind train luggage',
  'airport storage room',
  'ship cargo container',
  'restaurant kitchen locker',
  'underground hideout chest',
  'hidden alley box',
  'secret vault room',
  'behind a fake wall',
  'locked vehicle trunk',
  'town secret areas',
];

export const modes: Mode[] = [
  {
    id: 'train',
    name: 'Train Escape',
    ranked: true,
    totalMissions: 100,
    tagline: 'Moving carriages, hidden exits, slapstick station escapes.',
    locations: ['luggage car', 'private cabin', 'roof walkway', 'dining carriage', 'hidden tunnel stop'],
    accent: '#f04c42',
  },
  {
    id: 'plane',
    name: 'Aeroplane Escape',
    ranked: true,
    totalMissions: 100,
    tagline: 'Airport stealth, runway boosts, private jet getaways.',
    locations: ['airport lounge', 'runway lane', 'hangar bay', 'aircraft aisle', 'private jet deck'],
    accent: '#58c9ff',
  },
  {
    id: 'ship',
    name: 'Ship Escape',
    ranked: true,
    totalMissions: 100,
    tagline: 'Cargo gems, deck chases, boat extraction zones.',
    locations: ['cargo dock', 'lower deck', 'luxury ship hall', 'speedboat pier', 'captain walkway'],
    accent: '#34d9a4',
  },
  {
    id: 'restaurant',
    name: 'Bar / Restaurant Takeover',
    ranked: true,
    totalMissions: 100,
    tagline: 'Kitchen lockers, rooftop routes, dance distractions.',
    locations: ['neon bar', 'restaurant floor', 'kitchen lane', 'rooftop patio', 'parking lot tunnel'],
    accent: '#ffbf3f',
  },
  {
    id: 'training',
    name: 'Training Mode',
    ranked: false,
    totalMissions: 25,
    tagline: 'Practice without losing rank or lives.',
    locations: ['hideout gym', 'practice alley', 'simulated train', 'mock airport', 'training dock'],
    accent: '#b58cff',
  },
];

export const bosses: BossCharacter[] = [
  {
    id: 'victor-kane',
    name: 'Victor Kane',
    gender: 'Male',
    style: 'Rich underground empire leader with a luxury suit, gold watch, and dark glasses.',
    abilities: ['Command Aura: nearby Bodyguard damage increases.', 'Cash Boost: earns +10% extra cash.', 'Fear Effect: weak rivals slow briefly.'],
    health: 100,
    speed: 72,
    shield: 10,
  },
  {
    id: 'selena-voss',
    name: 'Selena Voss',
    gender: 'Female',
    style: 'Smart boss queen in a black coat, silver accessories, and premium outfit.',
    abilities: ['Quick Escape: vehicle escape speed increases by 10%.', 'Silent Plan: alert rises slower.', 'Boss Shield: one small shield per mission.'],
    health: 92,
    speed: 86,
    shield: 18,
  },
];

const unlockedStats = (powerLevel: number) => ({
  health: 86 + powerLevel * 18,
  speed: 66 + powerLevel * 6,
  defense: 54 + powerLevel * 9,
  attack: 58 + powerLevel * 11,
  stealth: 48 + powerLevel * 8,
});

const bodyguard = (
  unlockModeId: ModeId,
  name: string,
  gender: 'Male' | 'Female',
  requiredMissions: number,
  price: number,
  powerLevel: number,
  specialAbility: string,
): BodyguardCharacter => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  gender,
  role: powerLevel === 5 ? 'Elite Bodyguard' : 'Unlockable Bodyguard',
  unlockModeId,
  requiredMissions,
  price,
  powerLevel,
  specialAbility,
  ...unlockedStats(powerLevel),
});

export const bodyguards: BodyguardCharacter[] = [
  {
    id: 'jake-stone',
    name: 'Jake Stone',
    gender: 'Male',
    role: 'Starter Bodyguard',
    unlockModeId: 'starter',
    requiredMissions: 0,
    price: 0,
    powerLevel: 0,
    specialAbility: 'Heavy Hit',
    health: 92,
    speed: 64,
    defense: 55,
    attack: 62,
    stealth: 42,
    starter: true,
  },
  bodyguard('train', 'Luna Cross', 'Female', 20, 5000, 1, 'Quick Dash'),
  bodyguard('train', 'Rex Viper', 'Male', 40, 10000, 2, 'Heavy Counter'),
  bodyguard('train', 'Ivy Shadow', 'Female', 60, 18000, 3, 'Silent Rescue'),
  bodyguard('train', 'Diesel Kane', 'Male', 80, 28000, 4, 'Iron Shield'),
  bodyguard('train', 'Nova Steel', 'Female', 100, 40000, 5, 'Ultimate Boss Guard'),
  bodyguard('plane', 'Sky Mira', 'Female', 20, 5000, 1, 'Air Dash'),
  bodyguard('plane', 'Ace Ryder', 'Male', 40, 10000, 2, 'Fast Reload'),
  bodyguard('plane', 'Vela Storm', 'Female', 60, 18000, 3, 'Silent Boarding'),
  bodyguard('plane', 'Hawk Blaze', 'Male', 80, 28000, 4, 'Runway Rush'),
  bodyguard('plane', 'Zara Jet', 'Female', 100, 40000, 5, 'Sky Queen Shield'),
  bodyguard('ship', 'Marina Frost', 'Female', 20, 5000, 1, 'Deck Dash'),
  bodyguard('ship', 'Captain Knox', 'Male', 40, 10000, 2, 'Anchor Guard'),
  bodyguard('ship', 'Aqua Shade', 'Female', 60, 18000, 3, 'Silent Swim'),
  bodyguard('ship', 'Titan Reef', 'Male', 80, 28000, 4, 'Storm Armor'),
  bodyguard('ship', 'Mira Storm', 'Female', 100, 40000, 5, 'Sea Queen Defense'),
  bodyguard('restaurant', 'Ruby Flame', 'Female', 20, 5000, 1, 'Crowd Slide'),
  bodyguard('restaurant', 'Blaze Knight', 'Male', 40, 10000, 2, 'Crowd Control'),
  bodyguard('restaurant', 'Stella Night', 'Female', 60, 18000, 3, 'Silent Entry'),
  bodyguard('restaurant', 'Bruno Lock', 'Male', 80, 28000, 4, 'Heavy Guard'),
  bodyguard('restaurant', 'Velvet Fox', 'Female', 100, 40000, 5, 'Restaurant Queen Power'),
];

export const weapons: Weapon[] = [
  { id: 'arcade-blade', name: 'Basic Arcade Blade', rarity: 'Common', price: 0, upgradeCost: 700, temporary: false, power: 20, secretAreas: ['starter kit'] },
  { id: 'stun-pistol', name: 'Stun Pistol', rarity: 'Common', price: 1200, upgradeCost: 900, temporary: true, power: 28, secretAreas: ['airport storage room', 'locked vehicle trunk'] },
  { id: 'smoke-launcher', name: 'Smoke Launcher', rarity: 'Rare', price: 2800, upgradeCost: 1600, temporary: true, power: 34, secretAreas: ['hidden alley box', 'restaurant kitchen locker'] },
  { id: 'energy-baton', name: 'Energy Baton', rarity: 'Rare', price: 3600, upgradeCost: 1900, temporary: false, power: 42, secretAreas: ['underground hideout chest', 'behind a fake wall'] },
  { id: 'knockback-rifle', name: 'Knockback Rifle', rarity: 'Epic', price: 7400, upgradeCost: 3300, temporary: true, power: 55, secretAreas: ['ship cargo container', 'secret vault room'] },
  { id: 'shield-device', name: 'Shield Device', rarity: 'Epic', price: 8200, upgradeCost: 3600, temporary: false, power: 50, secretAreas: ['secret vault room', 'town secret areas'] },
  { id: 'flash-grenade', name: 'Flash Grenade', rarity: 'Common', price: 900, upgradeCost: 650, temporary: true, power: 25, secretAreas: ['behind train luggage', 'airport storage room'] },
  { id: 'net-launcher', name: 'Net Launcher', rarity: 'Rare', price: 3900, upgradeCost: 2100, temporary: true, power: 40, secretAreas: ['ship cargo container', 'locked vehicle trunk'] },
  { id: 'drone-jammer', name: 'Drone Jammer', rarity: 'Epic', price: 9000, upgradeCost: 4200, temporary: false, power: 48, secretAreas: ['airport storage room', 'secret vault room'] },
  { id: 'silent-dart-blaster', name: 'Silent Dart Blaster', rarity: 'Legendary', price: 16000, upgradeCost: 7000, temporary: false, power: 68, secretAreas: ['behind a fake wall', 'town secret areas'] },
  { id: 'heavy-stun-hammer', name: 'Heavy Stun Hammer', rarity: 'Legendary', price: 18000, upgradeCost: 7600, temporary: false, power: 75, secretAreas: ['underground hideout chest', 'secret vault room'] },
];

export const vehicles: Vehicle[] = [
  { id: 'classic-boss-car', name: 'Classic Boss Car', modeIds: ['train', 'plane', 'restaurant', 'training'], price: 0, speed: 64, armor: 58, handling: 65, fuel: 75, escapeBoost: 20, secretStorage: 25 },
  { id: 'armored-suv', name: 'Armored SUV', modeIds: ['train', 'plane', 'restaurant'], price: 8500, speed: 58, armor: 90, handling: 55, fuel: 68, escapeBoost: 30, secretStorage: 65 },
  { id: 'sports-car', name: 'Sports Car', modeIds: ['train', 'plane', 'restaurant'], price: 14000, speed: 92, armor: 42, handling: 88, fuel: 62, escapeBoost: 72, secretStorage: 24 },
  { id: 'van', name: 'Van', modeIds: ['train', 'restaurant', 'training'], price: 4500, speed: 50, armor: 66, handling: 48, fuel: 84, escapeBoost: 24, secretStorage: 80 },
  { id: 'bike', name: 'Bike', modeIds: ['plane', 'restaurant', 'training'], price: 3000, speed: 84, armor: 24, handling: 95, fuel: 55, escapeBoost: 66, secretStorage: 10 },
  { id: 'boat', name: 'Boat', modeIds: ['ship', 'training'], price: 6500, speed: 72, armor: 60, handling: 70, fuel: 76, escapeBoost: 54, secretStorage: 45 },
  { id: 'train-cart-skin', name: 'Special Train Cart Skin', modeIds: ['train'], price: 9500, speed: 68, armor: 74, handling: 58, fuel: 90, escapeBoost: 45, secretStorage: 72 },
  { id: 'airport-buggy', name: 'Airport Buggy', modeIds: ['plane'], price: 5200, speed: 76, armor: 38, handling: 86, fuel: 66, escapeBoost: 50, secretStorage: 22 },
];

export const powerups: Powerup[] = [
  { id: 'speed-boost', name: 'Speed Boost', price: 600, effect: 'Move and escape faster.', durationSeconds: 8 },
  { id: 'shield', name: 'Shield', price: 750, effect: 'Absorbs the next cartoon hit.', durationSeconds: 10 },
  { id: 'invisible-mode', name: 'Invisible Mode', price: 1200, effect: 'Security alert rises slower.', durationSeconds: 5 },
  { id: 'extra-armor', name: 'Extra Armor', price: 950, effect: 'Bodyguard defense increases for one mission.' },
  { id: 'double-cash', name: 'Double Cash', price: 1600, effect: 'Mission cash reward doubles.' },
  { id: 'double-gems', name: 'Double Gems', price: 12, effect: 'Mission gem reward doubles.' },
  { id: 'slow-motion', name: 'Slow Motion', price: 900, effect: 'Rivals move slower briefly.', durationSeconds: 6 },
  { id: 'instant-smoke', name: 'Instant Escape Smoke', price: 1100, effect: 'Drops alert and opens a quick route.' },
  { id: 'boss-protection-shield', name: 'Boss Protection Shield', price: 1400, effect: 'Adds Boss shield for the mission.' },
  { id: 'revive-token', name: 'Revive Token', price: 20, effect: 'Premium continue token purchased with gems.' },
];

const missionTypes = [
  'Protection mission',
  'Escape mission',
  'Gem/cash collection mission',
  'Funny dance mission',
  'Secret weapon mission',
  'Boss escort mission',
  'Rival/security KO mission',
  'Vehicle chase mission',
  'Stealth mission',
  'Mini boss mission',
];

const modeObjectivePools: Record<Exclude<ModeId, 'training'>, string[]> = {
  train: [
    'Enter the train with the Boss secretly and keep the carriage calm.',
    'Collect 3 gem bags from the luggage area before security returns.',
    'Escort the Boss to the private cabin using slapstick distractions.',
    'Escape to the next carriage while rivals stumble through smoke.',
    'Open the safe, do Belly Dance, then reach the hidden exit.',
  ],
  plane: [
    'Penguin walk through airport security while the Boss slips past.',
    'Collect runway cash crates without filling the alert meter.',
    'Guide the Boss through the hangar and tag rival guards with foam.',
    'Sneak onto the private jet before the security sweep arrives.',
    'Find a secret weapon in storage and escape by buggy.',
  ],
  ship: [
    'Collect cargo gems and keep ship security chasing decoys.',
    'Ship Deck Shuffle near the crew to create a funny distraction.',
    'Escort the Boss across the luxury deck to the speedboat marker.',
    'Open a cargo container and store rare loot after the run.',
    'Defeat the deck captain with stun hits and reach extraction.',
  ],
  restaurant: [
    'Dance with customers and secretly collect table gems.',
    'Hug people to distract the manager while the Boss crosses the floor.',
    'Use a cartoon slap to clear the kitchen route.',
    'Find the kitchen locker weapon and escape through the rooftop tunnel.',
    'Do Restaurant Salsa, grab bonus cash, and leave before police arrive.',
  ],
};

export const rankedMissions: Mission[] = modes
  .filter((mode) => mode.ranked)
  .flatMap((mode) => {
    const objectives = modeObjectivePools[mode.id as Exclude<ModeId, 'training'>];
    return Array.from({ length: 100 }, (_, index) => {
      const missionNumber = index + 1;
      const runNumber = Math.ceil(missionNumber / 5);
      const type = missionTypes[index % missionTypes.length];
      const location = mode.locations[index % mode.locations.length];
      const dance = type.includes('dance') || index % 7 === 0 ? funnyDances[index % funnyDances.length] : undefined;
      const secretArea = type.includes('Secret') || index % 9 === 0 ? secretAreas[index % secretAreas.length] : undefined;
      const miniBoss = missionNumber % 10 === 0;
      const baseObjective = objectives[index % objectives.length];
      return {
        id: `${mode.id}-${missionNumber}`,
        modeId: mode.id,
        missionNumber,
        runNumber,
        type: miniBoss ? 'Mini boss mission' : type,
        title: `${mode.name} ${missionNumber}: ${miniBoss ? 'Elite Rival Checkpoint' : type.replace(' mission', '')}`,
        objective: dance
          ? `${baseObjective} Perform ${dance} at the right moment.`
          : secretArea
            ? `${baseObjective} Search the ${secretArea} for a stronger arcade weapon.`
            : baseObjective,
        location,
        dance,
        secretArea,
        miniBoss,
        cashReward: 420 + runNumber * 55 + (miniBoss ? 400 : 0),
        gemReward: missionNumber % 5 === 0 ? 2 : 1,
        difficulty: Math.min(10, 1 + Math.floor(index / 10)),
      };
    });
  });

const trainingObjectives = [
  'Learn joystick movement.',
  'Learn Boss follow controls.',
  'Learn Bodyguard attack controls.',
  'Learn shield protection.',
  'Learn how to collect gems.',
  'Learn stun weapon usage.',
  'Learn smoke bomb escape.',
  'Learn vehicle driving.',
  'Learn how to protect Boss in a crowd.',
  'Learn how to escape police alert zones.',
  'Practice Moonwalk Escape Dance.',
  'Practice Robot Guard Dance.',
  'Practice Chicken Panic Dance.',
  'Practice Restaurant Salsa Dance.',
  'Practice Ship Deck Shuffle.',
  'Practice Airport Penguin Walk.',
  'Practice Belly Dance.',
  'Practice Fake Cry Dance.',
  'Practice Freeze Dance Challenge.',
  'Practice hug distraction.',
  'Practice cartoon slap attack.',
  'Practice foam dagger tag attack.',
  'Practice secret weapon discovery.',
  'Practice boss shield activation.',
  'Complete final training escape.',
];

export const trainingMissions: Mission[] = trainingObjectives.map((objective, index) => ({
  id: `training-${index + 1}`,
  modeId: 'training',
  missionNumber: index + 1,
  runNumber: Math.ceil((index + 1) / 5),
  type: 'Training tutorial',
  title: `Training ${index + 1}`,
  objective,
  location: modes.find((mode) => mode.id === 'training')?.locations[index % 5] ?? 'hideout gym',
  dance: funnyDances.find((dance) => objective.includes(dance.replace(' Dance', ''))),
  cashReward: 120,
  gemReward: 0,
  difficulty: 1,
}));

export const allMissions = [...rankedMissions, ...trainingMissions];

export const missionById = (id: string) => allMissions.find((mission) => mission.id === id);
export const modeById = (id: ModeId) => modes.find((mode) => mode.id === id)!;
export const bossById = (id: string) => bosses.find((boss) => boss.id === id)!;
export const bodyguardById = (id: string) => bodyguards.find((guard) => guard.id === id)!;
export const weaponById = (id: string) => weapons.find((weapon) => weapon.id === id)!;
export const vehicleById = (id: string) => vehicles.find((vehicle) => vehicle.id === id)!;
export const powerupById = (id: string) => powerups.find((powerup) => powerup.id === id)!;

export const leaderboardSeeds: LeaderboardEntry[] = [
  { rankNumber: 52, rankClass: 'Champion', performanceScore: 284500, playerName: 'Neon Monarch', avatar: 'NM', totalMissionsCompleted: 396, totalRunsCompleted: 79, totalKOs: 1820, currentBoss: 'Selena Voss', currentBodyguard: 'Velvet Fox' },
  { rankNumber: 320, rankClass: 'Emerald', performanceScore: 224800, playerName: 'Gem Phantom', avatar: 'GP', totalMissionsCompleted: 305, totalRunsCompleted: 61, totalKOs: 1394, currentBoss: 'Victor Kane', currentBodyguard: 'Nova Steel' },
  { rankNumber: 870, rankClass: 'Platinum', performanceScore: 190300, playerName: 'Runway Ghost', avatar: 'RG', totalMissionsCompleted: 250, totalRunsCompleted: 50, totalKOs: 1101, currentBoss: 'Selena Voss', currentBodyguard: 'Zara Jet' },
  { rankNumber: 1450, rankClass: 'Ruby', performanceScore: 162000, playerName: 'Deck Drifter', avatar: 'DD', totalMissionsCompleted: 210, totalRunsCompleted: 42, totalKOs: 920, currentBoss: 'Victor Kane', currentBodyguard: 'Mira Storm' },
  { rankNumber: 2750, rankClass: 'Gold', performanceScore: 118400, playerName: 'Kitchen Flash', avatar: 'KF', totalMissionsCompleted: 155, totalRunsCompleted: 31, totalKOs: 608, currentBoss: 'Selena Voss', currentBodyguard: 'Bruno Lock' },
  { rankNumber: 6000, rankClass: 'Silver', performanceScore: 76000, playerName: 'Signal Fox', avatar: 'SF', totalMissionsCompleted: 91, totalRunsCompleted: 18, totalKOs: 312, currentBoss: 'Victor Kane', currentBodyguard: 'Rex Viper' },
  { rankNumber: 9200, rankClass: 'Bronze', performanceScore: 42500, playerName: 'Vault Salsa', avatar: 'VS', totalMissionsCompleted: 50, totalRunsCompleted: 10, totalKOs: 155, currentBoss: 'Selena Voss', currentBodyguard: 'Jake Stone' },
  { rankNumber: 12000, rankClass: 'No Rank', performanceScore: 8700, playerName: 'New Hideout', avatar: 'NH', totalMissionsCompleted: 12, totalRunsCompleted: 2, totalKOs: 33, currentBoss: 'Victor Kane', currentBodyguard: 'Jake Stone' },
];
