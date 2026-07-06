import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const C = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff2e3',
  orangeBorder: 'rgba(249,115,22,0.25)',
  text: '#0d1829',
  text2: '#5a6a82',
  textMuted: '#9aaabb',
  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#e9ecf2',
  green: '#10b981',
  greenLight: '#ecfdf5',
  red: '#ef4444',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

type SectionItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

function ProfileSection({ title, items }: { title: string; items: SectionItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              style={styles.sectionItem}
              onPress={item.onPress}
              activeOpacity={item.onPress ? 0.7 : 1}
            >
              <View style={[styles.sectionItemIcon, item.danger && styles.sectionItemIconDanger]}>
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.danger ? C.red : C.orange}
                />
              </View>
              <View style={styles.sectionItemContent}>
                <Text style={[styles.sectionItemLabel, item.danger && styles.sectionItemLabelDanger]}>
                  {item.label}
                </Text>
                {item.sublabel && (
                  <Text style={styles.sectionItemSublabel}>{item.sublabel}</Text>
                )}
              </View>
              {item.rightElement ?? (
                item.onPress && (
                  <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                )
              )}
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.itemDivider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { candidate, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const firstName = candidate?.name?.split(' ')[0] ?? 'Candidato';
  const fullName = candidate?.name ?? 'Candidato';
  const email = candidate?.email ?? '';

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(fullName)}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{fullName}</Text>
            <Text style={styles.avatarEmail}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
            <Ionicons name="pencil" size={15} color={C.orangeDark} />
            <Text style={styles.editAvatarText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Completion banner */}
        <View style={styles.completionBanner}>
          <View style={styles.completionLeft}>
            <Text style={styles.completionTitle}>Complete seu perfil</Text>
            <Text style={styles.completionSub}>
              Perfis completos têm 3x mais chances de serem vistos por recrutadores.
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '40%' }]} />
            </View>
            <Text style={styles.completionPercent}>40% completo</Text>
          </View>
          <Ionicons name="ribbon-outline" size={36} color={C.orange} />
        </View>

        {/* Dados pessoais */}
        <ProfileSection
          title="Dados pessoais"
          items={[
            {
              icon: 'person-outline',
              label: 'Nome completo',
              sublabel: fullName,
              onPress: () => {},
            },
            {
              icon: 'mail-outline',
              label: 'E-mail',
              sublabel: email,
              onPress: () => {},
            },
            {
              icon: 'call-outline',
              label: 'Telefone',
              sublabel: 'Não informado',
              onPress: () => {},
            },
            {
              icon: 'location-outline',
              label: 'Localização',
              sublabel: 'Não informada',
              onPress: () => {},
            },
          ]}
        />

        {/* Currículo */}
        <ProfileSection
          title="Currículo"
          items={[
            {
              icon: 'document-attach-outline',
              label: 'Meu currículo',
              sublabel: 'Nenhum arquivo enviado',
              onPress: () => {},
            },
            {
              icon: 'briefcase-outline',
              label: 'Experiências profissionais',
              sublabel: '0 experiências',
              onPress: () => {},
            },
            {
              icon: 'school-outline',
              label: 'Formação acadêmica',
              sublabel: '0 formações',
              onPress: () => {},
            },
            {
              icon: 'ribbon-outline',
              label: 'Habilidades',
              sublabel: '0 habilidades',
              onPress: () => {},
            },
          ]}
        />

        {/* Preferências */}
        <ProfileSection
          title="Preferências"
          items={[
            {
              icon: 'notifications-outline',
              label: 'Notificações de vagas',
              rightElement: (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: C.border, true: C.orangeLight }}
                  thumbColor={notificationsEnabled ? C.orange : C.textMuted}
                  ios_backgroundColor={C.border}
                />
              ),
            },
            {
              icon: 'lock-closed-outline',
              label: 'Alterar senha',
              onPress: () => {},
            },
          ]}
        />

        {/* Conta */}
        <ProfileSection
          title="Conta"
          items={[
            {
              icon: 'log-out-outline',
              label: 'Sair da conta',
              danger: true,
              onPress: handleLogout,
            },
          ]}
        />

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.surface2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 14,
    backgroundColor: C.orange,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#fff',
  },

  scrollContent: {
    paddingBottom: 32,
  },

  // Avatar
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.orangeLight,
    borderWidth: 2,
    borderColor: C.orangeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: F.bold,
    fontSize: 24,
    color: C.orange,
  },
  avatarInfo: {
    flex: 1,
    gap: 2,
  },
  avatarName: {
    fontFamily: F.semiBold,
    fontSize: 20,
    color: C.text,
  },
  avatarEmail: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textMuted,
  },
  editAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.orangeBorder,
    backgroundColor: C.orangeLight,
  },
  editAvatarText: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: C.orangeDark,
  },

  // Completion
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.orangeLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    padding: 16,
  },
  completionLeft: {
    flex: 1,
    gap: 4,
  },
  completionTitle: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: C.orangeDark,
  },
  completionSub: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.text2,
    lineHeight: 19,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: C.orangeBorder,
    borderRadius: 99,
    marginTop: 8,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: C.orange,
    borderRadius: 99,
  },
  completionPercent: {
    fontFamily: F.medium,
    fontSize: 14,
    color: C.orangeDark,
    marginTop: 2,
  },

  // Sections
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  sectionItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionItemIconDanger: {
    backgroundColor: C.redLight,
  },
  sectionItemContent: {
    flex: 1,
    gap: 1,
  },
  sectionItemLabel: {
    fontFamily: F.medium,
    fontSize: 16,
    color: C.text,
  },
  sectionItemLabelDanger: {
    color: C.red,
  },
  sectionItemSublabel: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textMuted,
  },
  itemDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 60,
  },

  versionText: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 28,
  },
});