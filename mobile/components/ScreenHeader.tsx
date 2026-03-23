import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
    title: string;

    leftAction?: 'back' | 'avatar' | 'none';
    onLeftPress?: () => void;
    avatarUrl?: string | null;
    avatarFallbackText?: string;

    titleLeftAvatar?: {
        url?: string | null;
        fallbackText?: string;
        onPress?: () => void;
    };

    rightAction?: React.ReactNode;

    animated?: boolean;
    animatedOpacity?: Animated.Value;
    animatedHeight?: Animated.Value;

    style?: ViewStyle;
}

export function ScreenHeader({
    title,
    leftAction = 'back',
    onLeftPress,
    avatarUrl,
    avatarFallbackText,
    titleLeftAvatar,
    rightAction,
    animated = false,
    animatedOpacity,
    animatedHeight,
    style,
}: ScreenHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme, isDark } = useTheme();

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const textColor = isDark ? '#fff' : '#000';

    const handleLeftPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else if (leftAction === 'back') {
            router.back();
        }
    };

    const renderLeftAction = () => {
        if (leftAction === 'none') return null;

        if (leftAction === 'avatar') {
            return (
                <TouchableOpacity onPress={handleLeftPress}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: '#536471' }]}>
                            <ThemedText style={styles.avatarText}>
                                {avatarFallbackText || '?'}
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity onPress={handleLeftPress} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
        );
    };

    const renderTitleSection = () => {
        if (titleLeftAvatar) {
            const TitleWrapper = titleLeftAvatar.onPress ? TouchableOpacity : View;

            return (
                <TitleWrapper
                    style={styles.titleSection}
                    onPress={titleLeftAvatar.onPress}
                    activeOpacity={titleLeftAvatar.onPress ? 0.7 : 1}
                >
                    {titleLeftAvatar.url ? (
                        <Image source={{ uri: titleLeftAvatar.url }} style={styles.titleAvatar} />
                    ) : (
                        <View style={[styles.titleAvatar, styles.avatarFallback, { backgroundColor: '#536471' }]}>
                            <ThemedText style={styles.avatarText}>
                                {titleLeftAvatar.fallbackText || '?'}
                            </ThemedText>
                        </View>
                    )}
                    <ThemedText type="title" style={styles.titleWithAvatar} numberOfLines={1}>
                        {title}
                    </ThemedText>
                </TitleWrapper>
            );
        }

        return (
            <ThemedText type="title" style={styles.title} numberOfLines={1}>
                {title}
            </ThemedText>
        );
    };

    const headerStyle = [
        styles.header,
        {
            borderBottomColor: borderColor,
            paddingTop: insets.top,
        },
        style,
    ];

    if (animated && animatedOpacity && animatedHeight) {
        const animatedStyle = {
            opacity: animatedOpacity,
            height: Animated.add(animatedHeight, new Animated.Value(insets.top)),
            overflow: 'hidden' as const,
        };

        return (
            <Animated.View style={[headerStyle, animatedStyle]}>
                {renderLeftAction()}
                {renderTitleSection()}
                <View style={styles.rightContainer}>{rightAction}</View>
            </Animated.View>
        );
    }

    return (
        <View style={headerStyle}>
            {renderLeftAction()}
            {renderTitleSection()}
            <View style={styles.rightContainer}>{rightAction}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
    avatarFallback: { justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    title: {
        fontSize: 20,
        fontWeight: '800',
        flex: 1,
        marginLeft: 20,
    },
    titleSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 10,
    },
    titleAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
    },
    titleWithAvatar: {
        fontSize: 20,
        fontWeight: '800',
        flex: 1,
    },
    rightContainer: {
        marginLeft: 8,
    },
});