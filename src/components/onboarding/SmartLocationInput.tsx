import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT, SPACING } from './OnboardingHeader';
import { useBrazilianCities, CityOption } from '../../utils/useBrazilianCities';

interface SmartLocationInputProps {
  city: string;
  state: string;
  onSelect: (city: string, uf: string) => void;
  placeholder?: string;
}

const MAX_RESULTS = 30;

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SmartLocationInput({
  city,
  state,
  onSelect,
  placeholder = 'Digite sua cidade',
}: SmartLocationInputProps) {
  const { cities, loading, error } = useBrazilianCities();

  // texto exibido no input: se já tem seleção confirmada, mostra "Cidade - Estado"
  const [query, setQuery] = useState(
    city && state ? `${city} - ${cities.find((c) => c.city === city && c.uf === state)?.stateName ?? state}` : ''
  );
  const [isFocused, setIsFocused] = useState(false);
  const [selected, setSelected] = useState(Boolean(city && state));

  useEffect(() => {
    if (isFocused) return;

    if (city && state) {
      const stateName = cities.find((c) => c.city === city && c.uf === state)?.stateName ?? state;
      setQuery(`${city} - ${stateName}`);
      setSelected(true);
    } else {
      setQuery('');
      setSelected(false);
    }
  }, [city, state, cities, isFocused]);

  const results = useMemo(() => {
    if (!isFocused) return [];

    const term = normalize(query);

    // input vazio: não mostra a lista inteira de 5570 cidades
    if (term.length < 2) return [];

    return cities
      .filter((c) => c.searchKey.includes(term))
      .sort((a, b) => {
        // prioriza cidades cujo nome começa com o termo digitado
        const aStarts = normalize(a.city).startsWith(term);
        const bStarts = normalize(b.city).startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.city.localeCompare(b.city);
      })
      .slice(0, MAX_RESULTS);
  }, [cities, query, isFocused]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setSelected(false);
  };

  const handlePickOption = (option: CityOption) => {
    setQuery(option.label);
    setSelected(true);
    setIsFocused(false);
    Keyboard.dismiss();
    onSelect(option.city, option.uf);
  };

  const showDropdown = isFocused && query.trim().length >= 2;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          selected && !isFocused && styles.inputContainerSelected,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={COLORS.textMuted}
          style={styles.searchIcon}
        />

        <TextInput
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {loading && <ActivityIndicator size="small" color={COLORS.textMuted} />}

        {selected && !loading && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.orange} />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma cidade encontrada para "{query}"
            </Text>
          ) : (
            <ScrollView
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {results.map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={styles.option}
                  activeOpacity={0.7}
                  onPress={() => handlePickOption(item)}
                >
                  <Text style={styles.optionCity}>{item.city}</Text>
                  <Text style={styles.optionState}> - {item.stateName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
  },

  inputContainerFocused: {
    borderColor: COLORS.orange,
  },

  inputContainerSelected: {
    borderColor: COLORS.orangeLight,
  },

  searchIcon: {
    marginRight: 2,
  },

  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
  },

  errorText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#D14343',
    marginTop: 6,
  },

  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    maxHeight: 260,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 20,
  },

  list: {
    maxHeight: 260,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  optionCity: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: COLORS.text,
  },

  optionState: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  emptyText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlign: 'center',
  },
});