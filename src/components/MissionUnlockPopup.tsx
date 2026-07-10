import { Pressable, StyleSheet, Text, View } from 'react-native';

type MissionUnlockPopupProps = {
  missionTitle: string;
  xp: number;
  cash: number;
  onStart: () => void;
  onClose?: () => void;
};

export default function MissionUnlockPopup({ missionTitle, xp, cash, onStart, onClose }: MissionUnlockPopupProps) {
  return (
    <View style={styles.root}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>NEW MISSION UNLOCKED</Text>
      </View>
      <Text style={styles.missionTitle}>{missionTitle}</Text>
      <View style={styles.rewardRow}>
        <View style={styles.rewardPill}>
          <Text style={styles.rewardIcon}>★</Text>
          <Text style={styles.rewardLabel}>XP</Text>
          <Text style={styles.rewardValue}>{xp}</Text>
        </View>
        <View style={[styles.rewardPill, styles.rewardPillCash]}>
          <Text style={styles.rewardIcon}>$</Text>
          <Text style={styles.rewardLabel}>Cash</Text>
          <Text style={styles.rewardValue}>{cash}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.startButton} onPress={onStart}>
          <Text style={styles.startButtonText}>Start Mission</Text>
        </Pressable>
        {onClose ? (
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Later</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 340,
    marginLeft: -170,
    marginTop: -140,
    padding: 18,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ffc334',
    backgroundColor: 'rgba(11, 6, 16, 0.97)',
    alignItems: 'center',
    shadowColor: '#ffc334',
    shadowOpacity: 0.75,
    shadowRadius: 22,
    zIndex: 50,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffc334',
    marginBottom: 12,
  },
  bannerText: {
    color: '#1a1206',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  missionTitle: {
    color: '#fff4ff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(255,46,138,0.12)',
  },
  rewardPillCash: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  rewardIcon: {
    color: '#ffc334',
    fontSize: 15,
    fontWeight: '900',
  },
  rewardLabel: {
    color: '#f7d5ff',
    fontSize: 12,
    fontWeight: '800',
  },
  rewardValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  startButton: {
    minWidth: 150,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffc334',
    borderWidth: 2,
    borderColor: '#fff0a6',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '900',
  },
  closeButton: {
    minWidth: 90,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#687084',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '900',
  },
});
