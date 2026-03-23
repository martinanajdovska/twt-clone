import { formatRelativeTime } from "@/lib/relativeTime";
import { IMessageItem } from "@/types/message";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.72;

export default function MessageBubble({ item, other }: { item: IMessageItem, other: { username: string, imageUrl: string | null, displayName: string | null } }) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const textColor = colors.text;
    const mutedColor = colors.icon;

    const isSelf = other ? item.senderUsername !== other.username : false;
    return (
        <View style={[styles.bubbleWrap, isSelf && styles.bubbleWrapSelf]}>
            {!isSelf && item.senderImageUrl && (
                <Image source={{ uri: item.senderImageUrl }} style={styles.bubbleAvatar} />
            )}
            <View style={[styles.bubbleCol, isSelf && styles.bubbleColSelf]}>
                <Text style={[styles.bubbleTime, { color: mutedColor }]}>
                    {formatRelativeTime(item.createdAt)}
                </Text>
                <View
                    style={[
                        styles.bubble,
                        isSelf
                            ? { backgroundColor: '#1d9bf0' }
                            : { backgroundColor: isDark ? '#2f3336' : '#e8e8e8' },
                    ]}
                >
                    {item.content ? (
                        <Text style={[styles.bubbleText, { color: isSelf ? '#fff' : textColor }]}>
                            {item.content}
                        </Text>
                    ) : null}
                    {item.imageUrl && (
                        <Image source={{ uri: item.imageUrl }} style={styles.bubbleImage} />
                    )}
                    {item.gifUrl && !item.imageUrl && (
                        <Image source={{ uri: item.gifUrl }} style={styles.bubbleImage} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bubbleAvatar: { width: 28, height: 28, borderRadius: 14 },
    bubbleWrap: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
        gap: 8,
    },
    bubbleWrapSelf: { justifyContent: 'flex-end' },
    bubbleCol: {
        flexDirection: 'column',
        maxWidth: BUBBLE_MAX_WIDTH,
        alignItems: 'flex-start',
        minWidth: 0,
    },
    bubbleColSelf: { alignItems: 'flex-end' },
    bubble: {
        padding: 12,
        borderRadius: 18,
        minWidth: 0,
        maxWidth: BUBBLE_MAX_WIDTH,
    },
    bubbleText: {
        fontSize: 15,
        lineHeight: 20,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    bubbleTime: {
        fontSize: 11,
        marginBottom: 3,
        paddingHorizontal: 4,
    },
    bubbleImage: {
        marginTop: 4,
        width: 200,
        height: 200,
        borderRadius: 12,
    },
});