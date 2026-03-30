import { TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import { ThemedText } from "../ui/themed-text";
import { formatRelativeTime } from "@/lib/relativeTime";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";
import { IConversationListItem } from "@/types/message";
import { Image } from 'expo-image';


export default function ConversationListItem({
    item,
    onArchive,
    isArchiving = false,
}: {
    item: IConversationListItem;
    onArchive?: (id: number) => void;
    isArchiving?: boolean;
}) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const mutedColor = colors.icon;


    const openConversation = (id: number) => {
        router.push(`/(main)/conversation/${id}` as any);
    };

    const confirmArchive = () => {
        if (!onArchive) return;
        Alert.alert(
            "Archive conversation?",
            "This will remove the conversation from your inbox. The other person will still be able to see it.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", style: "destructive", onPress: () => onArchive(item.id) },
            ],
        );
    };

    return (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: borderColor }]}
            onPress={() => openConversation(item.id)}
            onLongPress={confirmArchive}
            delayLongPress={280}
            activeOpacity={0.7}
        >
            {item.otherParticipant.imageUrl ? (
                <Image source={{ uri: item.otherParticipant.imageUrl }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: '#536471' }]}>
                    <ThemedText style={styles.avatarText}>
                        {item.otherParticipant.username.charAt(0).toUpperCase()}
                    </ThemedText>
                </View>
            )}
            <View style={styles.body}>
                <View style={styles.rowTop}>
                    <ThemedText type="defaultSemiBold">
                        {item.otherParticipant.displayName || item.otherParticipant.username}
                    </ThemedText>
                    {item.lastMessageAt && (
                        <ThemedText style={[styles.time, { color: mutedColor }]}>
                            {formatRelativeTime(item.lastMessageAt)}
                        </ThemedText>
                    )}
                </View>
                <ThemedText style={[styles.preview, { color: mutedColor }]} numberOfLines={1}>
                    {item.lastMessage
                        ? item.lastMessage.senderUsername === item.otherParticipant.username
                            ? item.lastMessage.content
                            : `You: ${item.lastMessage.content}`
                        : 'No messages yet'}
                </ThemedText>
            </View>
            {item.hasUnread && <View style={[styles.unreadDot, { backgroundColor: '#1d9bf0' }]} />}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    avatarFallback: { justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    body: { flex: 1, minWidth: 0 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    time: { fontSize: 13 },
    preview: { fontSize: 14, marginTop: 2 },
    unreadDot: { width: 10, height: 10, borderRadius: 5 },
});

