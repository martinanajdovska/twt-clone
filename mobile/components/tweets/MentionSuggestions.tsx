import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';

type Props = {
  users: string[];
  isLoading: boolean;
  mentionQuery: string;
  onSelect: (username: string) => void;
};

export function MentionSuggestions({
  users,
  isLoading,
  mentionQuery,
  onSelect,
}: Props) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const borderColor = isDark ? '#2f3336' : '#eff3f4';
  const textColor = colors.text;
  const mutedColor = colors.icon;
  const bgColor = colors.background;


  if (mentionQuery.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.hint, { color: mutedColor }]}>Type to search people</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.hint, { color: mutedColor }]}>
          No people found for "{mentionQuery}"
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.listWrap, { backgroundColor: bgColor, borderColor }]}>
      <FlatList
        data={users}
        keyExtractor={(u) => u}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        renderItem={({ item: u }) => (
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: borderColor }]}
            onPress={() => onSelect(u)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarPlaceholder, { backgroundColor: mutedColor + '40' }]}>
              <MaterialIcons name="person" size={20} color={mutedColor} />
            </View>
            <Text style={[styles.username, { color: textColor }]} numberOfLines={1}>
              @{u}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  listWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: 220,
  },
  list: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  hint: {
    fontSize: 15,
  },
});
