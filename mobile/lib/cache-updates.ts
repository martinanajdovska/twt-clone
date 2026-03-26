import type { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { ITweet, IVideoTweetsResponse } from "@/types/tweet";
import type { ITweetDetailsResponse } from "@/types/tweet";
import type {
  IConversationListItem,
  IMessageItem,
  IMessagePage,
} from "@/types/message";
import { IProfileHeader } from "@/types/profile";

type TweetDetailData = {
  tweet: ITweet;
  parentTweet?: ITweet;
  parentChain?: ITweet[];
  replies: ITweet[];
};

function updateTweetInArray(
  tweets: ITweet[],
  tweetId: number,
  updater: (t: ITweet) => ITweet,
): ITweet[] {
  return tweets.map((t) => (t.id === tweetId ? updater(t) : t));
}

export function updateTweetInAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  updater: (t: ITweet) => ITweet,
): void {
  const idStr = String(tweetId);

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["feed"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        updateTweetInArray(page, tweetId, updater),
      ),
    };
  });

  queryClient.setQueriesData<InfiniteData<ITweet[]>>(
    { queryKey: ["profile"] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          updateTweetInArray(page, tweetId, updater),
        ),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["bookmarks"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        updateTweetInArray(page, tweetId, updater),
      ),
    };
  });

  queryClient.setQueryData<TweetDetailData>(["tweet", idStr], (old) => {
    if (!old) return old;
    return {
      ...old,
      tweet: old.tweet.id === tweetId ? updater(old.tweet) : old.tweet,
      parentTweet:
        old.parentTweet?.id === tweetId
          ? updater(old.parentTweet)
          : old.parentTweet,
      parentChain: old.parentChain
        ? updateTweetInArray(old.parentChain, tweetId, updater)
        : old.parentChain,
      replies: updateTweetInArray(old.replies, tweetId, updater),
    };
  });

  // Tweet detail screen keeps a single `['tweet', rootId]` entry for the whole thread.
  // When user acts on a reply/ancestor, we must update any `['tweet', *]` cache
  // that contains this tweet id (tweet itself, parent chain, or replies).
  queryClient.setQueriesData<TweetDetailData>(
    { queryKey: ["tweet"] },
    (old) => {
      if (!old) return old;

      const parentChain = old.parentChain ?? [];
      const matchesTweet = old.tweet.id === tweetId;
      const matchesParent = old.parentTweet?.id === tweetId;
      const matchesChain = parentChain.some((t) => t.id === tweetId);
      const matchesReply = old.replies.some((t) => t.id === tweetId);

      if (!matchesTweet && !matchesParent && !matchesChain && !matchesReply) {
        return old;
      }

      return {
        ...old,
        tweet: matchesTweet ? updater(old.tweet) : old.tweet,
        parentTweet: matchesParent
          ? updater(old.parentTweet!)
          : old.parentTweet,
        parentChain: old.parentChain
          ? updateTweetInArray(old.parentChain, tweetId, updater)
          : old.parentChain,
        replies: updateTweetInArray(old.replies, tweetId, updater),
      };
    },
  );
}

export function updateTweetPollInAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  pollOrUpdater:
    | ITweet["poll"]
    | ((old: ITweet["poll"] | null) => ITweet["poll"] | null),
): void {
  const updater = (t: ITweet) => ({
    ...t,
    poll:
      typeof pollOrUpdater === "function"
        ? pollOrUpdater(t.poll)
        : pollOrUpdater,
  });
  updateTweetInAllCaches(queryClient, tweetId, updater);
}

export function removeTweetFromAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  username: string,
): void {
  const filterOut = (tweets: ITweet[]) =>
    tweets.filter((t) => t.id !== tweetId);

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["feed"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => filterOut(page)),
    };
  });

  queryClient.setQueriesData<InfiniteData<ITweet[]>>(
    { queryKey: ["profile", username] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => filterOut(page)),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["bookmarks"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => filterOut(page)),
    };
  });

  queryClient.setQueryData<TweetDetailData>(
    ["tweet", String(tweetId)],
    (old) => {
      if (!old) return old;
      if (old.tweet.id === tweetId) return undefined;
      return {
        ...old,
        replies: filterOut(old.replies),
      };
    },
  );

  // Also update any thread view cache (rootId) that contains this tweet.
  queryClient.setQueriesData<TweetDetailData>(
    { queryKey: ["tweet"] },
    (old) => {
      if (!old) return old;

      const parentChain = old.parentChain ?? [];
      const matchesTweet = old.tweet.id === tweetId;
      const matchesParent = old.parentTweet?.id === tweetId;
      const matchesChain = parentChain.some((t) => t.id === tweetId);
      const matchesReply = old.replies.some((t) => t.id === tweetId);

      if (!matchesTweet && !matchesParent && !matchesChain && !matchesReply) {
        return old;
      }

      if (matchesTweet) return undefined;

      return {
        ...old,
        parentTweet: matchesParent ? undefined : old.parentTweet,
        parentChain: old.parentChain
          ? old.parentChain.filter((t) => t.id !== tweetId)
          : old.parentChain,
        replies: old.replies.filter((t) => t.id !== tweetId),
      };
    },
  );
}

export function prependTweetToFeedAndProfile(
  queryClient: QueryClient,
  username: string,
  tweet: ITweet,
): void {
  const prepend = (old: InfiniteData<ITweet[]> | undefined) => {
    if (!old) {
      return {
        pages: [[tweet]],
        pageParams: [0],
      } satisfies InfiniteData<ITweet[]>;
    }
    const [firstPage = [], ...restPages] = old.pages;
    return {
      ...old,
      pages: [[tweet, ...firstPage], ...restPages],
    };
  };

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["feed"], prepend);

  queryClient.setQueriesData<InfiniteData<ITweet[]>>(
    { queryKey: ["profile", username] },
    prepend,
  );
}

export function prependReplyToTweetDetail(
  queryClient: QueryClient,
  parentId: number,
  reply: ITweet,
): void {
  queryClient.setQueryData<TweetDetailData>(
    ["tweet", String(parentId)],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        replies: [reply, ...old.replies],
      };
    },
  );

  queryClient.setQueriesData<TweetDetailData>(
    { queryKey: ["tweet"] },
    (old) => {
      if (!old) return old;
      if (old.tweet.id !== parentId) return old;
      return {
        ...old,
        replies: [reply, ...old.replies],
      };
    },
  );
}

export function replaceReplyInTweetDetailCaches(
  queryClient: QueryClient,
  parentId: number,
  tempReplyId: number,
  newReply: ITweet,
): void {
  const replaceInReplies = (old: TweetDetailData | undefined) => {
    if (!old) return old;
    if (!Array.isArray(old.replies)) return old;
    return {
      ...old,
      replies: old.replies.map((r) => (r.id === tempReplyId ? newReply : r)),
    };
  };

  queryClient.setQueryData<TweetDetailData>(
    ["tweet", String(parentId)],
    replaceInReplies,
  );

  queryClient.setQueriesData<TweetDetailData>(
    { queryKey: ["tweet"] },
    (old) => {
      if (!old) return old;
      if (old.tweet.id !== parentId) return old;
      return replaceInReplies(old);
    },
  );
}

export function removeReplyFromTweetDetailCaches(
  queryClient: QueryClient,
  parentId: number,
  replyId: number,
): void {
  const removeFromReplies = (old: TweetDetailData | undefined) => {
    if (!old) return old;
    if (!Array.isArray(old.replies)) return old;
    return {
      ...old,
      replies: old.replies.filter((r) => r.id !== replyId),
    };
  };

  queryClient.setQueryData<TweetDetailData>(
    ["tweet", String(parentId)],
    removeFromReplies,
  );

  queryClient.setQueriesData<TweetDetailData>(
    { queryKey: ["tweet"] },
    (old) => {
      if (!old) return old;
      if (old.tweet.id !== parentId) return old;
      return removeFromReplies(old);
    },
  );
}

export function appendRepliesToTweetDetailCache(
  queryClient: QueryClient,
  tweetId: number,
  details: ITweetDetailsResponse,
): void {
  const appendReplies = (old: TweetDetailData | undefined): TweetDetailData => {
    if (!old) {
      return {
        tweet: details.tweet,
        parentTweet: details.parentTweet ?? undefined,
        parentChain: details.parentChain ?? [],
        replies: details.replies ?? [],
      };
    }
    const oldReplies: ITweet[] = Array.isArray(old.replies) ? old.replies : [];
    const newReplies = details.replies ?? [];
    const existingIds = new Set(oldReplies.map((t) => t.id));
    return {
      ...old,
      tweet: old.tweet ?? details.tweet,
      parentTweet: old.parentTweet ?? details.parentTweet ?? undefined,
      parentChain: old.parentChain ?? details.parentChain ?? [],
      replies: [...oldReplies, ...newReplies.filter((r) => !existingIds.has(r.id))],
    };
  };

  queryClient.setQueryData<TweetDetailData>(["tweet", String(tweetId)], appendReplies);
}

export function replaceTempTweetInFeedAndProfile(
  queryClient: QueryClient,
  username: string,
  newTweet: ITweet,
): void {
  const replaceOrPrepend = (old: InfiniteData<ITweet[]> | undefined) => {
    if (!old?.pages?.length) return old;
    const [firstPage, ...restPages] = old.pages;
    const isTemp = firstPage[0]?.id != null && firstPage[0].id < 0;
    const newFirstPage = isTemp
      ? [newTweet, ...firstPage.slice(1)]
      : [newTweet, ...firstPage];
    return {
      ...old,
      pages: [newFirstPage, ...restPages],
    };
  };

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["feed"], replaceOrPrepend);

  queryClient.setQueriesData<InfiniteData<ITweet[]>>(
    { queryKey: ["profile", username] },
    replaceOrPrepend,
  );
}

export function markConversationAsReadInCache(
  queryClient: QueryClient,
  conversationId: number,
): void {
  queryClient.setQueryData<InfiniteData<IConversationListItem[]>>(
    ["conversations"],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((c) =>
            c.id === conversationId
              ? { ...c, hasUnread: false, unreadCount: 0 }
              : c,
          ),
        ),
      };
    },
  );
}

export function removeConversationFromCache(
  queryClient: QueryClient,
  conversationId: number,
): void {
  queryClient.setQueryData<InfiniteData<IConversationListItem[]>>(
    ["conversations"],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.filter((conv) => conv.id !== conversationId),
        ),
      };
    },
  );
}

export function addTempMessageToCache(
  queryClient: QueryClient,
  conversationId: number,
  tempMessage: IMessageItem,
): void {
  queryClient.setQueryData<InfiniteData<IMessagePage>>(
    ["messages", conversationId],
    (old) => {
      if (!old) {
        return {
          pages: [
            {
              content: [tempMessage],
              totalElements: 1,
              size: 10,
              number: 0,
            },
          ],
          pageParams: [0],
        };
      }
      const pages = [...old.pages];
      if (!pages.length) {
        pages.push({
          content: [],
          totalElements: 0,
          size: 10,
          number: 0,
        });
      }
      const first = pages[0];
      pages[0] = {
        ...first,
        content: [tempMessage, ...first.content],
        totalElements: first.totalElements + 1,
      };
      return {
        ...old,
        pages,
      };
    },
  );
}

export function replaceTempMessageInCache(
  queryClient: QueryClient,
  conversationId: number,
  newMessage: IMessageItem,
  tempId: number,
): void {
  queryClient.setQueryData<InfiniteData<IMessagePage>>(
    ["messages", conversationId],
    (old) => {
      if (!old) {
        return {
          pages: [
            {
              content: [newMessage],
              totalElements: 1,
              size: 10,
              number: 0,
            },
          ],
          pageParams: [0],
        };
      }
      const pages = old.pages.map((page, pageIndex) => {
        if (pageIndex !== 0) return page;
        const hasTemp = page.content.some((m) => m.id === tempId);
        if (!hasTemp) return page;
        return {
          ...page,
          content: page.content.map((m) => (m.id === tempId ? newMessage : m)),
        };
      });
      return {
        ...old,
        pages,
      };
    },
  );
}

export function removeTempMessageFromCache(
  queryClient: QueryClient,
  conversationId: number,
  tempId: number,
): void {
  queryClient.setQueryData<InfiniteData<IMessagePage>>(
    ["messages", conversationId],
    (old) => {
      if (!old) return old;
      const pages = old.pages.map((page, pageIndex) => {
        if (pageIndex !== 0) return page;
        const had = page.content.some((m) => m.id === tempId);
        if (!had) return page;
        return {
          ...page,
          content: page.content.filter((m) => m.id !== tempId),
          totalElements: Math.max(0, page.totalElements - 1),
        };
      });
      return { ...old, pages };
    },
  );
}

export function updateConversationLastMessage(
  queryClient: QueryClient,
  conversationId: number,
  newMessage: IMessageItem,
): void {
  queryClient.setQueryData<InfiniteData<IConversationListItem[]>>(
    ["conversations"],
    (old) => {
      if (!old) return old;

      const flattened = old.pages.flatMap((page) => page);
      const updated = flattened.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: {
                content: newMessage.content,
                createdAt: newMessage.createdAt,
                senderUsername: newMessage.senderUsername,
              },
              lastMessageAt: newMessage.createdAt,
            }
          : c,
      );

      const sorted = updated.sort(
        (a, b) =>
          new Date(b.lastMessageAt ?? "").getTime() -
          new Date(a.lastMessageAt ?? "").getTime(),
      );

      return {
        ...old,
        pages: [sorted],
        pageParams: [old.pageParams[0] ?? 0],
      };
    },
  );
}

export function updateProfileImageInCache(
  queryClient: QueryClient,
  username: string,
  imageUrl: string,
): void {
  queryClient.setQueryData<IProfileHeader>(
    ["profileHeader", username],
    (old) => (old ? { ...old, imageUrl } : old),
  );

  queryClient.setQueryData<{ username: string; profilePicture: string | null }>(
    ["self"],
    (old) => (old ? { ...old, profilePicture: imageUrl } : old),
  );
}

export function updateProfileDataInCache(
  queryClient: QueryClient,
  username: string,
  data: Partial<IProfileHeader>,
): void {
  queryClient.setQueryData<IProfileHeader>(
    ["profileHeader", username],
    (old) => (old ? { ...old, ...data } : old),
  );
}

export function setProfileFollowStateInCache(
  queryClient: QueryClient,
  username: string,
  isFollowed: boolean,
): void {
  queryClient.setQueryData<IProfileHeader>(
    ["profileHeader", username],
    (old) => {
      if (!old) return old;
      const delta = isFollowed ? 1 : -1;
      return {
        ...old,
        isFollowed,
        followers: Math.max(0, old.followers + delta),
      };
    },
  );
}

export function setTweetEngagementInAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  updates: Partial<
    Pick<
      ITweet,
      | "isLiked"
      | "likesCount"
      | "isRetweeted"
      | "retweetsCount"
      | "isBookmarked"
      | "bookmarksCount"
    >
  >,
): void {
  updateTweetInAllCaches(queryClient, tweetId, (t) => ({
    ...t,
    ...updates,
  }));

  queryClient.setQueryData<InfiniteData<IVideoTweetsResponse>>(
    ["reels-videos"],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          content: page.content.map((tweet) =>
            tweet.id === tweetId ? { ...tweet, ...updates } : tweet,
          ),
        })),
      };
    },
  );
}

export function updateCommunityNoteRatingInCache(
  queryClient: QueryClient,
  tweetId: number,
  noteId: number,
  isHelpful: boolean,
): void {
  const updateNote = (tweet: ITweet): ITweet => {
    if (!tweet.communityNote || tweet.communityNote.id !== noteId) {
      return tweet;
    }
    return {
      ...tweet,
      communityNote: {
        ...tweet.communityNote,
        isHelpful,
      },
    };
  };

  const idStr = String(tweetId);

  queryClient.setQueryData<TweetDetailData>(["tweet", idStr], (old) => {
    if (!old) return old;
    return {
      ...old,
      tweet: old.tweet.id === tweetId ? updateNote(old.tweet) : old.tweet,
      parentTweet: old.parentTweet
        ? updateNote(old.parentTweet)
        : old.parentTweet,
      replies: old.replies.map(updateNote),
    };
  });

  queryClient.setQueryData<InfiniteData<ITweet[]>>(["feed"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((tweet) => (tweet.id === tweetId ? updateNote(tweet) : tweet)),
      ),
    };
  });

  queryClient.setQueriesData<InfiniteData<ITweet[]>>(
    { queryKey: ["profile"] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((tweet) =>
            tweet.id === tweetId ? updateNote(tweet) : tweet,
          ),
        ),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<ITweet[]>>(
    ["community-notes"],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((tweet) =>
            tweet.id === tweetId ? updateNote(tweet) : tweet,
          ),
        ),
      };
    },
  );
}
