import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { createTweet } from "@/api/tweets";
import { useFetchSelf } from "@/hooks/users/useFetchSelf";
import {
  prependReplyToTweetDetail,
  prependReplyToTweetRepliesCache,
  removeReplyFromTweetDetailCaches,
  removeReplyFromTweetRepliesCache,
  replaceReplyInTweetDetailCaches,
  replaceReplyInTweetRepliesCache,
  updateTweetInAllCaches,
} from "@/lib/cache-updates";
import type { ITweet } from "@/types/tweet";

type UseSubmitTweetReplyParams = {
  parentId: number;
  onSubmitted?: () => void;
};

type UseSubmitTweetReplyResult = {
  isPending: boolean;
  hasSessionUser: boolean;
  submitReply: (content: string) => Promise<boolean>;
};

function buildOptimisticReply(
  tempReplyId: number,
  parentId: number,
  content: string,
  self: NonNullable<ReturnType<typeof useFetchSelf>["data"]>,
): ITweet {
  return {
    id: tempReplyId,
    username: self.username,
    displayName: self.displayName,
    content,
    imageUrl: null,
    gifUrl: null,
    videoUrl: null,
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
    parentId,
    retweetedBy: null,
    createdAt: new Date().toISOString(),
    profilePictureUrl: self.profilePicture,
    communityNote: null,
  };
}

export function useSubmitTweetReply({
  parentId,
  onSubmitted,
}: UseSubmitTweetReplyParams): UseSubmitTweetReplyResult {
  const queryClient = useQueryClient();
  const { data: self } = useFetchSelf();
  const [isPending, setIsPending] = useState(false);

  const submitReply = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !self?.username || isPending) return false;

      const formData = new FormData();
      formData.append("content", trimmed);
      formData.append("parentId", String(parentId));

      setIsPending(true);
      let tempReplyId: number | null = null;

      try {
        tempReplyId = -Date.now();
        const optimisticReply = buildOptimisticReply(
          tempReplyId,
          parentId,
          trimmed,
          self,
        );

        prependReplyToTweetDetail(queryClient, parentId, optimisticReply);
        prependReplyToTweetRepliesCache(queryClient, parentId, optimisticReply);
        updateTweetInAllCaches(queryClient, parentId, (t) => ({
          ...t,
          repliesCount: t.repliesCount + 1,
        }));

        const newReply = await createTweet(formData);
        replaceReplyInTweetDetailCaches(
          queryClient,
          parentId,
          tempReplyId,
          newReply,
        );
        replaceReplyInTweetRepliesCache(
          queryClient,
          parentId,
          tempReplyId,
          newReply,
        );

        onSubmitted?.();
        return true;
      } catch (e) {
        if (tempReplyId != null) {
          removeReplyFromTweetDetailCaches(queryClient, parentId, tempReplyId);
          removeReplyFromTweetRepliesCache(queryClient, parentId, tempReplyId);
          updateTweetInAllCaches(queryClient, parentId, (t) => ({
            ...t,
            repliesCount: Math.max(0, t.repliesCount - 1),
          }));
        }

        Alert.alert(
          "Error",
          e instanceof Error ? e.message : "Failed to post reply",
        );
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [isPending, onSubmitted, parentId, queryClient, self],
  );

  return {
    isPending,
    hasSessionUser: !!self?.username,
    submitReply,
  };
}
