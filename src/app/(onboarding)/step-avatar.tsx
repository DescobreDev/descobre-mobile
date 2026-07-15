import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  OnboardingHeader,
  COLORS,
  FONT,
  SPACING,
} from '../../components/onboarding/OnboardingHeader';
import { PrimaryButton } from '../../components/onboarding/PrimaryButton';
import { useOnboardingStore } from '../../store/onBoardingStore';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';

const PRESET_AVATARS = [
  '🧑', '👩', '👨', '🧑‍💻', '👩‍💼', '👨‍🔬',
  '👩‍🎨', '👨‍🏫', '🧑‍🔧', '👩‍⚕️', '👨‍🍳', '🧑‍🚀',
];

async function uploadAvatar(_uri: string): Promise<string> {
  return _uri;
}

export default function Step6Avatar() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    prevStep,
    setAvatar,
    data,
  } = useOnboardingStore();

  const [selectedAvatar, setSelectedAvatarLocal] = useState<number | null>(
    data.avatarIndex
  );
  const [photoUri, setPhotoUri] = useState<string | null>(data.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      handlePhotoSelected(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      handlePhotoSelected(result.assets[0].uri);
    }
  };

  const handlePhotoSelected = async (uri: string) => {
    setUploading(true);
    try {
      const url = await uploadAvatar(uri);
      setPhotoUri(url);
      setSelectedAvatarLocal(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível processar a imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const selectPreset = (index: number) => {
    setSelectedAvatarLocal(index);
    setPhotoUri(null);
  };

  const clearSelection = () => {
    setSelectedAvatarLocal(null);
    setPhotoUri(null);
  };

  const handleFinish = async () => {
    setSaving(true);

    try {
      setAvatar(selectedAvatar, photoUri);

      const store = useOnboardingStore.getState();

      await api.post(ENDPOINTS.onboarding.complete, {
        discCompleted: store.data.discCompleted,
        interestIds: store.data.interestIds,
        priorities: store.data.priorityIds.map((id, idx) => ({
          priorityId: id,
          order: idx + 1,
        })),
        education: store.data.education,
        firstJobSeeker: store.data.firstJobSeeker,
        experiences: store.data.experiences,
        skills: store.data.skills,
        languages: store.data.languages,
        avatarIndex: selectedAvatar,
        avatarUrl: photoUri,

        // preferências de vaga
        desiredSectorId: store.data.desiredSectorId,
        desiredPositionId: store.data.desiredPositionId,
        salaryMin: store.data.salaryMin
          ? parseFloat(store.data.salaryMin)
          : undefined,
        salaryMax: store.data.salaryMax
          ? parseFloat(store.data.salaryMax)
          : undefined,
        salaryNegotiable: store.data.salaryNegotiable,
        contractTypes: store.data.contractTypes,
        experienceLevel: store.data.experienceLevel,
        acceptsTravel: store.data.acceptsTravel,

        // localização
        city: store.data.city,
        state: store.data.state,
      });

      router.replace('/(onboarding)/onboarding-complete');
    } catch (err: any) {
      console.log('Erro ao concluir onboarding:', err);
      Alert.alert(
        'Erro',
        'Não foi possível concluir o seu perfil. Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const hasSelection = selectedAvatar !== null || photoUri !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title="Foto de perfil"
        subtitle="Uma boa foto aumenta suas chances de se destacar."
        optional
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.previewWrapper}>
          <View style={styles.previewCircle}>
            {uploading ? (
              <ActivityIndicator color={COLORS.orange} size="large" />
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
            ) : selectedAvatar !== null ? (
              <Text style={styles.previewEmoji}>
                {PRESET_AVATARS[selectedAvatar]}
              </Text>
            ) : (
              <Ionicons name="person" size={52} color={COLORS.border} />
            )}
          </View>
          {hasSelection && (
            <TouchableOpacity onPress={clearSelection} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              <Text style={styles.clearBtnText}>Remover</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.uploadOptions}>
          <TouchableOpacity
            onPress={pickFromCamera}
            style={styles.uploadBtn}
            activeOpacity={0.75}
          >
            <View style={[styles.uploadIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="camera-outline" size={22} color={COLORS.indigo} />
            </View>
            <View>
              <Text style={styles.uploadBtnTitle}>Tirar foto</Text>
              <Text style={styles.uploadBtnSub}>Usar câmera do celular</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <View style={styles.uploadDivider} />

          <TouchableOpacity
            onPress={pickFromGallery}
            style={styles.uploadBtn}
            activeOpacity={0.75}
          >
            <View style={[styles.uploadIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="images-outline" size={22} color={COLORS.green} />
            </View>
            <View>
              <Text style={styles.uploadBtnTitle}>Escolher da galeria</Text>
              <Text style={styles.uploadBtnSub}>Selecionar uma foto existente</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <View style={styles.presetsBlock}>
          <Text style={styles.presetsLabel}>Ou escolha um avatar</Text>
          <View style={styles.presetsGrid}>
            {PRESET_AVATARS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectPreset(i)}
                style={[
                  styles.presetItem,
                  selectedAvatar === i && styles.presetItemSelected,
                ]}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedAvatar === i }}
                accessibilityLabel={`Avatar ${i + 1}`}
              >
                <Text style={styles.presetEmoji}>{emoji}</Text>
                {selectedAvatar === i && (
                  <View style={styles.presetCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Concluir perfil 🎉"
          onPress={handleFinish}
          loading={saving}
        />
        {!hasSelection && (
          <TouchableOpacity onPress={handleFinish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Pular e concluir sem foto</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },

  previewWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  previewCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: 120, height: 120 },
  previewEmoji: { fontSize: 64 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  uploadOptions: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  uploadBtnSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  uploadDivider: { height: 1, backgroundColor: COLORS.border },

  presetsBlock: { gap: SPACING.sm },
  presetsLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetItem: {
    width: '13.5%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  presetItemSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  presetEmoji: { fontSize: 28 },
  presetCheck: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoBox: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 19,
  },

  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMuted },
});