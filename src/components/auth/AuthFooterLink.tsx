import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, fontSize } from '../../theme';

type AuthFooterLinkProps = {
  text: string;
  linkLabel: string;
  onPress: () => void;
};

export function AuthFooterLink({ text, linkLabel, onPress }: AuthFooterLinkProps) {
  return (
    <>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.link}>{linkLabel}</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: fontSize.sm, color: colors.textMuted, fontFamily: typography.fontRegular },
  link: { fontSize: fontSize.sm, color: colors.orange, fontFamily: typography.fontBold },
});