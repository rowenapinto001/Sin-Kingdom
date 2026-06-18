import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  DimensionValue,
} from 'react-native';

export const colors = {
  bg: '#08070d',
  panel: '#141018',
  panelSoft: '#211722',
  border: '#3b2730',
  red: '#ff3f46',
  redDark: '#8f1820',
  gold: '#f7b733',
  goldSoft: '#6f4a16',
  text: '#fff8ea',
  muted: '#b6a49b',
  green: '#4be09a',
  blue: '#5cc7ff',
  purple: '#b58cff',
};

type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function Screen({ children, scroll = true, title, subtitle, right }: ScreenProps) {
  const body = (
    <View style={styles.screenInner}>
      {(title || subtitle || right) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );

  return (
    <View style={styles.screen}>
      <HideoutBackdrop />
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

export function HideoutBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.backGlowRed} />
      <View style={styles.backGlowGold} />
      <View style={styles.floorGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <View key={`grid-h-${index}`} style={[styles.gridLineH, { top: 34 + index * 38 }]} />
        ))}
        {Array.from({ length: 6 }).map((_, index) => (
          <View key={`grid-v-${index}`} style={[styles.gridLineV, { left: `${index * 20}%` }]} />
        ))}
      </View>
    </View>
  );
}

export function Card({ children, style, dimmed = false }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; dimmed?: boolean }) {
  return <View style={[styles.card, dimmed && styles.dimmed, style]}>{children}</View>;
}

export function GameButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled,
  small,
}: {
  label: string;
  icon?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        small && styles.buttonSmall,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      {icon ? <Text style={styles.buttonIcon}>{icon}</Text> : null}
      <Text style={[styles.buttonText, small && styles.buttonTextSmall]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StatPill({ label, value, tone = 'gold' }: { label: string; value: string | number; tone?: 'gold' | 'red' | 'blue' | 'green' | 'purple' }) {
  return (
    <View style={[styles.statPill, styles[`stat_${tone}`]]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function Meter({ label, value, max = 100, color = colors.red }: { label: string; value: number; max?: number; color?: string }) {
  const width = `${Math.max(0, Math.min(100, (value / max) * 100))}%` as DimensionValue;
  return (
    <View style={styles.meterWrap}>
      <View style={styles.meterLabelRow}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterLabel}>{Math.round(value)}</Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function ProgressTracker({ total = 5, current, completed }: { total?: number; current: number; completed: number[] }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, index) => {
        const mission = index + 1;
        const done = completed.includes(mission);
        const active = current === mission;
        return (
          <View key={mission} style={[styles.progressDot, done && styles.progressDone, active && styles.progressActive]}>
            <Text style={styles.progressText}>{mission}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function SectionTitle({ title, note }: { title: string; note?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionText}>{title}</Text>
      {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <Text style={styles.empty}>{text}</Text>
    </Card>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  screenInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  backGlowRed: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 63, 70, 0.24)',
  },
  backGlowGold: {
    position: 'absolute',
    bottom: 60,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(247, 183, 51, 0.18)',
  },
  floorGrid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
    opacity: 0.35,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#40141d',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#563018',
  },
  card: {
    backgroundColor: 'rgba(20, 16, 24, 0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  dimmed: {
    opacity: 0.52,
  },
  button: {
    minHeight: 50,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  buttonSmall: {
    minHeight: 38,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  button_primary: {
    backgroundColor: colors.red,
    borderColor: '#ff8085',
  },
  button_secondary: {
    backgroundColor: '#2a1d18',
    borderColor: colors.goldSoft,
  },
  button_ghost: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.border,
  },
  button_danger: {
    backgroundColor: colors.redDark,
    borderColor: colors.red,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonIcon: {
    color: colors.text,
    fontSize: 18,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  buttonTextSmall: {
    fontSize: 12,
  },
  statPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 76,
    alignItems: 'center',
  },
  stat_gold: {
    backgroundColor: 'rgba(247,183,51,0.1)',
    borderColor: colors.goldSoft,
  },
  stat_red: {
    backgroundColor: 'rgba(255,63,70,0.1)',
    borderColor: colors.redDark,
  },
  stat_blue: {
    backgroundColor: 'rgba(92,199,255,0.1)',
    borderColor: '#24536c',
  },
  stat_green: {
    backgroundColor: 'rgba(75,224,154,0.1)',
    borderColor: '#25664a',
  },
  stat_purple: {
    backgroundColor: 'rgba(181,140,255,0.1)',
    borderColor: '#554078',
  },
  statValue: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 15,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  meterWrap: {
    marginBottom: 10,
  },
  meterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meterLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  meterTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#251c22',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  progressDot: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181119',
  },
  progressDone: {
    backgroundColor: '#1f4a32',
    borderColor: colors.green,
  },
  progressActive: {
    backgroundColor: '#5a1d23',
    borderColor: colors.red,
  },
  progressText: {
    color: colors.text,
    fontWeight: '900',
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionNote: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    color: colors.muted,
    lineHeight: 19,
  },
});
