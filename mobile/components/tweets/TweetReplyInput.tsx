import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useSubmitTweetReply } from "@/hooks/tweets/useSubmitTweetReply";

export default function TweetReplyInput({
  parentId,
  onSubmitted,
  placeholder,
  extraBottomPadding,
  keyboardAwareBottomPadding,
}: {
  parentId: number;
  onSubmitted?: () => void;
  placeholder?: string;
  extraBottomPadding?: number;
  keyboardAwareBottomPadding?: boolean;
}) {
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const borderColor = isDark ? "#3d4146" : "#d8dde1";
  const mutedColor = colors.icon;
  const textColor = colors.text;

  const { keyboardHeight } = useKeyboard();

  const KEYBOARD_EXTRA_PADDING_PX = 30;
  const keyboardExtraBottomPadding = keyboardAwareBottomPadding
    ? Math.max(0, keyboardHeight) + KEYBOARD_EXTRA_PADDING_PX
    : 0;

  const [content, setContent] = useState("");
  const { isPending, hasSessionUser, submitReply } = useSubmitTweetReply({
    parentId,
    onSubmitted,
  });

  const trimmed = useMemo(() => content.trim(), [content]);
  const canSend = trimmed.length > 0 && !isPending && hasSessionUser;

  const handleSend = async () => {
    if (!canSend) return;
    const submitted = await submitReply(trimmed);
    if (submitted) {
      setContent("");
    }
  };

  return (
    <View
      style={[
        styles.inputRow,
        {
          borderTopColor: borderColor,
          paddingBottom:
            insets.bottom + 15 + keyboardExtraBottomPadding,
        },
      ]}
    >
      <View style={styles.inputAndActions}>
        <TextInput
          style={[styles.input, { color: textColor, borderColor }]}
          placeholder={placeholder ?? "Post your reply"}
          placeholderTextColor={mutedColor}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={10000}
          editable={!isPending}
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            {
              backgroundColor: canSend ? "#1d9bf0" : mutedColor + "40",
            },
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
    backgroundColor: "transparent",
  },
  inputAndActions: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 120,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});

