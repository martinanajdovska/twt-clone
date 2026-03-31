import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSearchConversationMessages } from '@/hooks/messages/useSearchConversationMessages';
import { SearchBox } from '@/components/search/SearchBox';
import { formatRelativeTime } from '@/lib/relativeTime';
import { fetchMessageContext } from '@/api/messages';
import type { IMessageItem } from '@/types/message';


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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [contextMessages, setContextMessages] = useState<IMessageItem[] | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isResultTransitioning, setIsResultTransitioning] = useState(false);
  const [isContextReadyToShow, setIsContextReadyToShow] = useState(true);
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | null>(null);


  const keyboardHeight = useKeyboardHeight();
  const { data: conversation } = useFetchConversationById(conversationId);
  const {
    data: messages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFetchMessages(conversationId);

  useConversationReadStatus(conversationId);

  const other = conversation?.otherParticipant;
  const {
    data: searchedMessages = [],
    isLoading: isSearchLoading,
  } = useSearchConversationMessages(
    debouncedSearchText,
    other?.username,
    conversationId,
  );

  const messageItems = messages?.pages.flatMap((page) => page.content ?? []) ?? [];
  const contextItems = contextMessages
    ? [...contextMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    : null;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText.trim()), 350);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    if (!contextItems || highlightedMessageId == null || isSearchOpen) return;
    const targetIndex = contextItems.findIndex((m) => m.id === highlightedMessageId);
    if (targetIndex < 0) return;

    const t = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
        viewPosition: 0.5,
      });
      setTimeout(() => {
        setIsContextReadyToShow(true);
        setIsResultTransitioning(false);
      }, 40);
    }, 0);

    return () => clearTimeout(t);
  }, [contextItems, highlightedMessageId, isSearchOpen]);

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
        onLeftPress={() => {
          if (contextMessages) {
            setContextMessages(null);
            setHighlightedMessageId(null);
            setIsContextReadyToShow(true);
            return;
          }
          router.back();
        }}
        rightAction={(
          <TouchableOpacity
            onPress={() => {
              if (isSearchOpen) {
                setSearchText('');
                setDebouncedSearchText('');
                setContextMessages(null);
                setIsContextLoading(false);
                setIsResultTransitioning(false);
                setIsContextReadyToShow(true);
                setHighlightedMessageId(null);
              }
              setIsSearchOpen((prev) => !prev);
            }}
            style={styles.searchToggle}
            hitSlop={8}
          >
            <MaterialIcons name={isSearchOpen ? 'close' : 'search'} size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        titleLeftAvatar={
          other
            ? {
              url: other.imageUrl,
              fallbackText: other.username.charAt(0).toUpperCase(),
              onPress: () => router.push(`/(main)/users/${other.username}`),
            }
            : undefined
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : (
        <View style={styles.flex}>
          <View
            style={[
              styles.flex,
              !isSearchOpen && { paddingBottom: keyboardHeight + 5 },
              (!isContextReadyToShow || isResultTransitioning || isContextLoading) && styles.hiddenFrame,
            ]}
          >
            {isSearchOpen ? (
              <SearchBox
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search this conversation"
                users={searchedMessages.map((item) => ({
                  key: String(item.id),
                  id: item.id,
                  createdAt: item.createdAt,
                  username: item.senderUsername,
                  imageUrl: item.senderImageUrl,
                  secondaryText: `${item.content || '(no text)'} • ${formatRelativeTime(item.createdAt)}`,
                }))}
                onUserSelect={async (item) => {
                  if (!item.createdAt) return;
                  setIsResultTransitioning(true);
                  setIsContextReadyToShow(false);
                  setIsSearchOpen(false);
                  setIsContextLoading(true);
                  try {
                    const context = await fetchMessageContext(
                      conversationId,
                      item.createdAt,
                      10,
                    );
                    setContextMessages(context);
                    if (item.id) setHighlightedMessageId(item.id);
                  } finally {
                    setIsContextLoading(false);
                  }
                }}
                isLoading={isSearchLoading}
                emptyUsersText="No messages match your search."
                userSecondaryText="Message"
                showUserChevron={false}
                isEmptyConversationsList
              />
            ) : (
              <FlatList
                ref={flatListRef}
                data={contextItems ?? messageItems}
                inverted={!contextItems}
                style={styles.list}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.messages}
                renderItem={({ item }) => (
                  <MessageBubble
                    item={item}
                    highlighted={item.id === highlightedMessageId}
                    other={other ?? { username: '', imageUrl: null, displayName: null }}
                  />
                )}
                onScrollToIndexFailed={({ index }) => {
                  flatListRef.current?.scrollToOffset({
                    offset: Math.max(0, index * 80),
                    animated: false,
                  });
                  setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: false,
                      viewPosition: 0.5,
                    });
                    setTimeout(() => {
                      setIsContextReadyToShow(true);
                      setIsResultTransitioning(false);
                    }, 40);
                  }, 50);
                }}
                onEndReachedThreshold={0.2}
                onEndReached={() => {
                  if (!contextMessages && hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                ListFooterComponent={
                  !contextMessages && isFetchingNextPage ? (
                    <View style={styles.empty}>
                      <ActivityIndicator color={colors.tint} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <ThemedView style={styles.empty}>
                    <ThemedText style={{ color: mutedColor }}>No messages yet. Say hello!</ThemedText>
                  </ThemedView>
                }
              />
            )}

            {!isSearchOpen && !contextMessages ? (
              <MessageInput
                setGifPickerVisible={setGifPickerVisible}
                gifUrl={gifUrl}
                setGifUrl={setGifUrl}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                conversationId={conversationId}
              />
            ) : null}
          </View>
          {(!isContextReadyToShow || isResultTransitioning || isContextLoading) ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.tint} />
            </View>
          ) : null}
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
  hiddenFrame: { opacity: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchToggle: { padding: 4 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  avatarFallback: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  messages: { padding: 16, paddingBottom: 8 },
  empty: { padding: 24, alignItems: 'center' },
});