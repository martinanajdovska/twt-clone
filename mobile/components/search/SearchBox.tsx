import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { Image } from "expo-image";

type Tab = "users" | "tweets";

export function SearchBox({
  value,
  onChangeText,
  placeholder,
  tabs,
  tab,
  onTabChange,
  isLoading,
  users = [],
  onUserPress,
  userSecondaryText = "View profile",
  renderTweets,
  emptyUsersText,
  emptyTweetsText,
  topInset = 0,
  isEmptyConversationsList,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  tabs?: Tab[];
  tab?: Tab;
  onTabChange?: (t: Tab) => void;
  isLoading?: boolean;
  users?: { username: string; displayName: string | null, imageUrl: string | null }[];
  onUserPress?: (username: string) => void;
  userSecondaryText?: string;
  renderTweets?: React.ReactNode;
  emptyUsersText?: string;
  emptyTweetsText?: string;
  topInset?: number;
  isEmptyConversationsList?: boolean;
}) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const borderColor = isDark ? "#3d4146" : "#d8dde1";
  const textColor = colors.text;
  const mutedColor = colors.icon;

  const showTabs = tabs != null && tab != null && onTabChange != null;
  const activeTab: Tab = showTabs ? (tab as Tab) : "users";

  return (
    <ThemedView style={[showTabs && styles.containerFill]}>
      <View
        style={[
          styles.searchWrap,
          {
            backgroundColor: isDark ? "#1e2732" : "#eff3f4",
            borderColor,
            marginTop: topInset + 5,
          },
        ]}
      >
        <MaterialIcons name="search" size={22} color={mutedColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={mutedColor}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} hitSlop={8}>
            <MaterialIcons name="close" size={20} color={mutedColor} />
          </TouchableOpacity>
        )}
      </View>

      {showTabs && (
        <View style={[styles.tabs, { borderBottomColor: borderColor }]}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && { borderBottomColor: textColor }]}
              onPress={() => onTabChange(t)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === t ? textColor : mutedColor },
                  activeTab === t && { fontWeight: "700" },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading && value.trim().length > 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : activeTab === "users" ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.username}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.list}
          renderItem={({ item: { username, displayName, imageUrl } }) => (
            <Pressable
              style={({ pressed }) => [
                styles.userRow,
                {
                  borderBottomColor: borderColor,
                  backgroundColor: pressed ? mutedColor + "15" : undefined,
                },
              ]}
              onPress={() => onUserPress?.(username)}
            >
              <View style={[styles.avatar, { backgroundColor: mutedColor + "25" }]}>
                {imageUrl ?
                  <Image source={{ uri: imageUrl }} style={styles.avatar} />
                  : <MaterialIcons name="person" size={22} color={mutedColor} />}
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userHandle, { color: textColor }]}>{displayName ?? username} @{username}</Text>
                <Text style={[styles.userSecondary, { color: mutedColor }]}>{userSecondaryText}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={mutedColor} />
            </Pressable>
          )}
          ListEmptyComponent={
            (showTabs || isEmptyConversationsList) ? (
              <ThemedView style={styles.empty}>
                <ThemedText style={{ color: mutedColor }}>
                  {value.trim().length > 0
                    ? emptyUsersText ?? `No users found for "${value.trim()}".`
                    : emptyUsersText ?? "Search for people by username."}
                </ThemedText>
              </ThemedView>
            ) : null
          }
        />
      ) : (
        <>
          {renderTweets ?? (
            <ThemedView style={styles.empty}>
              <ThemedText style={{ color: mutedColor }}>
                {value.trim().length > 0
                  ? emptyTweetsText ?? `No tweets found for "${value.trim()}".`
                  : emptyTweetsText ?? "Search for tweets by content."}
              </ThemedText>
            </ThemedView>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  containerFill: { flex: 1 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 3,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 17 },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { paddingBottom: 24 },
  empty: { padding: 24, alignItems: "center" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  userHandle: { fontSize: 15, fontWeight: "600" },
  userSecondary: { fontSize: 13, marginTop: 2 },
});

