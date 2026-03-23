import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { searchGifs, Gif } from '@/api/klipy';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
};

export function GifPicker({ visible, onClose, onSelect }: Props) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Gif[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchGifs('', 24);
        if (!cancelled) setItems(res);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Failed to load GIFs from Tenor',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const handleSearch = async () => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchGifs(query, 24);
      setItems(res);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to search Tenor GIFs',
      );
    } finally {
      setLoading(false);
    }
  };

  const bgColor = colors.background;
  const borderColor = isDark ? '#2f3336' : '#eff3f4';
  const textColor = colors.text;
  const mutedColor = colors.icon;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: bgColor, borderColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={textColor} />
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { color: textColor, borderColor }]}
              placeholder="Search GIFs"
              placeholderTextColor={mutedColor}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.iconBtn} hitSlop={8}>
              <MaterialIcons name="search" size={22} color={textColor} />
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={colors.tint} />
            </View>
          )}
          {error && !loading && (
            <View style={styles.center}>
              <Text style={[styles.errorText, { color: colors.tint }]}>
                {error}
              </Text>
            </View>
          )}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.gifWrap}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(item.mediumGifUrl || item.tinyGifUrl);
                  onClose();
                }}
              >
                <Image
                  source={{ uri: item.tinyGifUrl || item.mediumGifUrl }}
                  style={styles.gif}
                />
              </TouchableOpacity>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
  },
  center: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { fontSize: 13, textAlign: 'center' },
  grid: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  gifWrap: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 4,
  },
  gif: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

