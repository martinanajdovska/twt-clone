import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { Platform, TouchableOpacity, View, StyleSheet, Text, useColorScheme } from "react-native"

const MAX_LENGTH = 280;

export default function TweetFormToolbar({
    content,
    isPending,
    canSubmit,
    canAddPoll,
    showPoll,
    hasGif,
    hasVideo,
    hasImage,
    onTogglePoll,
    onPickImage,
    onPickVideo,
    onGifClick,
}: {
    content: string;
    isPending: boolean;
    canSubmit: boolean;
    canAddPoll: boolean;
    showPoll: boolean;
    hasGif: boolean;
    hasVideo: boolean;
    hasImage: boolean;
    onTogglePoll: () => void;
    onPickImage: () => void;
    onPickVideo: () => void;
    onGifClick: () => void;
}) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const mutedColor = isDark ? '#71767b' : '#536471';

    const remaining = MAX_LENGTH - content.length;
    const isNearLimit = remaining <= 20;
    const isOverLimit = remaining < 0;

    return (
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <View style={styles.tools}>
                <TouchableOpacity
                    onPress={onPickImage}
                    disabled={isPending || showPoll || hasVideo}
                    style={styles.toolBtn}
                    hitSlop={8}
                >
                    <MaterialIcons name="image" size={20} color={showPoll || hasVideo ? mutedColor : '#1d9bf0'} />
                </TouchableOpacity>
                {Platform.OS !== 'web' && (
                    <TouchableOpacity
                        onPress={onPickVideo}
                        disabled={isPending || showPoll || hasImage || hasGif}
                        style={styles.toolBtn}
                        hitSlop={8}
                    >
                        <MaterialIcons name="videocam" size={20} color={hasImage || hasGif ? mutedColor : '#1d9bf0'} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    disabled={isPending || showPoll}
                    style={styles.toolBtn}
                    hitSlop={8}
                    onPress={onGifClick}
                >
                    <MaterialIcons name="gif" size={20} color={hasVideo ? mutedColor : '#1d9bf0'} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onTogglePoll}
                    disabled={isPending || hasImage || hasVideo}
                    style={styles.toolBtn}
                    hitSlop={8}
                >
                    <MaterialIcons
                        name="poll"
                        size={20}
                        color={hasImage || hasGif || hasVideo ? mutedColor : showPoll ? '#1d9bf0' : '#1d9bf0'}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.right}>
                {content.length > 0 && (
                    <View style={styles.countWrap}>
                        <Text style={[
                            styles.countText,
                            { color: isOverLimit ? '#f91880' : isNearLimit ? '#ffd400' : '#71767b' },
                        ]}>
                            {remaining}
                        </Text>
                    </View>
                )}
                {content.length > 0 && (
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        paddingBottom: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    tools: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    toolBtn: { padding: 6 },
    right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    countWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    countText: { fontSize: 12, fontWeight: '500' },
    divider: { width: 1, height: 24 },
});