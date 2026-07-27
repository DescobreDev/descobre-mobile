import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  text: '#0d1829',
  text2: '#5a6a82',
  textMuted: '#aab4c4',
  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#eef1f6',
};

const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
};

const SEARCH_DEBOUNCE_MS = 300;

export interface SearchOption {
  id: number;
  name: string;
}

interface SearchSelectProps {
  label: string;
  placeholder: string;
  value: SearchOption | null;
  onSelect: (item: SearchOption | null) => void;
  /** Pode ser uma busca remota (API) ou local — veja `createLocalSearch`. */
  fetchOptions: (query: string) => Promise<SearchOption[]>;
  disabled?: boolean;
  /** Texto exibido no lugar do placeholder normal enquanto `disabled` for true. */
  disabledHint?: string;
  emptyLabel?: string;
}

/**
 * Input de busca com resultados em dropdown ("select2"), pensado para grandes listas
 * onde uma lista fixa de chips não escala. Quando um item é selecionado, o campo vira
 * um "pill" com opção de remover, igual a um multi-select de uma via só.
 */
export function SearchSelect({
  label,
  placeholder,
  value,
  onSelect,
  fetchOptions,
  disabled = false,
  disabledHint,
  emptyLabel = 'Nenhum resultado',
}: SearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || disabled) return;

    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const options = await fetchOptions(query);
        setResults(options);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, open, disabled, fetchOptions]);

  // Se o campo for desabilitado enquanto o dropdown está aberto (ex: setor foi limpo
  // e o cargo depende dele), fecha e limpa o estado de busca.
  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setQuery('');
      setResults([]);
    }
  }, [disabled]);

  if (value) {
    return (
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.selectedRow}>
          <Text style={styles.selectedText} numberOfLines={1}>
            {value.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              onSelect(null);
              setQuery('');
              setResults([]);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        editable={!disabled}
        placeholder={disabled ? disabledHint ?? placeholder : placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={[styles.input, disabled && styles.inputDisabled]}
      />

      {open && !disabled && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.orange} style={styles.dropdownLoading} />
          ) : results.length === 0 ? (
            <Text style={styles.dropdownEmpty}>{emptyLabel}</Text>
          ) : (
            results.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Adapta uma lista já carregada em memória para a assinatura `fetchOptions` do
 * SearchSelect, fazendo o filtro localmente (sem chamada de rede a cada tecla).
 * Ideal para catálogos pequenos/médios que já foram buscados uma única vez
 * (setores, benefícios, cargos de um setor específico).
 */
export function createLocalSearch(items: SearchOption[]) {
  return async (query: string): Promise<SearchOption[]> => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.name.toLowerCase().includes(normalized));
  };
}

const styles = StyleSheet.create({
  fieldBlock: { marginBottom: 16 },

  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  input: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  inputDisabled: {
    backgroundColor: COLORS.surface2,
    color: COLORS.textMuted,
  },

  dropdown: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    maxHeight: 180,
    overflow: 'hidden',
  },

  dropdownLoading: { paddingVertical: 12 },

  dropdownEmpty: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 12,
    textAlign: 'center',
  },

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  dropdownItemText: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.text,
  },

  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  selectedText: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: COLORS.orangeDark,
    flex: 1,
  },
});