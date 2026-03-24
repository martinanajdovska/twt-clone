import { ITweet } from "@/types/tweet";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCompose } from "@/contexts/ComposeContext";

export default function Reply({ self, tweet }: { self: { profilePicture?: string | null, username: string }, tweet: ITweet }) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const insets = useSafeAreaInsets();
    const { openCompose } = useCompose();

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const mutedColor = colors.icon;
    const barBg = colors.background;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.replyBar, { backgroundColor: barBg, borderTopColor: borderColor, paddingBottom: insets.bottom + 10 }]}
            onPress={() => openCompose({ parentId: tweet.id })}
        >
            {self.profilePicture ? (
                <Image source={{ uri: self.profilePicture }} style={styles.replyBarAvatar} />
            ) : (
                <View style={[styles.replyBarAvatar, styles.replyBarAvatarFallback]}>
                    <Text style={styles.replyBarAvatarText}>
                        {self.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <Text style={[styles.replyBarPlaceholder, { color: mutedColor }]}>
                Post your reply
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    replyBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 12,
    },
    replyBarAvatar: { width: 36, height: 36, borderRadius: 18 },
    replyBarAvatarFallback: {
        backgroundColor: '#536471',
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyBarAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    replyBarPlaceholder: { fontSize: 17, flex: 1 },
});