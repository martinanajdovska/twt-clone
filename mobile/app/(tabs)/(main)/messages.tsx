import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDrawer } from '@/contexts/DrawerContext';
import { useFetchConversations } from '@/hooks/messages/useFetchConversations';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchUsersByName } from '@/hooks/users/useFetchUsersByName';
import { useCreateConversation } from '@/hooks/messages/useCreateConversation';
import ConversationListItem from '@/components/messages/ConversationListItem';
import { SearchBox } from '@/components/search/SearchBox';
import { ScreenHeader } from '@/components/ScreenHeader';


export default function MessagesScreen() {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const [newUsername, setNewUsername] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const { openDrawer } = useDrawer();

  const mutedColor = colors.icon;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(newUsername.trim()), 400);
    return () => clearTimeout(t);
  }, [newUsername]);

  const { data: conversations = [], isLoading: conversationsLoading } = useFetchConversations();
  const { data: self, isLoading: selfLoading } = useFetchSelf();
  const { data: searchResults = [], isLoading: searchLoading } = useFetchUsersByName(debouncedQ);
  const { mutate: createConversation, isPending: isCreating } = useCreateConversation();


  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title="Messages"
        leftAction="avatar"
        onLeftPress={openDrawer}
        avatarUrl={self?.profilePicture}
        avatarFallbackText={self?.username.charAt(0).toUpperCase()}
      />

      <SearchBox
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="Find or start a conversation"
        users={searchResults}
        onUserPress={(u) => createConversation(u)}
        userSecondaryText="Start conversation"
        isLoading={searchLoading || isCreating}
        isEmptyConversationsList={debouncedQ.length > 0}
      />

      {/* Conversations list */}
      {conversationsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#1d9bf0" />
        </View>
      ) : debouncedQ.length === 0 && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ConversationListItem item={item} />}
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <MaterialIcons name="mail-outline" size={48} color={mutedColor} />
              <ThemedText style={styles.emptyText}>No conversations yet.</ThemedText>
              <ThemedText style={[styles.emptySub, { color: mutedColor }]}>
                Search for a user above to start messaging.
              </ThemedText>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { marginTop: 12 },
  emptySub: { marginTop: 4, fontSize: 14 },
});