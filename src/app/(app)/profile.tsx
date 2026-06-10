import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu perfil</Text>
      </View>
      <View style={styles.empty}>
        <Ionicons name="person-circle-outline" size={52} color="#9aaabb" />
        <Text style={styles.emptyTitle}>Em breve</Text>
        <Text style={styles.emptySub}>
          Visualize e edite suas informações de perfil aqui.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecf2',
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#0d1829' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#0d1829', marginTop: 8 },
  emptySub: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#5a6a82', textAlign: 'center', lineHeight: 21 },
});