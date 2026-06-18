import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  allMissions,
  bodyguardById,
  bodyguards,
  bossById,
  bosses,
  funnyDances,
  GAME_SUBTITLE,
  GAME_TITLE,
  leaderboardSeeds,
  loadingTips,
  missionById,
  modeById,
  modes,
  powerupById,
  powerups,
  vehicleById,
  vehicles,
  weaponById,
  weapons,
} from './src/data/gameData';
import { GameSession, Mission, ModeId, PlayerProfile, RewardResult, ScreenName } from './src/data/types';
import { Card, colors, EmptyState, GameButton, Meter, ProgressTracker, Screen, SectionTitle, StatPill } from './src/components/Ui';
import { localSaveAdapter } from './src/storage/saveService';
import {
  applyMissionComplete,
  applyRunComplete,
  canStartRun,
  countdownText,
  createMissionReward,
  createSession,
  getCompletedCountForMode,
  getMissionsForBatch,
  hydrateLives,
  isMissionCompleted,
  rankClassForRank,
  REVIVE_GEM_COST,
  spendLife,
  toLeaderboardEntry,
} from './src/game/progression';

type RunResult = {
  cashEarned: number;
  gemsEarned: number;
  bonusGems: number;
  totalKOs: number;
  grade: RewardResult['grade'];
  bossHealth: number;
  bodyguardHealth: number;
};

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [selectedModeId, setSelectedModeId] = useState<ModeId>('train');
  const [session, setSession] = useState<GameSession | null>(null);
  const [missionResult, setMissionResult] = useState<RewardResult | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [alertMeter, setAlertMeter] = useState(18);
  const [policeMeter, setPoliceMeter] = useState(10);
  const [playerPoint, setPlayerPoint] = useState({ x: 46, y: 58 });

  useEffect(() => {
    localSaveAdapter.loadProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (screen === 'splash') {
      const timeout = setTimeout(() => setScreen('loading'), 2100);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [screen]);

  useEffect(() => {
    if (screen !== 'loading') return undefined;
    const interval = setInterval(() => {
      setLoadingProgress((value) => {
        const next = Math.min(100, value + 8);
        if (next >= 100 && profile) {
          clearInterval(interval);
          setTimeout(() => setScreen('home'), 350);
        }
        return next;
      });
      setTipIndex((value) => (value + 1) % loadingTips.length);
    }, 260);
    return () => clearInterval(interval);
  }, [screen, profile]);

  useEffect(() => {
    if (!profile) return undefined;
    const interval = setInterval(() => {
      const hydrated = hydrateLives(profile);
      if (hydrated !== profile) {
        saveProfile(hydrated);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [profile]);

  const saveProfile = async (next: PlayerProfile) => {
    setProfile(next);
    await localSaveAdapter.saveProfile(next);
  };

  const selectedBoss = profile ? bossById(profile.selectedBossId) : bosses[0];
  const selectedBodyguard = profile ? bodyguardById(profile.selectedBodyguardId) : bodyguardById('jake-stone');
  const selectedVehicle = profile ? vehicleById(profile.selectedVehicleId) : vehicleById('classic-boss-car');
  const selectedWeapon = profile ? weaponById(profile.selectedWeaponId) : weaponById('arcade-blade');
  const selectedPowerup = profile ? powerupById(profile.selectedPowerupId) : powerupById('speed-boost');
  const selectedMode = modeById(selectedModeId);
  const rankClass = profile ? rankClassForRank(profile.rankNumber) : 'No Rank';

  const mission = useMemo(() => {
    if (!session) return null;
    return missionById(session.missionIds[session.currentIndex]) ?? null;
  }, [session]);

  const writeProfile = (updater: (current: PlayerProfile) => PlayerProfile) => {
    if (!profile) return;
    const next = updater(hydrateLives(profile));
    saveProfile(next);
  };

  const goHome = () => {
    setSession(null);
    setMissionResult(null);
    setRunResult(null);
    setScreen('home');
  };

  const startRun = (modeId = selectedModeId) => {
    if (!profile) return;
    const hydrated = hydrateLives(profile);
    if (!canStartRun(hydrated, modeId)) {
      saveProfile(hydrated);
      setSelectedModeId(modeId);
      setScreen('gameOver');
      return;
    }
    setSelectedModeId(modeId);
    setSession(createSession(hydrated, modeId));
    setMissionResult(null);
    setRunResult(null);
    setAlertMeter(modeId === 'training' ? 4 : 18);
    setPoliceMeter(modeId === 'training' ? 0 : 10);
    setPlayerPoint({ x: 46, y: 58 });
    saveProfile(hydrated);
    setScreen('gameplay');
  };

  const completeMission = () => {
    if (!profile || !session || !mission) return;
    const elapsed = Math.max(22, Math.round((Date.now() - session.startedAt) / 1000));
    const reward = createMissionReward(mission, session.bossHealth, session.bodyguardHealth, elapsed);
    const nextProfile = applyMissionComplete(profile, session, reward);
    const nextSession: GameSession = {
      ...session,
      runCash: session.runCash + reward.cashEarned,
      runGems: session.runGems + reward.gemsEarned,
      runKOs: session.runKOs + reward.kos,
      currentIndex: session.currentIndex + 1,
      completedThisRun: [...session.completedThisRun, mission.id],
    };
    setMissionResult(reward);
    setSession(nextSession);
    saveProfile(nextProfile);
    setScreen('missionComplete');
  };

  const continueAfterMission = () => {
    if (!profile || !session) return;
    const completedInBatch = session.missionIds.every((id) => isMissionCompleted(profile, id));
    if (session.currentIndex >= session.missionIds.length && completedInBatch) {
      finishRun();
      return;
    }
    if (session.currentIndex >= session.missionIds.length) {
      setSession({ ...session, currentIndex: 0 });
    }
    setScreen('gameplay');
  };

  const finishRun = () => {
    if (!profile || !session) return;
    const perfectRun = session.bossHealth >= 90 && session.bodyguardHealth >= 90;
    const bonusGems = session.modeId === 'training' ? 0 : 5 + Math.floor(session.batch / 4);
    const grade: RewardResult['grade'] = perfectRun ? 'S' : session.bossHealth > 65 && session.bodyguardHealth > 65 ? 'A' : 'B';
    const nextProfile = applyRunComplete(profile, session, bonusGems, perfectRun);
    setRunResult({
      cashEarned: session.runCash,
      gemsEarned: session.runGems,
      bonusGems,
      totalKOs: session.runKOs,
      grade,
      bossHealth: session.bossHealth,
      bodyguardHealth: session.bodyguardHealth,
    });
    saveProfile(nextProfile);
    setScreen('runComplete');
  };

  const loseRun = () => {
    if (!profile || !session) return;
    const nextProfile = session.modeId === 'training' ? profile : spendLife(profile);
    saveProfile(nextProfile);
    setScreen('gameOver');
  };

  const revive = () => {
    if (!profile || !session || profile.gems < REVIVE_GEM_COST) return;
    const nextProfile = { ...profile, gems: profile.gems - REVIVE_GEM_COST };
    saveProfile(nextProfile);
    setSession({ ...session, bossHealth: 70, bodyguardHealth: 76 });
    setAlertMeter(20);
    setPoliceMeter(12);
    setScreen('gameplay');
  };

  const performAction = (kind: 'weapon' | 'powerup' | 'vehicle' | 'secret' | 'dance') => {
    if (!session || !mission) return;
    const alertDrop = kind === 'dance' || kind === 'powerup' ? 10 : 5;
    const policeDrop = kind === 'vehicle' ? 12 : 4;
    const damage = kind === 'weapon' ? 4 : kind === 'secret' ? 2 : 1;
    const foundWeapon = kind === 'secret' && mission.secretArea ? weapons[(mission.missionNumber % (weapons.length - 1)) + 1].id : null;
    setAlertMeter((value) => Math.max(0, value - alertDrop));
    setPoliceMeter((value) => Math.max(0, value - policeDrop));
    setSession({
      ...session,
      runKOs: session.runKOs + (kind === 'weapon' ? 1 : 0),
      bodyguardHealth: Math.max(0, session.bodyguardHealth - damage),
      foundWeapons: foundWeapon && !session.foundWeapons.includes(foundWeapon) ? [...session.foundWeapons, foundWeapon] : session.foundWeapons,
    });
  };

  const movePlayer = (dx: number, dy: number) => {
    if (!session) return;
    const nextPoint = {
      x: Math.max(8, Math.min(86, playerPoint.x + dx)),
      y: Math.max(14, Math.min(78, playerPoint.y + dy)),
    };
    setPlayerPoint(nextPoint);
    setAlertMeter((value) => Math.min(100, value + 2));
    setPoliceMeter((value) => Math.min(100, value + (session.modeId === 'training' ? 0 : 1)));
    if (alertMeter > 92 || policeMeter > 95) {
      setSession({
        ...session,
        bossHealth: Math.max(0, session.bossHealth - 7),
        bodyguardHealth: Math.max(0, session.bodyguardHealth - 8),
      });
    }
  };

  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'loading' || !profile) return <LoadingScreen progress={loadingProgress} tip={loadingTips[tipIndex]} />;

  const topStatus = (
    <TopStatus
      cash={profile.cash}
      gems={profile.gems}
      lives={profile.lifeSystem.lives}
      nextLife={countdownText(profile.lifeSystem.nextLifeAt)}
      rank={`#${profile.rankNumber} ${rankClass}`}
    />
  );

  return (
    <>
      <StatusBar style="light" />
      {screen === 'home' && (
        <HomeScreen
          profile={profile}
          topStatus={topStatus}
          bossName={selectedBoss.name}
          bodyguardName={selectedBodyguard.name}
          rankClass={rankClass}
          onNavigate={setScreen}
          onPlay={() => setScreen('modes')}
        />
      )}
      {screen === 'modes' && (
        <ModeScreen
          profile={profile}
          topStatus={topStatus}
          selectedModeId={selectedModeId}
          onSelect={(modeId) => {
            setSelectedModeId(modeId);
            setScreen('missions');
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'missions' && (
        <MissionScreen
          profile={profile}
          modeId={selectedModeId}
          topStatus={topStatus}
          onStart={() => startRun(selectedModeId)}
          onBack={() => setScreen('modes')}
        />
      )}
      {screen === 'bosses' && (
        <BossScreen
          profile={profile}
          topStatus={topStatus}
          onSelect={(bossId) => writeProfile((current) => ({ ...current, selectedBossId: bossId }))}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'bodyguards' && (
        <BodyguardScreen
          profile={profile}
          topStatus={topStatus}
          onSelect={(bodyguardId) => writeProfile((current) => ({ ...current, selectedBodyguardId: bodyguardId }))}
          onBuy={(guardId) => {
            const guard = bodyguardById(guardId);
            writeProfile((current) => ({
              ...current,
              cash: current.cash - guard.price,
              inventory: {
                ...current.inventory,
                purchasedBodyguards: [...current.inventory.purchasedBodyguards, guard.id],
              },
            }));
            Alert.alert('New Bodyguard Purchased!', `${guard.name} is ready for the next operation.`);
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'shop' && (
        <ShopScreen
          profile={profile}
          topStatus={topStatus}
          onBuyBodyguards={() => setScreen('bodyguards')}
          onBuyPowerups={() => setScreen('powerups')}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'garage' && (
        <GarageScreen
          profile={profile}
          topStatus={topStatus}
          onSelect={(vehicleId) => writeProfile((current) => ({ ...current, selectedVehicleId: vehicleId }))}
          onBuy={(vehicleId) => {
            const vehicle = vehicleById(vehicleId);
            writeProfile((current) => ({
              ...current,
              cash: current.cash - vehicle.price,
              inventory: { ...current.inventory, vehicles: [...current.inventory.vehicles, vehicle.id] },
            }));
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'weapons' && (
        <WeaponScreen
          profile={profile}
          topStatus={topStatus}
          onSelect={(weaponId) => writeProfile((current) => ({ ...current, selectedWeaponId: weaponId }))}
          onUpgrade={(weaponId) => {
            const weapon = weaponById(weaponId);
            writeProfile((current) => ({
              ...current,
              cash: current.cash - weapon.upgradeCost,
              inventory: {
                ...current.inventory,
                weapons: {
                  ...current.inventory.weapons,
                  [weaponId]: (current.inventory.weapons[weaponId] ?? 0) + 1,
                },
              },
            }));
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'powerups' && (
        <PowerupScreen
          profile={profile}
          topStatus={topStatus}
          onSelect={(powerupId) => writeProfile((current) => ({ ...current, selectedPowerupId: powerupId }))}
          onBuy={(powerupId) => {
            const powerup = powerupById(powerupId);
            const isGemPurchase = powerup.id === 'double-gems' || powerup.id === 'revive-token';
            writeProfile((current) => ({
              ...current,
              cash: isGemPurchase ? current.cash : current.cash - powerup.price,
              gems: isGemPurchase ? current.gems - powerup.price : current.gems,
              inventory: {
                ...current.inventory,
                powerups: {
                  ...current.inventory.powerups,
                  [powerupId]: (current.inventory.powerups[powerupId] ?? 0) + 1,
                },
              },
            }));
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'outfits' && <OutfitsScreen profile={profile} topStatus={topStatus} onBack={() => setScreen('home')} />}
      {screen === 'settings' && (
        <SettingsScreen
          profile={profile}
          topStatus={topStatus}
          onChange={(next) => writeProfile(() => next)}
          onReset={async () => {
            const reset = await localSaveAdapter.resetProfile();
            setProfile(reset);
            setScreen('home');
          }}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'leaderboard' && (
        <LeaderboardScreen profile={profile} topStatus={topStatus} bossName={selectedBoss.name} bodyguardName={selectedBodyguard.name} onBack={() => setScreen('home')} />
      )}
      {screen === 'daily' && (
        <DailyRewardsScreen
          profile={profile}
          topStatus={topStatus}
          onClaim={() =>
            writeProfile((current) => ({
              ...current,
              cash: current.cash + 1200,
              gems: current.gems + 3,
              lifeSystem: { ...current.lifeSystem, lives: Math.min(current.lifeSystem.maxLives, current.lifeSystem.lives + 1) },
              inventory: {
                ...current.inventory,
                outfits: Array.from(new Set([...current.inventory.outfits, 'Crimson Token Outfit'])),
                powerups: { ...current.inventory.powerups, shield: (current.inventory.powerups.shield ?? 0) + 1 },
              },
            }))
          }
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'profile' && (
        <ProfileScreen profile={profile} topStatus={topStatus} bossName={selectedBoss.name} bodyguardName={selectedBodyguard.name} onBack={() => setScreen('home')} />
      )}
      {screen === 'gameplay' && session && mission && (
        <GameplayScreen
          topStatus={topStatus}
          session={session}
          mission={mission}
          modeName={selectedMode.name}
          bossName={selectedBoss.name}
          bodyguardName={selectedBodyguard.name}
          vehicleName={selectedVehicle.name}
          weaponName={selectedWeapon.name}
          powerupName={selectedPowerup.name}
          alertMeter={alertMeter}
          policeMeter={policeMeter}
          playerPoint={playerPoint}
          onMove={movePlayer}
          onAction={performAction}
          onComplete={completeMission}
          onLose={loseRun}
          onPause={() => setScreen('missions')}
        />
      )}
      {screen === 'missionComplete' && missionResult && (
        <MissionCompleteScreen topStatus={topStatus} reward={missionResult} session={session} rankClass={rankClass} onNext={continueAfterMission} onHome={goHome} />
      )}
      {screen === 'runComplete' && runResult && (
        <RunCompleteScreen topStatus={topStatus} result={runResult} profile={profile} rankClass={rankClass} onNext={() => setScreen('missions')} onHome={goHome} onUpgrade={() => setScreen('weapons')} />
      )}
      {screen === 'gameOver' && (
        <GameOverScreen profile={profile} topStatus={topStatus} session={session} onRevive={revive} onHome={goHome} onWait={() => setScreen('home')} />
      )}
    </>
  );
}

function SplashScreen() {
  return (
    <Screen scroll={false}>
      <View style={screenStyles.splashWrap}>
        <View style={screenStyles.skyPanel}>
          <View style={[screenStyles.characterSilhouette, { left: 20, height: 122, backgroundColor: '#f7b733' }]} />
          <View style={[screenStyles.characterSilhouette, { left: 84, height: 156, backgroundColor: '#2a1119' }]} />
          <View style={[screenStyles.characterSilhouette, { left: 150, height: 190, backgroundColor: '#111018' }]} />
          <View style={[screenStyles.characterSilhouette, { right: 74, height: 180, backgroundColor: '#241c24' }]} />
          <View style={[screenStyles.characterSilhouette, { right: 18, height: 132, backgroundColor: '#5f2d38' }]} />
          <Text style={screenStyles.logo}>{GAME_TITLE}</Text>
          <Text style={screenStyles.logoSub}>{GAME_SUBTITLE}</Text>
        </View>
        <Text style={screenStyles.loadingText}>Preparing the underground hideout...</Text>
        <View style={screenStyles.loadingDots}>
          <View style={screenStyles.dot} />
          <View style={[screenStyles.dot, { backgroundColor: colors.gold }]} />
          <View style={screenStyles.dot} />
        </View>
      </View>
    </Screen>
  );
}

function LoadingScreen({ progress, tip }: { progress: number; tip: string }) {
  return (
    <Screen scroll={false}>
      <View style={screenStyles.loadingWrap}>
        <Text style={screenStyles.logoSmall}>{GAME_TITLE}</Text>
        <Text style={screenStyles.loadingText}>Preparing the underground hideout...</Text>
        <View style={screenStyles.progressTrack}>
          <View style={[screenStyles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={screenStyles.percent}>{progress}%</Text>
        <Card style={{ width: '100%' }}>
          <Text style={screenStyles.tipLabel}>TIP</Text>
          <Text style={screenStyles.tipText}>{tip}</Text>
        </Card>
      </View>
    </Screen>
  );
}

function TopStatus({ cash, gems, lives, nextLife, rank }: { cash: number; gems: number; lives: number; nextLife: string; rank: string }) {
  return (
    <View style={screenStyles.statusRow}>
      <StatPill label="Cash" value={`$${cash}`} tone="gold" />
      <StatPill label="Gems" value={gems} tone="purple" />
      <StatPill label={`Life ${nextLife}`} value={`${lives}/5`} tone="red" />
      <StatPill label="Rank" value={rank} tone="blue" />
    </View>
  );
}

function HomeScreen({
  profile,
  topStatus,
  bossName,
  bodyguardName,
  rankClass,
  onNavigate,
  onPlay,
}: {
  profile: PlayerProfile;
  topStatus: React.ReactNode;
  bossName: string;
  bodyguardName: string;
  rankClass: string;
  onNavigate: (screen: ScreenName) => void;
  onPlay: () => void;
}) {
  const menu: { label: string; icon: string; screen: ScreenName }[] = [
    { label: 'Modes', icon: 'M', screen: 'modes' },
    { label: 'Missions', icon: '5', screen: 'missions' },
    { label: 'Garage', icon: 'V', screen: 'garage' },
    { label: 'Characters', icon: 'B', screen: 'bodyguards' },
    { label: 'Weapons', icon: 'W', screen: 'weapons' },
    { label: 'Powerups', icon: 'P', screen: 'powerups' },
    { label: 'Outfits', icon: 'O', screen: 'outfits' },
    { label: 'Shop', icon: '$', screen: 'shop' },
    { label: 'Settings', icon: 'S', screen: 'settings' },
    { label: 'Leaderboard', icon: '#', screen: 'leaderboard' },
    { label: 'Daily Rewards', icon: '+', screen: 'daily' },
    { label: 'Profile', icon: '@', screen: 'profile' },
  ];

  return (
    <Screen title="Underground Hideout" subtitle="Neon vault, mission board, vehicle entrance, camera wall." right={topStatus}>
      <View style={screenStyles.heroHideout}>
        <View style={screenStyles.vaultDoor} />
        <View style={screenStyles.bossChair} />
        <View style={screenStyles.weaponWall}>
          <Text style={screenStyles.hideoutLabel}>WEAPON WALL</Text>
        </View>
        <View style={screenStyles.vehicleGate}>
          <Text style={screenStyles.hideoutLabel}>GARAGE</Text>
        </View>
        <Text style={screenStyles.hideoutTitle}>{GAME_TITLE}</Text>
      </View>
      <Card>
        <Text style={screenStyles.cardTitle}>Player Card</Text>
        <Text style={screenStyles.bodyText}>Boss: {bossName}  |  Bodyguard: {bodyguardName}</Text>
        <Text style={screenStyles.bodyText}>Rank Class: {rankClass}</Text>
        <Text style={screenStyles.bodyText}>Ranked missions: {profile.totalMissionsCompleted}  |  5-mission runs: {profile.totalRunsCompleted}</Text>
      </Card>
      <GameButton label="Play" icon=">" onPress={onPlay} />
      <View style={screenStyles.menuGrid}>
        {menu.map((item) => (
          <Pressable key={item.label} onPress={() => onNavigate(item.screen)} style={screenStyles.menuTile}>
            <Text style={screenStyles.menuIcon}>{item.icon}</Text>
            <Text style={screenStyles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function ModeScreen({
  profile,
  selectedModeId,
  topStatus,
  onSelect,
  onBack,
}: {
  profile: PlayerProfile;
  selectedModeId: ModeId;
  topStatus: React.ReactNode;
  onSelect: (modeId: ModeId) => void;
  onBack: () => void;
}) {
  return (
    <Screen title="Select Mode" subtitle="Ranked modes count toward the global leaderboard. Training is practice only." right={topStatus}>
      {modes.map((mode) => {
        const completed = getCompletedCountForMode(profile, mode.id);
        const active = profile.modeProgress[mode.id].activeBatch;
        return (
          <Card key={mode.id} style={{ borderColor: selectedModeId === mode.id ? mode.accent : colors.border }}>
            <Text style={screenStyles.cardTitle}>{mode.name}</Text>
            <Text style={screenStyles.bodyText}>{mode.tagline}</Text>
            <Text style={screenStyles.metaText}>{mode.ranked ? 'Ranked' : 'Training'} | Completed {completed}/{mode.totalMissions} | Run {active}</Text>
            <GameButton label="Open Mission Batch" icon=">" small onPress={() => onSelect(mode.id)} />
          </Card>
        );
      })}
      <GameButton label="Back to Hideout" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function MissionScreen({ profile, modeId, topStatus, onStart, onBack }: { profile: PlayerProfile; modeId: ModeId; topStatus: React.ReactNode; onStart: () => void; onBack: () => void }) {
  const mode = modeById(modeId);
  const batch = profile.modeProgress[modeId].activeBatch;
  const missions = getMissionsForBatch(modeId, batch);
  const completedNumbers = missions.filter((mission) => isMissionCompleted(profile, mission.id)).map((mission) => ((mission.missionNumber - 1) % 5) + 1);
  return (
    <Screen title={mode.name} subtitle={`Current 5-mission run: ${batch}. Complete all five to unlock the next batch.`} right={topStatus}>
      <Card>
        <Text style={screenStyles.cardTitle}>Run Progress</Text>
        <ProgressTracker current={Math.min(5, completedNumbers.length + 1)} completed={completedNumbers} />
        <Text style={screenStyles.bodyText}>Mission {Math.min(5, completedNumbers.length + 1)}/5 ready.</Text>
      </Card>
      {missions.map((mission) => (
        <Card key={mission.id} dimmed={isMissionCompleted(profile, mission.id)}>
          <Text style={screenStyles.cardTitle}>{mission.title}</Text>
          <Text style={screenStyles.bodyText}>{mission.objective}</Text>
          <Text style={screenStyles.metaText}>{mission.location} | {mission.type} | Cash ${mission.cashReward} | Gems {mission.gemReward}</Text>
        </Card>
      ))}
      <GameButton label={modeId === 'training' ? 'Start Training Run' : 'Start 5-Mission Run'} icon=">" disabled={!canStartRun(profile, modeId)} onPress={onStart} />
      {!canStartRun(profile, modeId) ? <Text style={screenStyles.warning}>No lives available. Wait for refresh or revive with gems after a failed run.</Text> : null}
      <GameButton label="Back to Modes" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function BossScreen({ profile, topStatus, onSelect, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onSelect: (bossId: string) => void; onBack: () => void }) {
  return (
    <Screen title="Select Boss" subtitle="Choose one Boss before every run." right={topStatus}>
      {bosses.map((boss) => (
        <Card key={boss.id} style={{ borderColor: profile.selectedBossId === boss.id ? colors.gold : colors.border }}>
          <Text style={screenStyles.cardTitle}>{boss.name}</Text>
          <Text style={screenStyles.bodyText}>{boss.style}</Text>
          {boss.abilities.map((ability) => (
            <Text key={ability} style={screenStyles.metaText}>{ability}</Text>
          ))}
          <View style={screenStyles.inlineStats}>
            <StatPill label="Health" value={boss.health} />
            <StatPill label="Speed" value={boss.speed} tone="blue" />
            <StatPill label="Shield" value={boss.shield} tone="green" />
          </View>
          <GameButton label={profile.selectedBossId === boss.id ? 'Selected' : 'Select Boss'} small disabled={profile.selectedBossId === boss.id} onPress={() => onSelect(boss.id)} />
        </Card>
      ))}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function BodyguardScreen({
  profile,
  topStatus,
  onSelect,
  onBuy,
  onBack,
}: {
  profile: PlayerProfile;
  topStatus: React.ReactNode;
  onSelect: (bodyguardId: string) => void;
  onBuy: (bodyguardId: string) => void;
  onBack: () => void;
}) {
  return (
    <Screen title="Bodyguard Shop" subtitle="Unlocks appear after 20, 40, 60, 80, and 100 completed missions per ranked mode." right={topStatus}>
      {bodyguards.map((guard) => {
        const owned = profile.inventory.purchasedBodyguards.includes(guard.id);
        const completed = guard.unlockModeId === 'starter' ? 999 : getCompletedCountForMode(profile, guard.unlockModeId);
        const requirementMet = completed >= guard.requiredMissions;
        const enoughCash = profile.cash >= guard.price;
        const lockedReason = guard.unlockModeId !== 'starter' && !requirementMet
          ? `Complete ${guard.requiredMissions} missions in ${modeById(guard.unlockModeId).name} to unlock this character.`
          : !owned && !enoughCash
            ? 'Not enough cash.'
            : '';
        return (
          <Card key={guard.id} dimmed={!owned && !requirementMet}>
            <View style={screenStyles.cardHeaderRow}>
              <Text style={screenStyles.cardTitle}>{guard.name}</Text>
              {guard.powerLevel === 5 ? <Text style={screenStyles.badge}>Strongest in this mode</Text> : null}
            </View>
            <Text style={screenStyles.bodyText}>{guard.gender} | {guard.role} | {guard.specialAbility}</Text>
            <Text style={screenStyles.metaText}>Unlock: {guard.unlockModeId === 'starter' ? 'Free starter' : modeById(guard.unlockModeId).name} | Required missions {guard.requiredMissions} | Price ${guard.price}</Text>
            <View style={screenStyles.statGrid}>
              <StatPill label="Power" value={guard.powerLevel} />
              <StatPill label="Health" value={guard.health} tone="green" />
              <StatPill label="Speed" value={guard.speed} tone="blue" />
              <StatPill label="Defense" value={guard.defense} tone="purple" />
              <StatPill label="Attack" value={guard.attack} tone="red" />
              <StatPill label="Stealth" value={guard.stealth} tone="gold" />
            </View>
            {lockedReason ? <Text style={screenStyles.warning}>{lockedReason}</Text> : null}
            {owned ? (
              <GameButton label={profile.selectedBodyguardId === guard.id ? 'Selected' : 'Select Bodyguard'} small disabled={profile.selectedBodyguardId === guard.id} onPress={() => onSelect(guard.id)} />
            ) : (
              <GameButton label="Buy Character" small disabled={!requirementMet || !enoughCash} onPress={() => onBuy(guard.id)} />
            )}
          </Card>
        );
      })}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function ShopScreen({ profile, topStatus, onBuyBodyguards, onBuyPowerups, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onBuyBodyguards: () => void; onBuyPowerups: () => void; onBack: () => void }) {
  return (
    <Screen title="Shop" subtitle="Cash buys characters, vehicles, weapons, upgrades, powerups, outfits, and hideout items. Gems buy revives and rare continues." right={topStatus}>
      <Card>
        <Text style={screenStyles.cardTitle}>Currency Rules</Text>
        <Text style={screenStyles.bodyText}>Cash: Bodyguards, outfits, vehicles, weapons, upgrades, powerups, hideout items.</Text>
        <Text style={screenStyles.bodyText}>Gems: Reviving, premium continues, special bonus rewards.</Text>
      </Card>
      <GameButton label="Character Shop" icon="B" onPress={onBuyBodyguards} />
      <GameButton label="Powerup Shop" icon="P" variant="secondary" onPress={onBuyPowerups} />
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function GarageScreen({ profile, topStatus, onSelect, onBuy, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onSelect: (id: string) => void; onBuy: (id: string) => void; onBack: () => void }) {
  return (
    <Screen title="Garage" subtitle="Upgrade-ready vehicles for travel, protection, and escape boosts." right={topStatus}>
      {vehicles.map((vehicle) => {
        const owned = profile.inventory.vehicles.includes(vehicle.id);
        return (
          <Card key={vehicle.id}>
            <Text style={screenStyles.cardTitle}>{vehicle.name}</Text>
            <Text style={screenStyles.metaText}>Modes: {vehicle.modeIds.map((modeId) => modeById(modeId).name).join(', ')}</Text>
            <View style={screenStyles.statGrid}>
              <StatPill label="Speed" value={vehicle.speed} tone="blue" />
              <StatPill label="Armor" value={vehicle.armor} tone="green" />
              <StatPill label="Handling" value={vehicle.handling} />
              <StatPill label="Fuel" value={vehicle.fuel} tone="purple" />
              <StatPill label="Boost" value={vehicle.escapeBoost} tone="red" />
              <StatPill label="Storage" value={vehicle.secretStorage} tone="gold" />
            </View>
            {owned ? (
              <GameButton label={profile.selectedVehicleId === vehicle.id ? 'Selected' : 'Select Vehicle'} small disabled={profile.selectedVehicleId === vehicle.id} onPress={() => onSelect(vehicle.id)} />
            ) : (
              <GameButton label={`Buy $${vehicle.price}`} small disabled={profile.cash < vehicle.price} onPress={() => onBuy(vehicle.id)} />
            )}
          </Card>
        );
      })}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function WeaponScreen({ profile, topStatus, onSelect, onUpgrade, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onSelect: (id: string) => void; onUpgrade: (id: string) => void; onBack: () => void }) {
  return (
    <Screen title="Weapons" subtitle="The Bodyguard starts with the Basic Arcade Blade. Stronger gear appears in secret areas." right={topStatus}>
      {weapons.map((weapon) => {
        const level = profile.inventory.weapons[weapon.id] ?? 0;
        const owned = level > 0;
        return (
          <Card key={weapon.id} dimmed={!owned && weapon.price > 0}>
            <Text style={screenStyles.cardTitle}>{weapon.name}</Text>
            <Text style={screenStyles.bodyText}>{weapon.rarity} | Power {weapon.power} | {weapon.temporary ? 'Temporary mission pickup' : 'Can be stored after full run'}</Text>
            <Text style={screenStyles.metaText}>Secret areas: {weapon.secretAreas.join(', ')}</Text>
            <Text style={screenStyles.metaText}>Upgrade level: {level}</Text>
            {owned ? <GameButton label={profile.selectedWeaponId === weapon.id ? 'Selected' : 'Select Weapon'} small disabled={profile.selectedWeaponId === weapon.id} onPress={() => onSelect(weapon.id)} /> : null}
            <GameButton label={owned ? `Upgrade $${weapon.upgradeCost}` : 'Find in secret areas'} small variant="secondary" disabled={!owned || profile.cash < weapon.upgradeCost} onPress={() => onUpgrade(weapon.id)} />
          </Card>
        );
      })}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function PowerupScreen({ profile, topStatus, onSelect, onBuy, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onSelect: (id: string) => void; onBuy: (id: string) => void; onBack: () => void }) {
  return (
    <Screen title="Powerups" subtitle="Equip one before a run, then trigger it during the mission." right={topStatus}>
      {powerups.map((powerup) => {
        const count = profile.inventory.powerups[powerup.id] ?? 0;
        const gemCost = powerup.id === 'double-gems' || powerup.id === 'revive-token';
        const affordable = gemCost ? profile.gems >= powerup.price : profile.cash >= powerup.price;
        return (
          <Card key={powerup.id}>
            <Text style={screenStyles.cardTitle}>{powerup.name}</Text>
            <Text style={screenStyles.bodyText}>{powerup.effect}</Text>
            <Text style={screenStyles.metaText}>Owned {count} | Price {gemCost ? `${powerup.price} gems` : `$${powerup.price}`}</Text>
            <GameButton label={profile.selectedPowerupId === powerup.id ? 'Selected' : 'Select'} small disabled={count <= 0 || profile.selectedPowerupId === powerup.id} onPress={() => onSelect(powerup.id)} />
            <GameButton label="Buy Powerup" small variant="secondary" disabled={!affordable} onPress={() => onBuy(powerup.id)} />
          </Card>
        );
      })}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function OutfitsScreen({ profile, topStatus, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onBack: () => void }) {
  return (
    <Screen title="Outfits" subtitle="Prototype wardrobe with token-ready unlocks." right={topStatus}>
      {profile.inventory.outfits.map((outfit) => (
        <Card key={outfit}>
          <Text style={screenStyles.cardTitle}>{outfit}</Text>
          <Text style={screenStyles.bodyText}>Owned outfit. Future versions can attach stat bonuses and Supabase inventory rows.</Text>
        </Card>
      ))}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function SettingsScreen({ profile, topStatus, onChange, onReset, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onChange: (profile: PlayerProfile) => void; onReset: () => void; onBack: () => void }) {
  const settings = profile.settings;
  const setSetting = <K extends keyof PlayerProfile['settings']>(key: K, value: PlayerProfile['settings'][K]) => {
    onChange({ ...profile, settings: { ...settings, [key]: value } });
  };
  return (
    <Screen title="Settings" subtitle="Local guest save. Cloud account hooks are Supabase-ready." right={topStatus}>
      <ToggleRow label="Sound" value={settings.sound ? 'On' : 'Off'} onPress={() => setSetting('sound', !settings.sound)} />
      <ToggleRow label="Music" value={settings.music ? 'On' : 'Off'} onPress={() => setSetting('music', !settings.music)} />
      <CycleRow label="Graphics" value={settings.graphicsQuality} values={['Low', 'Medium', 'High']} onPick={(value) => setSetting('graphicsQuality', value)} />
      <CycleRow label="Controls" value={settings.controls} values={['Floating joystick', 'Fixed joystick', 'Tap to move']} onPick={(value) => setSetting('controls', value)} />
      <CycleRow label="Language" value={settings.language} values={['English', 'Hindi', 'Spanish']} onPick={(value) => setSetting('language', value)} />
      <ToggleRow label="Notifications" value={settings.notifications ? 'On' : 'Off'} onPress={() => setSetting('notifications', !settings.notifications)} />
      <ToggleRow label="Account" value={settings.account} onPress={() => setSetting('account', settings.account === 'Local Guest' ? 'Supabase Ready' : 'Local Guest')} />
      <GameButton label="Reset Progress" variant="danger" onPress={onReset} />
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function LeaderboardScreen({ profile, topStatus, bossName, bodyguardName, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; bossName: string; bodyguardName: string; onBack: () => void }) {
  const playerEntry = toLeaderboardEntry(profile, bossName, bodyguardName);
  const entries = [playerEntry, ...leaderboardSeeds].sort((a, b) => a.rankNumber - b.rankNumber);
  return (
    <Screen title="Leaderboard" subtitle={playerEntry.rankClass === 'No Rank' ? 'No Rank - Reach the Top 10000 to earn a badge.' : 'Global ranking prototype based on ranked-mode performance.'} right={topStatus}>
      {entries.map((entry) => (
        <Card key={`${entry.playerName}-${entry.rankNumber}`} style={{ borderColor: entry.playerName === profile.playerName ? colors.gold : colors.border }}>
          <View style={screenStyles.cardHeaderRow}>
            <Text style={screenStyles.cardTitle}>#{entry.rankNumber} {entry.rankClass}</Text>
            <Text style={screenStyles.avatar}>{entry.avatar}</Text>
          </View>
          <Text style={screenStyles.bodyText}>{entry.playerName} | Score {entry.performanceScore}</Text>
          <Text style={screenStyles.metaText}>Missions {entry.totalMissionsCompleted} | Runs {entry.totalRunsCompleted} | KOs {entry.totalKOs}</Text>
          <Text style={screenStyles.metaText}>Boss {entry.currentBoss} | Bodyguard {entry.currentBodyguard}</Text>
        </Card>
      ))}
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function DailyRewardsScreen({ profile, topStatus, onClaim, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; onClaim: () => void; onBack: () => void }) {
  const rewards = ['Daily cash', 'Bonus gems', 'Free powerup', 'Extra life', 'Mystery crate', 'Outfit token'];
  return (
    <Screen title="Daily Rewards" subtitle="Prototype claim grants a full arcade bundle." right={topStatus}>
      <View style={screenStyles.menuGrid}>
        {rewards.map((reward) => (
          <Card key={reward} style={screenStyles.rewardTile}>
            <Text style={screenStyles.cardTitle}>{reward}</Text>
          </Card>
        ))}
      </View>
      <Text style={screenStyles.metaText}>Current cash ${profile.cash} | Gems {profile.gems}</Text>
      <GameButton label="Claim Daily Bundle" onPress={onClaim} />
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function ProfileScreen({ profile, topStatus, bossName, bodyguardName, onBack }: { profile: PlayerProfile; topStatus: React.ReactNode; bossName: string; bodyguardName: string; onBack: () => void }) {
  return (
    <Screen title="Player Profile" subtitle="Rank class appears on home, profile, leaderboard, mission complete, and run complete screens." right={topStatus}>
      <Card>
        <Text style={screenStyles.cardTitle}>{profile.playerName}</Text>
        <Text style={screenStyles.bodyText}>Badge: #{profile.rankNumber} {rankClassForRank(profile.rankNumber)}</Text>
        <Text style={screenStyles.bodyText}>Selected Boss: {bossName}</Text>
        <Text style={screenStyles.bodyText}>Selected Bodyguard: {bodyguardName}</Text>
        <Text style={screenStyles.bodyText}>Performance score: {profile.leaderboardScore}</Text>
      </Card>
      <View style={screenStyles.statGrid}>
        <StatPill label="Missions" value={profile.totalMissionsCompleted} />
        <StatPill label="Runs" value={profile.totalRunsCompleted} tone="blue" />
        <StatPill label="KOs" value={profile.totalKOs} tone="red" />
        <StatPill label="Perfect" value={profile.perfectRuns} tone="green" />
      </View>
      <GameButton label="Back" variant="ghost" onPress={onBack} />
    </Screen>
  );
}

function GameplayScreen({
  topStatus,
  session,
  mission,
  modeName,
  bossName,
  bodyguardName,
  vehicleName,
  weaponName,
  powerupName,
  alertMeter,
  policeMeter,
  playerPoint,
  onMove,
  onAction,
  onComplete,
  onLose,
  onPause,
}: {
  topStatus: React.ReactNode;
  session: GameSession;
  mission: Mission;
  modeName: string;
  bossName: string;
  bodyguardName: string;
  vehicleName: string;
  weaponName: string;
  powerupName: string;
  alertMeter: number;
  policeMeter: number;
  playerPoint: { x: number; y: number };
  onMove: (dx: number, dy: number) => void;
  onAction: (kind: 'weapon' | 'powerup' | 'vehicle' | 'secret' | 'dance') => void;
  onComplete: () => void;
  onLose: () => void;
  onPause: () => void;
}) {
  const currentMissionSlot = ((mission.missionNumber - 1) % 5) + 1;
  const completed = session.missionIds.slice(0, session.currentIndex).map((_, index) => index + 1);
  const defeated = session.bossHealth <= 0 || session.bodyguardHealth <= 0;
  return (
    <Screen title={modeName} subtitle={mission.title} right={topStatus}>
      <Card>
        <Text style={screenStyles.cardTitle}>Current Objective</Text>
        <Text style={screenStyles.bodyText}>{mission.objective}</Text>
        <ProgressTracker current={currentMissionSlot} completed={completed} />
      </Card>
      <View style={screenStyles.hudRow}>
        <Meter label={`${bossName} health`} value={session.bossHealth} color={colors.gold} />
        <Meter label={`${bodyguardName} health`} value={session.bodyguardHealth} color={colors.green} />
        <Meter label="Enemy alert" value={alertMeter} color={colors.red} />
        <Meter label="Police warning" value={policeMeter} color={colors.blue} />
      </View>
      <View style={screenStyles.playfield}>
        <Text style={screenStyles.mapLabel}>Mini Map</Text>
        <View style={[screenStyles.escapePoint, { right: 24, top: 26 }]} />
        <View style={[screenStyles.enemyDot, { left: 48, top: 44 }]} />
        <View style={[screenStyles.enemyDot, { right: 60, bottom: 42 }]} />
        <View style={[screenStyles.playerDot, { left: `${playerPoint.x}%`, top: `${playerPoint.y}%` }]}>
          <Text style={screenStyles.dotText}>B</Text>
        </View>
        <View style={[screenStyles.bossDot, { left: `${Math.max(8, playerPoint.x - 8)}%`, top: `${Math.min(80, playerPoint.y + 8)}%` }]}>
          <Text style={screenStyles.dotText}>S</Text>
        </View>
      </View>
      <View style={screenStyles.controlsGrid}>
        <GameButton label="Up" small variant="ghost" onPress={() => onMove(0, -8)} />
        <GameButton label="Left" small variant="ghost" onPress={() => onMove(-8, 0)} />
        <GameButton label="Right" small variant="ghost" onPress={() => onMove(8, 0)} />
        <GameButton label="Down" small variant="ghost" onPress={() => onMove(0, 8)} />
      </View>
      <View style={screenStyles.actionGrid}>
        <GameButton label={weaponName} icon="W" small onPress={() => onAction('weapon')} />
        <GameButton label={powerupName} icon="P" small variant="secondary" onPress={() => onAction('powerup')} />
        <GameButton label={vehicleName} icon="V" small variant="secondary" onPress={() => onAction('vehicle')} />
        <GameButton label="Secret Search" icon="?" small variant="ghost" onPress={() => onAction('secret')} />
        <GameButton label={mission.dance ?? funnyDances[mission.missionNumber % funnyDances.length]} icon="D" small variant="ghost" onPress={() => onAction('dance')} />
      </View>
      {session.foundWeapons.length ? <Text style={screenStyles.metaText}>Found this run: {session.foundWeapons.map((id) => weaponById(id).name).join(', ')}</Text> : null}
      {defeated ? (
        <GameButton label="Boss Captured" variant="danger" onPress={onLose} />
      ) : (
        <GameButton label="Complete Mission Objective" onPress={onComplete} />
      )}
      <GameButton label="Pause" variant="ghost" onPress={onPause} />
    </Screen>
  );
}

function MissionCompleteScreen({ topStatus, reward, session, rankClass, onNext, onHome }: { topStatus: React.ReactNode; reward: RewardResult; session: GameSession | null; rankClass: string; onNext: () => void; onHome: () => void }) {
  return (
    <Screen title="Mission Completed" subtitle={`Rank class: ${rankClass}`} right={topStatus}>
      <Card>
        <Text style={screenStyles.resultTitle}>Mission Complete</Text>
        <Text style={screenStyles.bodyText}>Cash earned: ${reward.cashEarned}</Text>
        <Text style={screenStyles.bodyText}>Gems earned: {reward.gemsEarned}</Text>
        <Text style={screenStyles.bodyText}>KOs: {reward.kos}</Text>
        <Text style={screenStyles.bodyText}>Stars: {reward.stars}</Text>
        <Text style={screenStyles.bodyText}>Time taken: {reward.timeSeconds}s</Text>
        <Text style={screenStyles.bodyText}>Boss damage taken: {reward.bossDamageTaken}</Text>
        <Text style={screenStyles.bodyText}>Bodyguard damage taken: {reward.bodyguardDamageTaken}</Text>
        <Text style={screenStyles.bodyText}>Loot: {reward.lootCollected.join(', ')}</Text>
        <Text style={screenStyles.cardTitle}>Grade {reward.grade}</Text>
      </Card>
      <GameButton label={session && session.currentIndex >= session.missionIds.length ? 'Finish Run' : 'Next Mission'} onPress={onNext} />
      <GameButton label="Return to Hideout" variant="ghost" onPress={onHome} />
    </Screen>
  );
}

function RunCompleteScreen({ topStatus, result, profile, rankClass, onNext, onHome, onUpgrade }: { topStatus: React.ReactNode; result: RunResult; profile: PlayerProfile; rankClass: string; onNext: () => void; onHome: () => void; onUpgrade: () => void }) {
  return (
    <Screen title="Operation Complete!" subtitle="Confetti burst: next 5-mission batch unlocked." right={topStatus}>
      <View style={screenStyles.confettiRow}>
        {Array.from({ length: 18 }).map((_, index) => (
          <View key={index} style={[screenStyles.confetti, { backgroundColor: index % 2 ? colors.gold : colors.red, transform: [{ rotate: `${index * 18}deg` }] }]} />
        ))}
      </View>
      <Card style={{ borderColor: colors.gold }}>
        <Text style={screenStyles.resultTitle}>Operation Complete!</Text>
        <Text style={screenStyles.bodyText}>Missions completed: 5/5</Text>
        <Text style={screenStyles.bodyText}>Total KOs: {result.totalKOs}</Text>
        <Text style={screenStyles.bodyText}>Overall performance: {result.grade}</Text>
        <Text style={screenStyles.bodyText}>Boss health remaining: {Math.round(result.bossHealth)}</Text>
        <Text style={screenStyles.bodyText}>Bodyguard health remaining: {Math.round(result.bodyguardHealth)}</Text>
        <Text style={screenStyles.bodyText}>Cash earned: ${result.cashEarned}</Text>
        <Text style={screenStyles.bodyText}>Gems earned: {result.gemsEarned}</Text>
        <Text style={screenStyles.bodyText}>Bonus gems: {result.bonusGems}</Text>
        <Text style={screenStyles.bodyText}>Total gems balance: {profile.gems}</Text>
        <Text style={screenStyles.cardTitle}>Performance grade: {result.grade}</Text>
        <Text style={screenStyles.badge}>#{profile.rankNumber} {rankClass}</Text>
      </Card>
      <GameButton label="Continue to Next Mission Batch" onPress={onNext} />
      <GameButton label="Upgrade Gear" variant="secondary" onPress={onUpgrade} />
      <GameButton label="Return to Hideout" variant="ghost" onPress={onHome} />
    </Screen>
  );
}

function GameOverScreen({ profile, topStatus, session, onRevive, onHome, onWait }: { profile: PlayerProfile; topStatus: React.ReactNode; session: GameSession | null; onRevive: () => void; onHome: () => void; onWait: () => void }) {
  const canRevive = !!session && profile.gems >= REVIVE_GEM_COST;
  return (
    <Screen title="Boss Captured" subtitle="Bodyguard failed. Keep it arcade: recover, revive, or regroup." right={topStatus}>
      <Card style={{ borderColor: colors.red }}>
        <Text style={screenStyles.resultTitle}>Boss Captured</Text>
        <Text style={screenStyles.bodyText}>Bodyguard Failed</Text>
        <Text style={screenStyles.bodyText}>Lives remaining: {profile.lifeSystem.lives}/5</Text>
        <Text style={screenStyles.bodyText}>Next life refresh: {countdownText(profile.lifeSystem.nextLifeAt)}</Text>
      </Card>
      <GameButton label={`Revive using ${REVIVE_GEM_COST} gems`} disabled={!canRevive} onPress={onRevive} />
      {!canRevive ? <Text style={screenStyles.warning}>Not enough gems or no active run to revive.</Text> : null}
      <GameButton label="Return to Hideout" variant="secondary" onPress={onHome} />
      <GameButton label="Wait for Lives Refresh" variant="ghost" onPress={onWait} />
    </Screen>
  );
}

function ToggleRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Card>
      <View style={screenStyles.settingRow}>
        <Text style={screenStyles.cardTitle}>{label}</Text>
        <GameButton label={value} small onPress={onPress} />
      </View>
    </Card>
  );
}

function CycleRow<T extends string>({ label, value, values, onPick }: { label: string; value: T; values: T[]; onPick: (value: T) => void }) {
  const next = values[(values.indexOf(value) + 1) % values.length];
  return (
    <Card>
      <View style={screenStyles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.cardTitle}>{label}</Text>
          <Text style={screenStyles.bodyText}>{value}</Text>
        </View>
        <GameButton label="Change" small onPress={() => onPick(next)} />
      </View>
    </Card>
  );
}

const screenStyles = StyleSheet.create({
  splashWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  skyPanel: {
    height: 390,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.redDark,
    backgroundColor: '#1d0a16',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 18,
  },
  characterSilhouette: {
    position: 'absolute',
    bottom: 44,
    width: 48,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  logo: {
    color: '#fff4fb',
    fontSize: 46,
    fontWeight: '900',
    textShadowColor: '#ff4aa1',
    textShadowRadius: 18,
    letterSpacing: 0,
  },
  logoSub: {
    color: colors.gold,
    fontWeight: '900',
    fontSize: 13,
  },
  logoSmall: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 34,
    marginBottom: 16,
  },
  loadingText: {
    color: colors.muted,
    textAlign: 'center',
    fontWeight: '800',
  },
  loadingDots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: colors.red,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 14,
    borderRadius: 8,
    backgroundColor: '#26151b',
    overflow: 'hidden',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.red,
  },
  percent: {
    color: colors.gold,
    fontWeight: '900',
    marginVertical: 12,
  },
  tipLabel: {
    color: colors.gold,
    fontWeight: '900',
  },
  tipText: {
    color: colors.text,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 6,
    width: '100%',
  },
  heroHideout: {
    height: 240,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    backgroundColor: '#130b10',
    overflow: 'hidden',
    marginBottom: 12,
  },
  vaultDoor: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 80,
    height: 112,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: colors.goldSoft,
    backgroundColor: '#201a1d',
  },
  bossChair: {
    position: 'absolute',
    left: 124,
    bottom: 34,
    width: 88,
    height: 96,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#4b1218',
    borderWidth: 2,
    borderColor: colors.red,
  },
  weaponWall: {
    position: 'absolute',
    left: 14,
    top: 28,
    width: 116,
    height: 72,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleGate: {
    position: 'absolute',
    right: 16,
    top: 26,
    width: 110,
    height: 54,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideoutLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  hideoutTitle: {
    position: 'absolute',
    left: 18,
    bottom: 14,
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 5,
  },
  bodyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  metaText: {
    color: '#9f8e87',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  menuTile: {
    width: '31%',
    minHeight: 82,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(28,18,24,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  menuIcon: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '900',
  },
  menuLabel: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
  },
  inlineStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    color: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '900',
  },
  warning: {
    color: '#ff9a9e',
    marginBottom: 10,
    lineHeight: 18,
  },
  rewardTile: {
    width: '47%',
    minHeight: 88,
  },
  avatar: {
    color: colors.bg,
    backgroundColor: colors.gold,
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontWeight: '900',
  },
  hudRow: {
    marginBottom: 4,
  },
  playfield: {
    height: 260,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#101016',
    marginBottom: 12,
    overflow: 'hidden',
  },
  mapLabel: {
    color: colors.muted,
    position: 'absolute',
    left: 10,
    top: 8,
    fontWeight: '900',
    fontSize: 11,
  },
  playerDot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bossDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enemyDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.red,
  },
  escapePoint: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.blue,
  },
  dotText: {
    color: colors.bg,
    fontWeight: '900',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  resultTitle: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
  },
  confettiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  confetti: {
    width: 12,
    height: 28,
    borderRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
});
