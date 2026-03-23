import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Props = {
    imageUrl?: string | null;
    gifUrl?: string | null;
    videoUri?: string | null;
    onRemoveImage: () => void;
    onRemoveGif: () => void;
    onRemoveVideo: () => void;
    mutedColor: string;
};

export const MediaPreview = ({
    imageUrl,
    gifUrl,
    videoUri,
    onRemoveImage,
    onRemoveGif,
    onRemoveVideo,
    mutedColor,
}: Props) => {
    if (imageUrl) {
        return (
            <View style={styles.previewWrap}>
                <Image source={{ uri: imageUrl }} style={styles.preview} />
                <RemoveButton onPress={onRemoveImage} />
            </View>
        );
    }

    if (gifUrl) {
        return (
            <View style={styles.previewWrap}>
                <Image source={{ uri: gifUrl }} style={styles.preview} />
                <RemoveButton onPress={onRemoveGif} />
            </View>
        );
    }

    if (videoUri && Platform.OS !== 'web') {
        return (
            <View style={[styles.previewWrap, styles.videoPreviewWrap]}>
                <View style={styles.videoPlaceholder}>
                    <MaterialIcons name="videocam" size={48} color={mutedColor} />
                    <Text style={[styles.videoText, { color: mutedColor }]}>
                        Video attached
                    </Text>
                </View>
                <RemoveButton onPress={onRemoveVideo} />
            </View>
        );
    }

    return null;
};

const RemoveButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={styles.removeBtn} onPress={onPress}>
        <MaterialIcons name="close" size={16} color="#fff" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    previewWrap: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    preview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    videoPreviewWrap: {},
    videoPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    videoText: {
        fontSize: 14,
    },
    removeBtn: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});