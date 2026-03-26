import { createTweet } from "@/api/tweets";
import { prepareImageForUpload } from "@/lib/prepareImageForUpload";
import { pollDurationToMinutes } from "@/components/polls/PollDurationPicker";
import {
  prependReplyToTweetDetail,
  prependTweetToFeedAndProfile,
  replaceTempTweetInFeedAndProfile,
  updateTweetInAllCaches,
} from "@/lib/cache-updates";
import { ITweet } from "@/types/tweet";
import { useCallback } from "react";
import { Alert } from "react-native";

type UseSubmitTweetParams = {
  username: string;
  profilePictureUrl?: string | null;
  parentId?: number | null;
  quotedTweetId?: number | null;
  content: string;
  imageUrl?: string | null;
  gifUrl?: string | null;
  videoUri?: string | null;
  showPoll: boolean;
  pollOptions: string[];
  pollDurationMinutes: number;
  pollDurationHours: number;
  pollDurationDays: number;
  canSubmit: boolean;
  isPending: boolean;
  queryClient: any;
  onSuccess?: () => void;

  // setters
  setContent: (v: string) => void;
  setImageUrl: (v: string | null) => void;
  setGifUrl: (v: string | null) => void;
  setVideoUrl: (v: string | null) => void;
  setShowPoll: (v: boolean) => void;
  setPollOptions: (v: string[]) => void;
  setPollDurationMinutes: (v: number) => void;
  setPollDurationHours: (v: number) => void;
  setPollDurationDays: (v: number) => void;
};

export const useSubmitTweet = ({
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
}: UseSubmitTweetParams) => {
  const buildOptimisticTweet = useCallback(
    (): ITweet => ({
      id: -Date.now(),
      username,
      displayName: null,
      profilePictureUrl: profilePictureUrl ?? null,
      parentId: null,
      content: content.trim(),
      imageUrl: imageUrl ?? null,
      gifUrl: gifUrl ?? null,
      videoUrl: videoUri ?? null,
      isPinned: false,
      quotedTweet: null,
      poll: null,
      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      quotesCount: 0,
      bookmarksCount: 0,
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
      retweetedBy: null,
      createdAt: new Date().toISOString(),
      communityNote: null,
    }),
    [username, profilePictureUrl, content, imageUrl, gifUrl, videoUri],
  );

  const resetForm = useCallback(() => {
    setContent("");
    setImageUrl(null);
    setGifUrl(null);
    setVideoUrl(null);
    setShowPoll(false);
    setPollOptions(["", ""]);
    setPollDurationMinutes(0);
    setPollDurationHours(0);
    setPollDurationDays(1);
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || isPending) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    if (parentId != null) formData.append("parentId", String(parentId));
    if (quotedTweetId != null)
      formData.append("quoteId", String(quotedTweetId));

    let imageUriForUpload = imageUrl;
    if (imageUrl) {
      imageUriForUpload = await prepareImageForUpload(imageUrl);
    }

    if (imageUriForUpload) {
      formData.append("image", {
        uri: imageUriForUpload,
        name: "photo.jpg",
        type: "image/jpeg",
      } as unknown as Blob);
    }

    if (videoUri) {
      const name = videoUri.split("/").pop() || "video.mp4";
      formData.append("video", {
        uri: videoUri,
        name,
        type: "video/mp4",
      } as unknown as Blob);
    }

    if (gifUrl) formData.append("gifUrl", gifUrl);

    if (showPoll) {
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      formData.append("pollOptions", JSON.stringify(validOptions));
      formData.append(
        "pollDurationMinutes",
        String(
          pollDurationToMinutes(
            pollDurationMinutes,
            pollDurationHours,
            pollDurationDays,
          ),
        ),
      );
    }

    if (parentId == null) {
      const optimistic = buildOptimisticTweet();
      prependTweetToFeedAndProfile(queryClient, username, optimistic);
      resetForm();
      onSuccess?.();
    } else {
      resetForm();
    }

    try {
      const newTweet = await createTweet(formData);

      if (parentId == null) {
        replaceTempTweetInFeedAndProfile(queryClient, username, newTweet);
      } else {
        prependReplyToTweetDetail(queryClient, parentId, newTweet);
        updateTweetInAllCaches(queryClient, parentId, (t) => ({
          ...t,
          repliesCount: t.repliesCount + 1,
        }));
      }

      if (quotedTweetId != null) {
        updateTweetInAllCaches(queryClient, quotedTweetId, (t) => ({
          ...t,
          quotesCount: t.quotesCount + 1,
        }));
      }

      if (parentId != null) {
        onSuccess?.();
      }
    } catch (e) {
      if (parentId == null) {
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        queryClient.invalidateQueries({ queryKey: ["profile", username] });
      }

      Alert.alert("Error", e instanceof Error ? e.message : "Failed to post");
    }
  }, [
    canSubmit,
    isPending,
    content,
    parentId,
    quotedTweetId,
    imageUrl,
    videoUri,
    gifUrl,
    showPoll,
    pollOptions,
    pollDurationMinutes,
    pollDurationHours,
    pollDurationDays,
    queryClient,
    username,
    buildOptimisticTweet,
    resetForm,
    onSuccess,
  ]);

  return { submit };
};
