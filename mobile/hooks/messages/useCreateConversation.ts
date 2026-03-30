import { createOrGetConversation } from "@/api/messages";
import { IConversationListItem } from "@/types/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUsername: string) =>
      createOrGetConversation(otherUsername),
    onSuccess: (data) => {
      const newItem: IConversationListItem = {
        ...data,
        lastMessage: null,
        lastMessageAt: null,
        hasUnread: false,
        unreadCount: 0,
      };
      queryClient.setQueryData<IConversationListItem[]>(
        ["messages", "conversations"],
        (old) => {
          if (!old) return [newItem];
          const without = old.filter((c) => c.id !== data.id);
          return [newItem, ...without];
        },
      );
      router.push(`/(main)/conversation/${data.id}` as any);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });
};
