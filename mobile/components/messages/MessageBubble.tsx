import { formatRelativeTime } from "@/lib/relativeTime";
import { IMessageItem } from "@/types/message";
import { Image } from "expo-image";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from "react-native";
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from "react";
import { ImageViewer } from "./ImageViewer";
import { saveImageOnWebOnly } from "@/lib/webSaveImage";

const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.72;

export default function MessageBubble({
    item,
    other,
    highlighted = false,
}: {
    item: IMessageItem,
    other: { username: string, imageUrl: string | null, displayName: string | null },
    highlighted?: boolean,
}) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];


    const textColor = colors.text;
    const mutedColor = colors.icon;

    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

    const handleImagePress = (url: string) => {
        setSelectedImageUrl(url);
        setImageViewerVisible(true);
    };
    const handleImageLongPress = async (url: string) => {
        const result = await saveImageOnWebOnly(url);
        if (!result.ok) {
            Alert.alert('Save failed', result.message ?? 'Failed to save image.');
            return;
        }
        Alert.alert('Saved', 'Download started.');
    };

    const isSelf = other ? item.senderUsername !== other.username : false;
    return (
        <>
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
                                : { backgroundColor: isDark ? '#2f3336' : '#d9dde1' },
                            highlighted && styles.highlightedBubble,
                        ]}
                    >
                        {item.content ? (
                            <Text style={[styles.bubbleText, { color: isSelf ? '#fff' : textColor }]}>
                                {item.content}
                            </Text>
                        ) : null}
                        {item.imageUrl && (
                            <TouchableOpacity onPress={() => handleImagePress(item.imageUrl!)} onLongPress={() => handleImageLongPress(item.imageUrl!)}>
                                <Image source={{ uri: item.imageUrl }} style={styles.bubbleImage} />
                            </TouchableOpacity>
                        )}
                        {item.gifUrl && !item.imageUrl && (
                            <TouchableOpacity onPress={() => handleImagePress(item.gifUrl!)} onLongPress={() => handleImageLongPress(item.gifUrl!)}>
                                <Image source={{ uri: item.gifUrl }} style={styles.bubbleImage} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
            <ImageViewer
                visible={imageViewerVisible}
                imageUrl={selectedImageUrl}
                onClose={() => setImageViewerVisible(false)}
            />
        </>
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
    highlightedBubble: {
        borderWidth: 2,
        borderColor: '#f7b500',
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