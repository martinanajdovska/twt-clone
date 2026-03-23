import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/themed-view';
import { Feed } from '@/components/tweets/Feed';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDrawer } from '@/contexts/DrawerContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useHeaderAndTabFade } from '@/hooks/useHeaderAndTabFade';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function HomeScreen() {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const { openDrawer } = useDrawer();
  const insets = useSafeAreaInsets();

  const { data: self, isLoading: selfLoading } = useFetchSelf();
  const navigation = useNavigation();
  const { headerOpacity, headerHeight, handleScroll } = useHeaderAndTabFade({
    navigation,
    tabBarMaxHeight: insets.bottom + 49,
  });

  if (selfLoading || !self) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Feed"
        leftAction="avatar"
        onLeftPress={openDrawer}
        avatarUrl={self.profilePicture}
        avatarFallbackText={self.username.charAt(0).toUpperCase()}
        animated
        animatedOpacity={headerOpacity}
        animatedHeight={headerHeight}
      />

      <Feed
        mode="home"
        currentUsername={self.username}
        onScroll={handleScroll}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: 15 }]}
        onPress={() => router.push('../(tabs)/compose')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="edit" size={24} color="#fff" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1d9bf0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});