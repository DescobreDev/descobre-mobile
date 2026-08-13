import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchPickerModal, PickerOption } from './SearchPickerModal';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';


export type { PickerOption } from './SearchPickerModal';

const C = {
  orange: '#f97316',
  text: '#0d1829',
  text2: '#3d4a5c',
  textMuted: '#6b7684',
  surface2: '#f4f6f9',
  border: '#e4e9f0',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
};

type SectorPositionPickerProps = {
  sector: PickerOption | null;
  position: PickerOption | null;
  onChangeSector: (item: PickerOption | null) => void;
  onChangePosition: (item: PickerOption | null) => void;
  sectorLabel?: string;
  positionLabel?: string;
};

export function SectorPositionPicker({
  sector,
  position,
  onChangeSector,
  onChangePosition,
  sectorLabel = 'Área de atuação',
  positionLabel = 'Cargo desejado',
}: SectorPositionPickerProps) {
  const [modalMode, setModalMode] = useState<'sector' | 'position' | null>(null);

  const openSectorModal = () => setModalMode('sector');

  const openPositionModal = () => {
    if (!sector) {
      Alert.alert('Selecione o setor primeiro', 'Escolha uma área de atuação antes de definir o cargo.');
      return;
    }
    setModalMode('position');
  };

  const handleSearch = async (text: string): Promise<PickerOption[]> => {
    if (modalMode === 'sector') {
      const { data } = await api.get(ENDPOINTS.onboarding.sectors(text));
      return data;
    }
    if (modalMode === 'position' && sector) {
      const { data } = await api.get(ENDPOINTS.onboarding.positions(sector.id, text));
      return data;
    }
    return [];
  };

  const handleSelect = (item: PickerOption) => {
    if (modalMode === 'sector') {
      onChangeSector(item);
      onChangePosition(null); // troca de setor invalida o cargo já escolhido
    } else if (modalMode === 'position') {
      onChangePosition(item);
    }
    setModalMode(null);
  };

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{sectorLabel}</Text>
        <TouchableOpacity style={styles.selectInput} onPress={openSectorModal} activeOpacity={0.7}>
          <Text style={[styles.selectInputText, !sector && styles.selectInputPlaceholder]}>
            {sector?.name ?? 'Selecionar setor'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{positionLabel}</Text>
        <TouchableOpacity style={styles.selectInput} onPress={openPositionModal} activeOpacity={0.7}>
          <Text style={[styles.selectInputText, !position && styles.selectInputPlaceholder]}>
            {position?.name ?? 'Selecionar cargo'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={C.textMuted} />
        </TouchableOpacity>
      </View>

      <SearchPickerModal
        visible={modalMode !== null}
        title={modalMode === 'sector' ? 'Selecionar setor' : 'Selecionar cargo'}
        onSearch={handleSearch}
        onSelect={handleSelect}
        onClose={() => setModalMode(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  fieldLabel: { fontFamily: F.medium, fontSize: 13.5, color: C.text2, marginBottom: 6 },
  selectInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInputText: { fontFamily: F.medium, fontSize: 15, color: C.text },
  selectInputPlaceholder: { color: C.textMuted, fontFamily: F.regular },
});