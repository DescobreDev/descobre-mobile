import { ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, fontSize, radius, spacing, layout } from '../../theme';

type AuthLayoutProps = {
  logoSource: ImageSourcePropType;
  badgeLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({
  logoSource,
  badgeLabel,
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.orange, colors.orangeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBlobLarge} />
        <View style={styles.headerBlobSmall} />

        <Image source={logoSource} style={styles.logo} resizeMode="contain" />

      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
          nestedScrollEnabled
        >
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.card}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  header: {
    height: layout.headerHeight,
    borderBottomLeftRadius: layout.headerRadius,
    borderBottomRightRadius: layout.headerRadius,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBlobLarge: {
    position: 'absolute',
    width: 220,
    height: 240,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -90,
    right: -60,
  },
  headerBlobSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -50,
    left: -30,
  },

  kav: {
    flex: 1,
    zIndex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 120,
    justifyContent: 'center',
  },

  logo: { width: 250, height: 200 },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.orangeLight,
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.orange },
  badgeText: { fontSize: fontSize.xs, fontFamily: typography.fontSemiBold, color: colors.orangeDark },

  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.fontBold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 26,
    textAlign: 'center',
    fontFamily: typography.fontRegular,
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});