import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { formatRelativeTime } from '@/lib/relativeTime';
import type { ITweet } from '@/types/tweet';
import { Colors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import PollDisplay from '../polls/PollDisplay';
import { CommunityNoteDisplay } from '../community-notes/CommunityNoteDisplay';
import { TweetContent } from './TweetContent';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TweetCardModals } from './TweetCardModals';
import { useKeyboard } from '@/hooks/useKeyboard';
import { TweetQuotedCard } from './TweetQuotedCard';
import { TweetActions } from './TweetActions';
import { useTweetCardHandlers } from '../../hooks/useTweetCardHandlers';

export function TweetCard({
  tweet,
  currentUsername,
  showPinnedLabel = false,
}: {
  tweet: ITweet;
  currentUsername: string;
  showPinnedLabel?: boolean;
}) {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [retweetMenuVisible, setRetweetMenuVisible] = useState(false);
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
  const [addNoteContent, setAddNoteContent] = useState('');
  const [viewNotesModalVisible, setViewNotesModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const { keyboardHeight } = useKeyboard();

  const isSelf = currentUsername === tweet.username;

  const textColor = colors.text;
  const mutedColor = colors.icon;
  const iconColor = colors.icon;
  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const quotedBg = isDark ? colors.background : '#f7f9f9';
  const menuBg = colors.background;

  const {
    handleLike,
    handleRetweetPress,
    handleRetweet,
    handleQuoteTweet,
    handleBookmark,
    handleVote,
    handlePin,
    handleAddNoteSubmit,
    handleDeleteConfirm,
    handleDeletePress,
    addNotePending,
    deletePending,
    pinPending,
  } = useTweetCardHandlers({
    tweet,
    addNoteContent,
    setRetweetMenuVisible,
    setOptionsMenuVisible,
    setAddNoteContent,
    setAddNoteModalVisible,
    setDeleteConfirmVisible,
    onNavigateToComposeQuote: (tweetId) =>
      router.push({
        pathname: '/(tabs)/compose',
        params: { quotedTweetId: String(tweetId) },
      } as any),
  });


  return (
    <>
      <TweetCardModals
        retweetMenuVisible={retweetMenuVisible}
        onCloseRetweetMenu={() => setRetweetMenuVisible(false)}
        onRetweet={handleRetweet}
        onQuoteTweet={handleQuoteTweet}
        isRetweeted={tweet.isRetweeted}
        textColor={textColor}
        borderColor={borderColor}
        menuBg={menuBg}
        mutedColor={mutedColor}
        insetsBottom={insets.bottom}
        optionsMenuVisible={optionsMenuVisible}
        onCloseOptionsMenu={() => setOptionsMenuVisible(false)}
        isSelf={isSelf}
        onPin={handlePin}
        pinPending={pinPending}
        isPinned={tweet.isPinned}
        onDeletePress={handleDeletePress}
        onOpenAddNote={() => {
          setOptionsMenuVisible(false);
          setAddNoteContent('');
          setAddNoteModalVisible(true);
        }}
        onOpenViewNotes={() => {
          setOptionsMenuVisible(false);
          setViewNotesModalVisible(true);
        }}
        addNoteModalVisible={addNoteModalVisible}
        onCloseAddNoteModal={() => setAddNoteModalVisible(false)}
        addNotePending={addNotePending}
        addNoteContent={addNoteContent}
        setAddNoteContent={setAddNoteContent}
        onSubmitAddNote={handleAddNoteSubmit}
        keyboardHeight={keyboardHeight}
        viewNotesModalVisible={viewNotesModalVisible}
        onCloseViewNotes={() => setViewNotesModalVisible(false)}
        tweetId={tweet.id}
        deleteConfirmVisible={deleteConfirmVisible}
        onCloseDeleteConfirm={() => setDeleteConfirmVisible(false)}
        deletePending={deletePending}
        onDeleteConfirm={handleDeleteConfirm}
      />


      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push(`/(tabs)/tweets/${tweet.id}`)}
        style={[styles.wrapper, { borderBottomColor: borderColor }]}
      >
        {showPinnedLabel && tweet.isPinned && (
          <View style={styles.metaRow}>
            <MaterialIcons name="push-pin" size={13} color={mutedColor} />
            <Text style={[styles.metaText, { color: mutedColor }]}>Pinned</Text>
          </View>
        )}

        {(tweet.retweetedBy || tweet.isRetweeted) && !(showPinnedLabel && tweet.isPinned) && (
          <View style={styles.metaRow}>
            <MaterialIcons name="repeat" size={13} color={mutedColor} />
            <Text style={[styles.metaText, { color: mutedColor }]}>
              {tweet.isRetweeted ? 'You' : tweet.retweetedBy} retweeted
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.avatarCol}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); router.push(`/(tabs)/users/${tweet.username}`); }}
            >
              {tweet.profilePictureUrl ? (
                <Image source={{ uri: tweet.profilePictureUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#536471', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                    {tweet.displayName?.charAt(0).toUpperCase() ?? tweet.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.contentCol}>
            <View style={styles.headerRow}>
              <View style={styles.usernameRow}>
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation?.(); router.push(`/(tabs)/users/${tweet.username}`); }}
                  style={styles.displayNameBtn}
                >
                  <Text style={[styles.displayName, { color: textColor }]} numberOfLines={1}>
                    {tweet.displayName ?? tweet.username}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.handle, { color: mutedColor }]} numberOfLines={1} ellipsizeMode="tail">
                  @{tweet.username.toLowerCase()}
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={[styles.time, { color: mutedColor }]} numberOfLines={1}>
                  {formatRelativeTime(tweet.createdAt)}
                </Text>
                <TouchableOpacity hitSlop={8} onPress={(e) => { e.stopPropagation?.(); setOptionsMenuVisible(true); }}>
                  <MaterialIcons name="more-horiz" size={18} color={mutedColor} />
                </TouchableOpacity>
              </View>
            </View>

            {tweet.content ? (
              <TweetContent content={tweet.content} textStyle={[{ color: textColor }]} baseStyle={styles.contentText} />
            ) : null}

            {tweet.imageUrl && (
              <Image
                source={{ uri: tweet.imageUrl }}
                style={[styles.tweetImage, { borderColor }]}
              />
            )}

            {tweet.gifUrl && !tweet.imageUrl && (
              <Image
                source={{ uri: tweet.gifUrl }}
                style={[styles.tweetImage, { borderColor }]}
              />
            )}

            {tweet.videoUrl && !tweet.imageUrl && !tweet.gifUrl && (
              <TouchableOpacity
                style={[styles.tweetVideoWrap, { borderColor }]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  router.push({
                    pathname: '/(tabs)/reels',
                    params: { initialTweetId: String(tweet.id) },
                  } as any);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.tweetVideoPlaceholder}>
                  <MaterialIcons name="play-circle-filled" size={56} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            )}

            {tweet.poll && (
              <PollDisplay
                poll={tweet.poll}
                onVote={handleVote}
              />
            )}

            {tweet.quotedTweet && (
              <TweetQuotedCard
                quotedTweet={tweet.quotedTweet}
                borderColor={borderColor}
                quotedBg={quotedBg}
                textColor={textColor}
                mutedColor={mutedColor}
                onPress={() => router.push(`/(tabs)/tweets/${tweet.quotedTweet!.id}`)}
              />
            )}

            <TweetActions
              tweet={tweet}
              iconColor={iconColor}
              mutedColor={mutedColor}
              onOpenReplies={() => router.push(`/(tabs)/tweets/${tweet.id}`)}
              onRetweetPress={handleRetweetPress}
              onLikePress={handleLike}
              onBookmarkPress={handleBookmark}
              showCounts
            />

            {tweet.communityNote && (
              <CommunityNoteDisplay note={tweet.communityNote} tweetId={tweet.id} />
            )}
          </View>
        </View>
      </TouchableOpacity>


    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 52,
    marginBottom: 4,
  },
  metaText: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  avatarCol: { width: 40, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  contentCol: { flex: 1, minWidth: 0, paddingBottom: 12, paddingTop: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  usernameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  displayNameBtn: {
    flexShrink: 0,
  },
  displayName: { fontSize: 15, fontWeight: '700' },
  handle: { fontSize: 13, flexShrink: 1, minWidth: 0, color: '#687076' },
  dot: { fontSize: 15, flexShrink: 0 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  time: { fontSize: 13, flexShrink: 0 }, content: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  contentText: { fontSize: 15, lineHeight: 22 },
  tweetImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tweetVideoWrap: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  tweetVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});