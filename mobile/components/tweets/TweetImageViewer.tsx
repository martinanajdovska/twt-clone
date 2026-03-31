import React, { useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Text,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { TweetActions } from './TweetActions';
import type { ITweet } from '@/types/tweet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompose } from '@/contexts/ComposeContext';
import { saveImageOnWebOnly } from '@/lib/webSaveImage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TweetImageViewerProps {
    visible: boolean;
    imageUrl: string;
    tweet: ITweet;
    onClose: () => void;
    onLikePress: (e: { stopPropagation?: () => void }) => void;
    onBookmarkPress: (e: { stopPropagation?: () => void }) => void;
    handleRetweet: () => void;
    handleQuoteTweet: () => void;
}

export function TweetImageViewer({
    visible,
    imageUrl,
    tweet,
    onClose,
    onLikePress,
    onBookmarkPress,
    handleRetweet,
    handleQuoteTweet,
}: TweetImageViewerProps) {
    const [retweetMenuVisible, setRetweetMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];
    const { openCompose } = useCompose();
    const textColor = colors.text;
    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const menuBg = colors.background;

    if (!visible) return null;

    const handleSave = async () => {
        const result = await saveImageOnWebOnly(imageUrl);
        if (!result.ok) {
            Alert.alert('Save failed', result.message ?? 'Failed to save image.');
            return;
        }
        Alert.alert('Saved', 'Download started.');
    };

    const handleReplyFromViewer = () => {
        onClose();

        setTimeout(() => {
            openCompose({ parentId: tweet.id });
        }, 100);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.topControls, { top: Math.max(insets.top + 10, 50) }]}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Pressable style={styles.imageContainer} onPress={onClose} onLongPress={handleSave}>
                    <Image source={{ uri: imageUrl }} style={styles.image} contentFit="contain" />
                </Pressable>

                <View style={[styles.actionsContainer, styles.actionsContainerOverlay, { paddingBottom: insets.bottom }]}>
                    <View style={styles.actionsInner}>
                        <TweetActions
                            tweet={tweet}
                            iconColor="#fff"
                            mutedColor="rgba(255, 255, 255, 0.7)"
                            onRetweetPress={() => setRetweetMenuVisible(true)}
                            onLikePress={onLikePress}
                            onBookmarkPress={onBookmarkPress}
                            showCounts={false}
                            onReplyPress={handleReplyFromViewer}
                        />
                    </View>
                </View>

                <Modal
                    visible={retweetMenuVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setRetweetMenuVisible(false)}
                >
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => setRetweetMenuVisible(false)}
                        />
                        <View style={[styles.bottomSheet, { backgroundColor: menuBg, borderColor }]}>
                            <View style={[styles.bottomSheetHandle, { backgroundColor: borderColor }]} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => { handleRetweet(); setRetweetMenuVisible(false); }}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons
                                    name="repeat"
                                    size={22}
                                    color={tweet.isRetweeted ? "#00ba7c" : textColor}
                                />
                                <Text style={[styles.menuItemText, { color: tweet.isRetweeted ? "#00ba7c" : textColor }]}>
                                    {tweet.isRetweeted ? "Undo retweet" : "Retweet"}
                                </Text>
                            </TouchableOpacity>

                            <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => { handleQuoteTweet(); setRetweetMenuVisible(false); }}
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="format-quote" size={22} color={textColor} />
                                <Text style={[styles.menuItemText, { color: textColor }]}>Quote tweet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    topControls: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    saveButton: {
        paddingHorizontal: 14,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        width: SCREEN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH * 0.95,
        height: SCREEN_HEIGHT * 0.8,
    },
    actionsContainer: {
        position: 'absolute',
        left: 30,
        right: 0,
        bottom: 28,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionsInner: {
        width: '100%',
        maxWidth: 480,
        paddingHorizontal: 20,
    },
    actionsContainerOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingBottom: 24,
    },
    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderWidth: 1,
        paddingTop: 12,
        paddingBottom: 20,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
        opacity: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        gap: 12,
    },
    menuItemText: {
        fontSize: 17,
        fontWeight: '600',
    },
    menuDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 20,
    },
});