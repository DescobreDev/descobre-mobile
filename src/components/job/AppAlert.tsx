import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors as C, fonts as F, radii as R } from '../../constants/jobs/theme';

export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
};

export type AlertVariant = 'default' | 'success' | 'danger' | 'warning';

type VariantStyle = { bg: string; fg: string; icon: React.ComponentProps<typeof Ionicons>['name'] };

const VARIANTS: Record<AlertVariant, VariantStyle> = {
  default: { bg: C.orangeLight, fg: C.orangeDark, icon: 'information-circle' },
  success: { bg: C.greenLight, fg: C.greenDark, icon: 'checkmark-circle' },
  danger: { bg: C.redLight, fg: C.redDark, icon: 'alert-circle' },
  warning: { bg: C.yellowLight, fg: C.yellowDark, icon: 'warning' },
};

export type AppAlertProps = {
  visible: boolean;
  title: string;
  message?: string;
  variant?: AlertVariant;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  buttons?: AlertButton[];
  onRequestClose: () => void;
};

/**
 * Modal de alerta/confirmação com a identidade visual do app.
 * Uso direto: <AppAlert visible title="..." buttons={[...]} onRequestClose={...} />
 * Uso ergonômico (API parecida com Alert.alert): ver hook useAppAlert() abaixo.
 */
export function AppAlert({
  visible,
  title,
  message,
  variant = 'default',
  icon,
  buttons,
  onRequestClose,
}: AppAlertProps) {
  const v = VARIANTS[variant];
  const finalButtons: AlertButton[] = buttons?.length ? buttons : [{ text: 'OK' }];

  const handlePress = (btn: AlertButton) => {
    onRequestClose();
    // pequeno delay pra deixar a animação do modal terminar antes de disparar ações (ex: outro modal)
    setTimeout(() => btn.onPress?.(), 120);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={styles.overlay} onPress={onRequestClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconCircle, { backgroundColor: v.bg }]}>
            <Ionicons name={icon ?? v.icon} size={28} color={v.fg} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={[styles.actions, finalButtons.length > 2 && styles.actionsColumn]}>
            {finalButtons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.85}
                  style={[
                    styles.btn,
                    isCancel && styles.btnGhost,
                    isDestructive && styles.btnDanger,
                    !isCancel && !isDestructive && styles.btnPrimary,
                  ]}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isCancel && styles.btnGhostText,
                      isDestructive && styles.btnDangerText,
                      !isCancel && !isDestructive && styles.btnPrimaryText,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type QueuedAlert = Omit<AppAlertProps, 'visible' | 'onRequestClose'>;

/**
 * Hook com API parecida com Alert.alert, só que renderiza o AppAlert estilizado.
 *
 *   const { alert, AlertComponent } = useAppAlert();
 *   alert('Título', 'Mensagem', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Ok', onPress: fn }]);
 *   // ... no JSX: {AlertComponent}
 */
export function useAppAlert() {
  const [config, setConfig] = useState<QueuedAlert | null>(null);
  const [visible, setVisible] = useState(false);

  const alert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: AlertButton[],
      options?: { variant?: AlertVariant; icon?: AppAlertProps['icon'] },
    ) => {
      setConfig({ title, message, buttons, variant: options?.variant, icon: options?.icon });
      setVisible(true);
    },
    [],
  );

  const hide = useCallback(() => setVisible(false), []);

  const AlertComponent = config ? (
    <AppAlert
      visible={visible}
      title={config.title}
      message={config.message}
      buttons={config.buttons}
      variant={config.variant}
      icon={config.icon}
      onRequestClose={hide}
    />
  ) : null;

  return { alert, AlertComponent };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,24,41,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.surface,
    borderRadius: R.lg,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: F.bold,
    fontSize: 18,
    color: C.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: F.regular,
    fontSize: 14.5,
    lineHeight: 20,
    color: C.text2,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionsColumn: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: C.orange },
  btnPrimaryText: { fontFamily: F.semiBold, fontSize: 15, color: '#fff' },
  btnGhost: { backgroundColor: C.surface2 },
  btnGhostText: { fontFamily: F.semiBold, fontSize: 15, color: C.text2 },
  btnDanger: { backgroundColor: C.redLight },
  btnDangerText: { fontFamily: F.semiBold, fontSize: 15, color: C.red },
  btnText: { fontFamily: F.semiBold, fontSize: 15 },
});