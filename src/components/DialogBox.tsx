import { Pressable, StyleSheet, Text, View } from 'react-native';

type DialogChoice = {
  label: string;
  onPress: () => void;
};

type DialogBoxProps = {
  title: string;
  text: string;
  choices?: DialogChoice[];
  onClose?: () => void;
};

export default function DialogBox({ title, text, choices = [], onClose }: DialogBoxProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
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
