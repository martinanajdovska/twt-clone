import { Alert } from "react-native";
import type { ITweet } from "@/types/tweet";

type StopEvent = { stopPropagation?: () => void };

type ToggleLikeMutation = (args: {
  tweetId: number;
  isLiked: boolean;
  likesCount: number;
}) => Promise<unknown>;

type ToggleRetweetMutation = (args: {
  tweetId: number;
  isRetweeted: boolean;
  retweetsCount: number;
}) => Promise<unknown>;

type ToggleBookmarkMutation = (args: {
  tweetId: number;
  isBookmarked: boolean;
  bookmarksCount: number;
}) => Promise<unknown>;

type VotePollMutation = (args: {
  tweetId: number;
  optionId: number;
  poll: ITweet["poll"];
}) => Promise<unknown>;

type TogglePinMutation = (args: {
  tweetId: number;
  isPinned: boolean;
}) => Promise<unknown>;

type DeleteTweetMutation = (args: {
  tweetId: number;
  username: string;
}) => Promise<unknown>;

type SubmitNoteMutation = (args: {
  tweetId: number;
  content: string;
}) => Promise<unknown>;

type CreateTweetCardHandlersParams = {
  tweet: ITweet;
  addNoteContent: string;
  addNotePending: boolean;
  deletePending: boolean;
  setRetweetMenuVisible: (v: boolean) => void;
  setOptionsMenuVisible: (v: boolean) => void;
  setAddNoteContent: (v: string) => void;
  setAddNoteModalVisible: (v: boolean) => void;
  setDeleteConfirmVisible: (v: boolean) => void;
  onNavigateToComposeQuote: (tweetId: number) => void;
  toggleLikeMutation: ToggleLikeMutation;
  toggleRetweetMutation: ToggleRetweetMutation;
  toggleBookmarkMutation: ToggleBookmarkMutation;
  votePollMutation: VotePollMutation;
  togglePinMutation: TogglePinMutation;
  submitNoteMutation: SubmitNoteMutation;
  deleteTweetMutation: DeleteTweetMutation;
};

export function createTweetCardHandlers({
  tweet,
  addNoteContent,
  addNotePending,
  deletePending,
  setRetweetMenuVisible,
  setOptionsMenuVisible,
  setAddNoteContent,
  setAddNoteModalVisible,
  setDeleteConfirmVisible,
  onNavigateToComposeQuote,
  toggleLikeMutation,
  toggleRetweetMutation,
  toggleBookmarkMutation,
  votePollMutation,
  togglePinMutation,
  submitNoteMutation,
  deleteTweetMutation,
}: CreateTweetCardHandlersParams) {
  const handleLike = async (e: StopEvent) => {
    e.stopPropagation?.();
    try {
      await toggleLikeMutation({
        tweetId: tweet.id,
        isLiked: tweet.isLiked,
        likesCount: tweet.likesCount,
      });
    } catch {
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleRetweetPress = (e: StopEvent) => {
    e.stopPropagation?.();
    setRetweetMenuVisible(true);
  };

  const handleRetweet = async () => {
    setRetweetMenuVisible(false);
    try {
      await toggleRetweetMutation({
        tweetId: tweet.id,
        isRetweeted: tweet.isRetweeted,
        retweetsCount: tweet.retweetsCount,
      });
    } catch {
      Alert.alert("Error", "Failed to update retweet");
    }
  };

  const handleQuoteTweet = () => {
    setRetweetMenuVisible(false);
    onNavigateToComposeQuote(tweet.id);
  };

  const handleBookmark = async (e: StopEvent) => {
    e.stopPropagation?.();
    try {
      await toggleBookmarkMutation({
        tweetId: tweet.id,
        isBookmarked: tweet.isBookmarked,
        bookmarksCount: tweet.bookmarksCount,
      });
    } catch {
      Alert.alert("Error", "Failed to update bookmark");
    }
  };

  const handleVote = async (optionId: number) => {
    if (!tweet.poll) return;
    try {
      await votePollMutation({
        tweetId: tweet.id,
        optionId,
        poll: tweet.poll,
      });
    } catch {
      Alert.alert("Error", "Failed to submit vote");
    }
  };

  const handlePin = async () => {
    setOptionsMenuVisible(false);
    try {
      await togglePinMutation({ tweetId: tweet.id, isPinned: tweet.isPinned });
    } catch {
      Alert.alert("Error", "Failed to update pin");
    }
  };

  const handleAddNoteSubmit = async () => {
    const content = addNoteContent.trim();
    if (!content || addNotePending) return;
    try {
      await submitNoteMutation({ tweetId: tweet.id, content });
      setAddNoteContent("");
      setAddNoteModalVisible(false);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to submit note",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletePending) return;
    try {
      await deleteTweetMutation({
        tweetId: tweet.id,
        username: tweet.username,
      });
      setDeleteConfirmVisible(false);
    } catch {
      Alert.alert("Error", "Failed to delete tweet");
    }
  };

  const handleDeletePress = () => {
    setOptionsMenuVisible(false);
    setDeleteConfirmVisible(true);
  };

  return {
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
  };
}
