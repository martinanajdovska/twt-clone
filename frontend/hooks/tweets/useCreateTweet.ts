import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ITweetResponse } from "@/DTO/ITweetResponse";
import {
  prependTweetToFeedAndProfile,
  replaceTempTweetInFeedAndProfile,
  prependReplyToTweetDetail,
  updateTweetInAllCaches,
} from "@/lib/cache-updates";
import { createTweet } from "@/api-calls/tweets-api";

const REVOKE_BLOB_URL_AFTER_MS = 10_000;
function scheduleRevokeObjectURL(url?: string | null) {
  if (!url) return;
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_BLOB_URL_AFTER_MS);
}

function buildOptimisticTweet(
  formData: FormData,
  username: string,
  profilePictureUrl: string | null,
  imageBlobUrl: string | null,
  videoBlobUrl: string | null,
): ITweetResponse {
  const content = (formData.get("content") as string) || "";
  const gifUrl = (formData.get("gifUrl") as string) || null;
  const tempId = -Date.now();
  return {
    id: tempId,
    username,
    profilePictureUrl,
    parentId: null,
    content,
    imageUrl: imageBlobUrl,
    optimisticImageUrl: imageBlobUrl,
    optimisticVideoUrl: videoBlobUrl,
    gifUrl,
    videoUrl: videoBlobUrl,
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
  };
}

export const useCreateTweet = ({
  username,
  parentId,
  quoteId,
  profilePictureUrl = null,
}: {
  username: string;
  parentId?: number;
  quoteId?: number;
  profilePictureUrl?: string | null;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<ITweetResponse> =>
      createTweet(formData),
    onMutate: async (formData): Promise<{ imageBlobUrl?: string | null }> => {
      if (parentId != null) return {};
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["profile", username] });
      const imageFile = formData.get("image") as File | null;
      const videoFile = formData.get("video") as File | null;
      const imageBlobUrl =
        imageFile != null ? URL.createObjectURL(imageFile) : null;
      const videoBlobUrl =
        videoFile != null ? URL.createObjectURL(videoFile) : null;
      const optimistic = buildOptimisticTweet(
        formData,
        username,
        profilePictureUrl,
        imageBlobUrl,
        videoBlobUrl,
      );
      prependTweetToFeedAndProfile(queryClient, username, optimistic);
      return { imageBlobUrl };
    },

    onSuccess: (
      newTweet,
      _formData,
      context?: { imageBlobUrl?: string | null },
    ) => {
      const tweetWithFallback: ITweetResponse =
        context?.imageBlobUrl && newTweet.imageUrl !== context.imageBlobUrl
          ? { ...newTweet, optimisticImageUrl: context.imageBlobUrl }
          : newTweet;

      if (parentId == null) {
        replaceTempTweetInFeedAndProfile(
          queryClient,
          username,
          tweetWithFallback,
        );
      } else {
        prependReplyToTweetDetail(queryClient, parentId, tweetWithFallback);
        updateTweetInAllCaches(queryClient, parentId, (t) => ({
          ...t,
          repliesCount: t.repliesCount + 1,
        }));
      }

      if (quoteId != null) {
        updateTweetInAllCaches(queryClient, quoteId, (t) => ({
          ...t,
          quotesCount: t.quotesCount + 1,
        }));
      }
      scheduleRevokeObjectURL(context?.imageBlobUrl);
    },

    onError: (err, _formData, context?: { imageBlobUrl?: string | null }) => {
      scheduleRevokeObjectURL(context?.imageBlobUrl);
      if (parentId == null) {
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        queryClient.invalidateQueries({ queryKey: ["profile", username] });
      }
      alert(err.message);
    },
  });
};
