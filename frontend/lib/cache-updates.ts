import type { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { ITweetResponse } from "@/DTO/ITweetResponse";

type TweetDetailPage = {
  tweet: ITweetResponse;
  parentTweet?: ITweetResponse;
  replies: ITweetResponse[];
};

function updateTweetInArray(
  tweets: ITweetResponse[],
  tweetId: number,
  updater: (t: ITweetResponse) => ITweetResponse,
): ITweetResponse[] {
  return tweets.map((t) => (t.id === tweetId ? updater(t) : t));
}

function updateTweetInDetailPage(
  page: TweetDetailPage,
  tweetId: number,
  updater: (t: ITweetResponse) => ITweetResponse,
): TweetDetailPage {
  const updatedTweet =
    page.tweet.id === tweetId ? updater(page.tweet) : page.tweet;
  const updatedParent =
    page.parentTweet?.id === tweetId
      ? updater(page.parentTweet)
      : page.parentTweet;
  const updatedReplies = updateTweetInArray(page.replies, tweetId, updater);
  return {
    ...page,
    tweet: updatedTweet,
    ...(updatedParent !== undefined && { parentTweet: updatedParent }),
    replies: updatedReplies,
  };
}

export function updateTweetInAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  updater: (t: ITweetResponse) => ITweetResponse,
): void {
  const idStr = String(tweetId);

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(["feed"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        updateTweetInArray(page, tweetId, updater),
      ),
    };
  });

  queryClient.setQueriesData<InfiniteData<ITweetResponse[]>>(
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

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(
    ["bookmarks"],
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

  queryClient.setQueryData<InfiniteData<TweetDetailPage>>(
    ["tweet", idStr],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          updateTweetInDetailPage(page, tweetId, updater),
        ),
      };
    },
  );
}

export function removeTweetFromAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  username: string,
): void {
  const idStr = String(tweetId);

  const filterOut = (tweets: ITweetResponse[]) =>
    tweets.filter((t) => t.id !== tweetId);

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(["feed"], (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => filterOut(page)),
    };
  });

  queryClient.setQueriesData<InfiniteData<ITweetResponse[]>>(
    { queryKey: ["profile", username] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => filterOut(page)),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(
    ["bookmarks"],
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => filterOut(page)),
      };
    },
  );

  queryClient.setQueryData<InfiniteData<TweetDetailPage>>(
    ["tweet", idStr],
    (old) => {
      if (!old?.pages?.length) return old;
      const first = old.pages[0];
      if (first.tweet.id === tweetId) return undefined; // force refetch for main tweet deleted

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          replies: filterOut(page.replies),
        })),
      };
    },
  );
}

export function prependTweetToFeedAndProfile(
  queryClient: QueryClient,
  username: string,
  tweet: ITweetResponse,
): void {
  const prepend = (old: InfiniteData<ITweetResponse[]> | undefined) => {
    if (!old) return old;
    return {
      ...old,
      pages: [[tweet], ...old.pages],
      pageParams: [0, ...old.pageParams],
    };
  };

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(["feed"], prepend);

  queryClient.setQueriesData<InfiniteData<ITweetResponse[]>>(
    { queryKey: ["profile", username] },
    prepend,
  );
}

export function replaceTempTweetInFeedAndProfile(
  queryClient: QueryClient,
  username: string,
  newTweet: ITweetResponse,
): void {
  const replaceOrPrepend = (
    old: InfiniteData<ITweetResponse[]> | undefined,
  ) => {
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

  queryClient.setQueryData<InfiniteData<ITweetResponse[]>>(
    ["feed"],
    replaceOrPrepend,
  );

  queryClient.setQueriesData<InfiniteData<ITweetResponse[]>>(
    { queryKey: ["profile", username] },
    replaceOrPrepend,
  );
}

export function updateTweetPollInAllCaches(
  queryClient: QueryClient,
  tweetId: number,
  pollOrUpdater:
    | ITweetResponse["poll"]
    | ((old: ITweetResponse["poll"] | null) => ITweetResponse["poll"] | null),
): void {
  const updater = (t: ITweetResponse) => ({
    ...t,
    poll:
      typeof pollOrUpdater === "function"
        ? pollOrUpdater(t.poll)
        : pollOrUpdater,
  });
  updateTweetInAllCaches(queryClient, tweetId, updater);
}

export function prependReplyToTweetDetail(
  queryClient: QueryClient,
  parentId: number,
  reply: ITweetResponse,
): void {
  queryClient.setQueryData<InfiniteData<TweetDetailPage>>(
    ["tweet", String(parentId)],
    (old) => {
      if (!old?.pages?.length) return old;
      const [first, ...rest] = old.pages;
      return {
        ...old,
        pages: [{ ...first, replies: [reply, ...first.replies] }, ...rest],
      };
    },
  );
}
