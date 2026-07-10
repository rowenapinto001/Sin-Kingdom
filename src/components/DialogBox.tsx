import { Pressable, StyleSheet, Text, View } from 'react-native';
import SpriteCharacter from './SpriteCharacter';
import { CharacterConfigId } from '../data/characterConfigs';

type DialogChoice = {
  label: string;
  onPress: () => void;
};

type DialogBoxProps = {
  title: string;
  text: string;
  choices?: DialogChoice[];
  onClose?: () => void;
  portraitCharacterId?: CharacterConfigId;
};

export default function DialogBox({ title, text, choices = [], onClose, portraitCharacterId }: DialogBoxProps) {
  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {portraitCharacterId ? (
          <View style={styles.portraitWrap}>
            <SpriteCharacter characterId={portraitCharacterId} direction="down" isMoving={false} currentAction="idle" scale={1.3} />
          </View>
        ) : null}
        <View style={styles.textColumn}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
      <View style={styles.choices}>
        {choices.map((choice) => (
          <Pressable key={choice.label} style={styles.choiceButton} onPress={choice.onPress}>
            <Text style={styles.choiceText}>{choice.label}</Text>
          </Pressable>
        ))}
        {onClose ? (
          <Pressable style={[styles.choiceButton, styles.closeButton]} onPress={onClose}>
            <Text style={styles.choiceText}>Close</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(9, 7, 16, 0.94)',
    shadowColor: '#ff2e8a',
    shadowOpacity: 0.65,
    shadowRadius: 16,
    zIndex: 40,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  portraitWrap: {
    width: 54,
    height: 74,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,46,138,0.65)',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    color: '#ffc334',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  text: {
    marginTop: 8,
    color: '#fff4ff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  choices: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff2e8a',
    backgroundColor: 'rgba(31, 7, 28, 0.96)',
  },
  closeButton: {
    borderColor: '#687084',
  },
  choiceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});
