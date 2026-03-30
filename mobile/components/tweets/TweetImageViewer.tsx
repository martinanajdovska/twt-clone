import React, { useState } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Text,
    Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { TweetActions } from './TweetActions';
import type { ITweet } from '@/types/tweet';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCompose } from '@/contexts/ComposeContext';

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
    if (!visible) return null;

    const [retweetMenuVisible, setRetweetMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];
    const { openCompose } = useCompose();
    const textColor = colors.text;
    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const menuBg = colors.background;



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
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                <Pressable style={styles.imageContainer} onPress={onClose}>
                    <Image source={{ uri: imageUrl }} style={styles.image} contentFit="contain" />
                </Pressable>

                <BlurView intensity={80} tint="dark" style={styles.actionsContainer}>
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
                </BlurView>

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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
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
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 40,
        paddingTop: 20,
        overflow: 'hidden',
    },
    actionsInner: {
        paddingHorizontal: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
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