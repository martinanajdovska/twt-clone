import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useQueryClient } from '@tanstack/react-query';
import type { ITweet } from '@/types/tweet';
import { GifPicker } from '@/components/GifPicker';
import { getMentionTrigger } from '@/lib/mentionUtils';
import { MentionSuggestions } from '@/components/tweets/MentionSuggestions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useFetchUsersByName } from '@/hooks/users/useFetchUsersByName';
import { TweetQuotedCard } from './TweetQuotedCard';
import TweetFormToolbar from './TweetFormToolbar';
import { useSubmitTweet } from '@/hooks/tweets/useSubmitTweet';
import { useMediaPicker } from '@/hooks/useMediaPicker';
import { PollBuilder } from '../polls/PollBuilder';
import { MediaPreview } from '../MediaPreview';

export type QuotedTweetPreview = {
  id: number;
  username: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  profilePictureUrl?: string | null;
};

const MAX_LENGTH = 280;
const MAX_POLL_OPTIONS = 4;
const MIN_POLL_OPTIONS = 2;

export function TweetForm({
  username,
  profilePictureUrl,
  parentId,
  quotedTweetId,
  quotedTweet,
  placeholder,
  onSuccess,
  autoFocus,
  onStateChange,
  submitTrigger,
}: {
  username: string;
  profilePictureUrl?: string | null;
  parentId?: number;
  quotedTweetId?: number;
  quotedTweet?: QuotedTweetPreview | null;
  placeholder?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
  onStateChange?: (state: { canSubmit: boolean; isPending: boolean }) => void;
  submitTrigger?: number;
}) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [videoUri, setVideoUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDurationMinutes, setPollDurationMinutes] = useState(0);
  const [pollDurationHours, setPollDurationHours] = useState(0);
  const [pollDurationDays, setPollDurationDays] = useState(1);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [debouncedMentionQuery, setDebouncedMentionQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();


  const mentionTrigger = getMentionTrigger(content, selection.start);
  const mentionQuery = mentionTrigger?.query ?? '';

  useKeyboard();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMentionQuery(mentionQuery), 300);
    return () => clearTimeout(t);
  }, [mentionQuery]);

  const { data: mentionUsers = [] as { username: string; displayName: string | null, imageUrl: string | null }[], isLoading: mentionLoading } = useFetchUsersByName(debouncedMentionQuery);
  const displayMentionUsers = mentionQuery.length > 0 ? mentionUsers.map((u) => u.username) : [];

  const insertMention = (selectedUsername: string) => {
    if (!mentionTrigger) return;
    const before = content.slice(0, mentionTrigger.atIndex);
    const after = content.slice(selection.start);
    const newContent = `${before}@${selectedUsername} ${after}`.slice(0, MAX_LENGTH);
    const newCursor = mentionTrigger.atIndex + selectedUsername.length + 2;
    setContent(newContent);
    setSelection({ start: newCursor, end: newCursor });
    inputRef.current?.focus();
  };

  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const mutedColor = isDark ? '#71767b' : '#536471';
  const textColor = isDark ? '#e7e9ea' : '#0f1419';
  const inputBg = isDark ? '#16181c' : '#f7f9f9';
  const quotedBg = isDark ? colors.background : '#f7f9f9';

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const pollValid = !showPoll || pollOptions.filter(o => o.trim().length > 0).length >= MIN_POLL_OPTIONS;
  const hasContent =
    content.trim().length > 0 ||
    !!imageUrl ||
    !!gifUrl ||
    !!videoUri ||
    !!showPoll;
  const canSubmit = hasContent && !isOverLimit && pollValid;

  useEffect(() => {
    onStateChange?.({ canSubmit, isPending });
  }, [canSubmit, isPending, onStateChange]);

  const togglePoll = () => {
    setShowPoll((p) => !p);
    setImageUrl(null);
    setGifUrl(null);
    setVideoUrl(null);
  };

  const updateOption = (index: number, value: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => {
    if (pollOptions.length < MAX_POLL_OPTIONS) {
      setPollOptions((prev) => [...prev, '']);
    }
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > MIN_POLL_OPTIONS) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const { pickImage, pickVideo } = useMediaPicker({
    showPoll,
    setImageUrl,
    setVideoUrl,
    setGifUrl,
  });

  const [gifPickerVisible, setGifPickerVisible] = useState(false);

  const handleSelectGif = (url: string) => {
    setGifUrl(url);
    setImageUrl(null);
    setVideoUrl(null);
    setShowPoll(false);
  };

  const { submit } = useSubmitTweet({
    username,
    profilePictureUrl,
    parentId,
    quotedTweetId,
    content,
    imageUrl,
    gifUrl,
    videoUri,
    showPoll,
    pollOptions,
    pollDurationMinutes,
    pollDurationHours,
    pollDurationDays,
    canSubmit,
    isPending,
    queryClient,
    onSuccess,
    setContent,
    setImageUrl,
    setGifUrl,
    setVideoUrl,
    setShowPoll,
    setPollOptions,
    setPollDurationMinutes,
    setPollDurationHours,
    setPollDurationDays,
  });


  const lastSubmitTriggerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (submitTrigger == null) return;
    if (lastSubmitTriggerRef.current === submitTrigger) return;
    lastSubmitTriggerRef.current = submitTrigger;
    submit();
  }, [submitTrigger]);

  const formContent = (
    <View style={parentId ? { paddingBottom: insets.top + 12 } : undefined}>
      <View style={[styles.container, { borderBottomColor: borderColor }]}>
        <View style={styles.row}>
          <View style={styles.avatarCol}>
            {profilePictureUrl ? (
              <Image source={{ uri: profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#536471', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contentCol}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: textColor }]}
              placeholder={placeholder ?? (parentId ? 'Post your reply' : "What's happening?!")}
              placeholderTextColor={mutedColor}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                setSelection((prev) => ({ start: text.length, end: text.length }));
              }}
              onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
              editable={!isPending}
            />

            {mentionTrigger !== null && (
              <MentionSuggestions
                users={displayMentionUsers}
                isLoading={mentionLoading}
                mentionQuery={mentionQuery}
                onSelect={(selectedUsername) => {
                  insertMention(selectedUsername);
                }}
              />
            )}

            <MediaPreview
              imageUrl={imageUrl}
              gifUrl={gifUrl}
              videoUri={videoUri}
              mutedColor={mutedColor}
              onRemoveImage={() => setImageUrl(null)}
              onRemoveGif={() => setGifUrl(null)}
              onRemoveVideo={() => setVideoUrl(null)}
            />

            {showPoll && (
              <PollBuilder
                pollOptions={pollOptions}
                updateOption={updateOption}
                removeOption={removeOption}
                addOption={addOption}
                MIN_POLL_OPTIONS={MIN_POLL_OPTIONS}
                MAX_POLL_OPTIONS={MAX_POLL_OPTIONS}
                pollDurationMinutes={pollDurationMinutes}
                pollDurationHours={pollDurationHours}
                pollDurationDays={pollDurationDays}
                setPollDurationMinutes={setPollDurationMinutes}
                setPollDurationHours={setPollDurationHours}
                setPollDurationDays={setPollDurationDays}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
                inputBg={inputBg}
              />
            )}

            {quotedTweet &&
              <TweetQuotedCard
                quotedTweet={quotedTweet as ITweet["quotedTweet"]}
                borderColor={borderColor}
                quotedBg={quotedBg}
                textColor={textColor}
                mutedColor={mutedColor}
                onPress={() => router.push(`/(main)/tweets/${quotedTweet!.id}`)}
              />}

            <TweetFormToolbar
              content={content}
              isPending={isPending}
              canSubmit={canSubmit}
              canAddPoll={!parentId && !quotedTweetId}
              showPoll={showPoll}
              hasGif={!!gifUrl}
              hasVideo={!!videoUri}
              hasImage={!!imageUrl}
              onTogglePoll={togglePoll}
              onPickImage={pickImage}
              onPickVideo={pickVideo}
              onGifClick={() => setGifPickerVisible(true)}
            />
          </View>
        </View>
      </View>
      <GifPicker
        visible={gifPickerVisible}
        onClose={() => setGifPickerVisible(false)}
        onSelect={handleSelectGif}
      />
    </View>
  );

  return formContent;
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  row: { flexDirection: 'row', gap: 12 },
  avatarCol: { width: 40 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  contentCol: { flex: 1, minWidth: 0 },
  input: {
    fontSize: 18,
    lineHeight: 24,
    padding: 12,
    minHeight: 80,
  },
  previewWrap: { marginTop: 8, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: 200, borderRadius: 16 },
  videoPreviewWrap: {},
  videoPreviewPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoPreviewText: { fontSize: 14 },
  removeBtn: {
    position: 'absolute', top: 8, left: 8,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  pollContainer: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  pollInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addOptionText: {
    fontSize: 15,
    color: '#1d9bf0',
    fontWeight: '500',
  },
});