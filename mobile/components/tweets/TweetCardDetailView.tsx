import React, { useState } from "react";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { format } from "date-fns";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ITweet } from "@/types/tweet";
import PollDisplay from "../polls/PollDisplay";
import { CommunityNoteDisplay } from "../community-notes/CommunityNoteDisplay";
import { TweetContent } from "./TweetContent";
import { TweetQuotedCard } from "./TweetQuotedCard";
import { TweetActions } from "./TweetActions";
import { useTweetCardHandlers } from "../../hooks/useTweetCardHandlers";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from "@/constants/theme";
import { TweetCardModals } from "./TweetCardModals";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useCompose } from "@/contexts/ComposeContext";
import { TweetVideoMedia } from "./TweetVideoMedia";


type Props = {
  tweet: ITweet;
  showPinnedLabel: boolean;
  currentUsername: string;
  isVideoActive?: boolean;
};

export function TweetCardDetailView({
  tweet,
  showPinnedLabel,
  currentUsername,
  isVideoActive = false,
}: Props) {
  const { openCompose } = useCompose();
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const textColor = colors.text;
  const mutedColor = colors.icon;
  const iconColor = colors.icon;
  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const quotedBg = isDark ? colors.background : '#f7f9f9';
  const menuBg = colors.background;

  const [retweetMenuVisible, setRetweetMenuVisible] = useState(false);
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
  const [addNoteContent, setAddNoteContent] = useState('');
  const [viewNotesModalVisible, setViewNotesModalVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const isSelf = currentUsername === tweet.username;


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
    onNavigateToComposeQuote: (tweetId) => openCompose({ quotedTweetId: tweetId }),
  });

  const { keyboardHeight } = useKeyboard();

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
      <View style={[styles.wrapper, { borderBottomColor: borderColor }]}>
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
              {tweet.isRetweeted ? "You" : tweet.retweetedBy} retweeted
            </Text>
          </View>
        )}

        <View style={styles.detailHeaderRow}>
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); router.push(`/(tabs)/users/${tweet.username}`); }}>
            {tweet.profilePictureUrl ? (
              <Image source={{ uri: tweet.profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: "#536471", justifyContent: "center", alignItems: "center" },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                  {tweet.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); router.push(`/(tabs)/users/${tweet.username}`); }} style={styles.detailHeaderUser}>
            <Text style={[styles.displayName, { color: textColor }]} numberOfLines={1}>
              {tweet.username}
            </Text>
            <Text
              style={[styles.handle, { color: mutedColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              @{tweet.username.toLowerCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8} onPress={(e) => { e.stopPropagation?.(); setOptionsMenuVisible(true); }} style={styles.detailHeaderMore}>
            <MaterialIcons name="more-horiz" size={18} color={mutedColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailContent}>
          {tweet.content ? (
            <TweetContent content={tweet.content} textStyle={[{ color: textColor }]} baseStyle={styles.contentText} />
          ) : null}

          {tweet.imageUrl && (
            <Image source={{ uri: tweet.imageUrl }} style={[styles.tweetImage, { borderColor }]} />
          )}

          {tweet.gifUrl && !tweet.imageUrl && (
            <Image source={{ uri: tweet.gifUrl }} style={[styles.tweetImage, { borderColor }]} />
          )}

          {tweet.videoUrl && !tweet.imageUrl && !tweet.gifUrl && (
            <View onStartShouldSetResponder={() => true}>
              <TweetVideoMedia
                tweetId={tweet.id}
                videoUrl={tweet.videoUrl}
                borderColor={borderColor}
                isActive={isVideoActive}
                onOpenReels={() =>
                  router.push({
                    pathname: '/(tabs)/reels',
                    params: { initialTweetId: String(tweet.id) },
                  } as any)
                }
              />
            </View>
          )}

          {tweet.poll && <PollDisplay poll={tweet.poll} onVote={handleVote} />}

          {tweet.quotedTweet && !tweet.quotedTweet.isDeleted && (
            <TweetQuotedCard
              quotedTweet={tweet.quotedTweet}
              borderColor={borderColor}
              quotedBg={quotedBg}
              textColor={textColor}
              mutedColor={mutedColor}
              onPress={() => router.push(`/(tabs)/tweets/${tweet.quotedTweet!.id}`)}
            />
          )}

          <Text style={[styles.exactTime, { color: mutedColor }]}>
            {format(new Date(tweet.createdAt), "h:mm a · MMM d, yyyy")}
          </Text>
          <View style={[styles.detailStats, { borderColor }]}>
            <View style={styles.detailStatItem}>
              <Text style={[styles.detailStatBold, { color: textColor }]}>{tweet.retweetsCount}</Text>
              <Text style={[styles.detailStatLabel, { color: mutedColor }]}> Retweets</Text>
            </View>
            <Text style={[styles.detailStatDot, { color: mutedColor }]}>·</Text>
            <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); router.push(`/(tabs)/tweets/quotes/${tweet.id}`); }}>
              <View style={styles.detailStatItem}>
                <Text style={[styles.detailStatBold, { color: textColor }]}>{tweet.quotesCount}</Text>
                <Text style={[styles.detailStatLabel, { color: mutedColor }]}> Quotes</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.detailStatDot, { color: mutedColor }]}>·</Text>
            <View style={styles.detailStatItem}>
              <Text style={[styles.detailStatBold, { color: textColor }]}>{tweet.likesCount}</Text>
              <Text style={[styles.detailStatLabel, { color: mutedColor }]}> Likes</Text>
            </View>
            <Text style={[styles.detailStatDot, { color: mutedColor }]}>·</Text>
            <View style={styles.detailStatItem}>
              <Text style={[styles.detailStatBold, { color: textColor }]}>{tweet.bookmarksCount}</Text>
              <Text style={[styles.detailStatLabel, { color: mutedColor }]}> Bookmarks</Text>
            </View>
          </View>

          <TweetActions
            tweet={tweet}
            iconColor={iconColor}
            mutedColor={mutedColor}
            onRetweetPress={handleRetweetPress}
            onLikePress={handleLike}
            onBookmarkPress={handleBookmark}
            showCounts={false}
          />

          {tweet.communityNote && <CommunityNoteDisplay note={tweet.communityNote} tweetId={tweet.id} />}
        </View>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 52,
    marginBottom: 4,
  },
  metaText: { fontSize: 13, fontWeight: "500" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  detailHeaderUser: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4 },
  detailHeaderMore: { padding: 4 },
  displayName: { fontSize: 15, fontWeight: "700" },
  handle: { fontSize: 13, flexShrink: 1, minWidth: 0, color: "#687076" },
  detailContent: { paddingBottom: 12 },
  contentText: { fontSize: 15, lineHeight: 22 },
  tweetImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  exactTime: { fontSize: 15, marginTop: 4, marginBottom: 4 },
  detailStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    gap: 4,
  },
  detailStatItem: { flexDirection: "row", alignItems: "baseline" },
  detailStatBold: { fontSize: 15, fontWeight: "700" },
  detailStatLabel: { fontSize: 15, fontWeight: "400" },
  detailStatDot: { fontSize: 15, marginHorizontal: 2 },
});
