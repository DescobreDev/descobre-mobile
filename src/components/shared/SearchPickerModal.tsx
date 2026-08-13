import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const C = {
  orange: '#f97316',
  text: '#0d1829',
  textMuted: '#6b7684',
  surface: '#ffffff',
  surface2: '#f4f6f9',
  border: '#e4e9f0',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
};

const SEARCH_DEBOUNCE_MS = 300;

export type PickerOption = { id: number; name: string };

type SearchPickerModalProps = {
  visible: boolean;
  title: string;
  onSearch: (text: string) => Promise<PickerOption[]>;
  onSelect: (item: PickerOption) => void;
  onClose: () => void;
  placeholder?: string;
};

export function SearchPickerModal({
  visible,
  title,
  onSearch,
  onSelect,
  onClose,
  placeholder = 'Buscar...',
}: SearchPickerModalProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<PickerOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca com debounce sempre que o texto muda ou o modal abre
  useEffect(() => {
    if (!visible) return;

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const result = await onSearch(query);
        setItems(result);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, visible]);

  // Reseta o estado interno ao fechar, pra não reabrir com busca antiga
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setItems([]);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={C.orange} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemText}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum resultado encontrado.</Text>}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface2, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  title: { fontFamily: F.semiBold, fontSize: 17, color: C.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 15, color: C.text },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  itemText: { fontFamily: F.medium, fontSize: 15, color: C.text },
  empty: { textAlign: 'center', marginTop: 40, fontFamily: F.regular, color: C.textMuted },
});