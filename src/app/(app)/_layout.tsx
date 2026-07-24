import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  orange: '#f97316',
  orangeLight: 'rgba(249,115,22,0.12)',
  text: '#0d1829',
  text2: '#5a6a82',
  surface: '#ffffff',
  border: '#eef1f6',
};

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={styles.iconColumn}>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
      <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
        <Ionicons name={name} size={21} color={focused ? COLORS.orange : COLORS.text2} />
      </View>
    </View>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const barBaseHeight = 58;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.text2,
        tabBarStyle: [
          styles.tabBar,
          {
            height: barBaseHeight + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Vagas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Candidaturas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen name="job/[id]" options={{ href: null }} />
      <Tabs.Screen name="job/applicationProcess/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    elevation: 0,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 2,
  },
  iconColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  indicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  indicatorActive: {
    backgroundColor: COLORS.orange,
  },
  iconWrapper: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.orangeLight,
  },
});