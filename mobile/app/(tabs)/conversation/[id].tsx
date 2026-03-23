import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GifPicker } from '@/components/GifPicker';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useFetchConversationById } from '@/hooks/messages/useFetchConversationById';
import { useFetchMessages } from '@/hooks/messages/useFetchMessages';
import { useKeyboardHeight } from '@/hooks/useKeyboard';
import { useConversationReadStatus } from '@/hooks/messages/useConversationReadStatus';
import MessageInput from '@/components/messages/MessageInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import MessageBubble from '@/components/messages/MessageBubble';


export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const conversationId = id ? parseInt(id, 10) : NaN;

  const flatListRef = useRef<FlatList>(null);

  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const mutedColor = colors.icon;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifPickerVisible, setGifPickerVisible] = useState(false);


  const keyboardHeight = useKeyboardHeight();
  const { data: conversation } = useFetchConversationById(conversationId);
  const { data: messages, isLoading } = useFetchMessages(conversationId);

  useConversationReadStatus(conversationId);

  const other = conversation?.otherParticipant;

  if (isNaN(conversationId)) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Invalid conversation</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader
        title={other?.displayName || other?.username || 'Loading…'}
        leftAction="back"
        titleLeftAvatar={
          other
            ? {
              url: other.imageUrl,
              fallbackText: other.username.charAt(0).toUpperCase(),
              onPress: () => router.push(`/(tabs)/users/${other.username}`),
            }
            : undefined
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <View style={[styles.flex, { paddingBottom: keyboardHeight + 5 }]}>
          <FlatList
            ref={flatListRef}
            data={[...(messages ?? [])].reverse()}
            inverted
            style={styles.list}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messages}
            renderItem={({ item }) => <MessageBubble item={item} other={other ?? { username: '', imageUrl: null, displayName: null }} />}
            ListEmptyComponent={
              <ThemedView style={styles.empty}>
                <ThemedText style={{ color: mutedColor }}>No messages yet. Say hello!</ThemedText>
              </ThemedView>
            }
          />

          <MessageInput setGifPickerVisible={setGifPickerVisible} gifUrl={gifUrl} setGifUrl={setGifUrl} imageUrl={imageUrl} setImageUrl={setImageUrl} conversationId={conversationId} />
        </View>
      )}

      <GifPicker
        visible={gifPickerVisible}
        onClose={() => setGifPickerVisible(false)}
        onSelect={(url) => {
          setImageUrl(null);
          setGifUrl(url);
          setGifPickerVisible(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { flex: 1 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  messages: { padding: 16, paddingBottom: 8 },
  empty: { padding: 24, alignItems: 'center' },
});