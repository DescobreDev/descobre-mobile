import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT, SPACING } from './OnboardingHeader';

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

interface MonthYearPickerProps {
  /** Formato "MM/YYYY", ex: "03/2022" */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Impede selecionar datas futuras (padrão: true, útil pra "início"/"término") */
  disableFuture?: boolean;
}

function parseValue(value: string): { month: number; year: number } | null {
  const [m, y] = value.split('/');
  const month = Number(m);
  const year = Number(y);

  if (!month || !year || month < 1 || month > 12) return null;

  return { month, year };
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = 'Selecione',
  disableFuture = true,
}: MonthYearPickerProps) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const parsed = parseValue(value);

  const [visible, setVisible] = useState(false);
  const [draftYear, setDraftYear] = useState(parsed?.year ?? currentYear);
  const [draftMonth, setDraftMonth] = useState(parsed?.month ?? null);

  const openModal = () => {
    setDraftYear(parsed?.year ?? currentYear);
    setDraftMonth(parsed?.month ?? null);
    setVisible(true);
  };

  const isMonthDisabled = (month: number) => {
    if (!disableFuture) return false;
    if (draftYear < currentYear) return false;
    if (draftYear > currentYear) return true;
    return month > currentMonth;
  };

  const isYearDisabled = (direction: 'next') => {
    if (!disableFuture) return false;
    return direction === 'next' && draftYear >= currentYear;
  };

  const handleConfirm = () => {
    if (!draftMonth) return;
    const mm = String(draftMonth).padStart(2, '0');
    onChange(`${mm}/${draftYear}`);
    setVisible(false);
  };

  const handleClear = () => {
    onChange('');
    setVisible(false);
  };

  const displayLabel = parsed
    ? `${MONTHS[parsed.month - 1]}/${parsed.year}`
    : placeholder;

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.75}
        onPress={openModal}
      >
        <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
        <Text style={[styles.triggerText, !parsed && styles.triggerPlaceholder]}>
          {displayLabel}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() => setDraftYear((y) => y - 1)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={22} color={COLORS.text} />
              </TouchableOpacity>

              <Text style={styles.yearText}>{draftYear}</Text>

              <TouchableOpacity
                onPress={() => !isYearDisabled('next') && setDraftYear((y) => y + 1)}
                disabled={isYearDisabled('next')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={isYearDisabled('next') ? COLORS.border : COLORS.text}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.monthsGrid}>
              {MONTHS.map((label, i) => {
                const month = i + 1;
                const disabled = isMonthDisabled(month);
                const selected = draftMonth === month;

                return (
                  <TouchableOpacity
                    key={label}
                    disabled={disabled}
                    onPress={() => setDraftMonth(month)}
                    style={[
                      styles.monthCell,
                      selected && styles.monthCellSelected,
                      disabled && styles.monthCellDisabled,
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.monthCellText,
                        selected && styles.monthCellTextSelected,
                        disabled && styles.monthCellTextDisabled,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!draftMonth}
                style={[styles.confirmBtn, !draftMonth && styles.confirmBtnDisabled]}
              >
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },

  triggerText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
  },

  triggerPlaceholder: {
    color: COLORS.textMuted,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  yearText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.text,
    minWidth: 64,
    textAlign: 'center',
  },

  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },

  monthCell: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 8,
  },

  monthCellSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },

  monthCellDisabled: {
    opacity: 0.35,
  },

  monthCellText: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.text,
  },

  monthCellTextSelected: {
    color: COLORS.orangeDark,
    fontFamily: FONT.semiBold,
  },

  monthCellTextDisabled: {
    color: COLORS.textMuted,
  },

  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },

  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  clearBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: COLORS.text2,
  },

  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
  },

  confirmBtnDisabled: {
    opacity: 0.4,
  },

  confirmBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: '#fff',
  },
});