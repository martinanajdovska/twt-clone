import React from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    Dimensions,
    Text,
    Alert,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveImageOnWebOnly } from '@/lib/webSaveImage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
}

export function ImageViewer({ visible, imageUrl, onClose }: ImageViewerProps) {
    const insets = useSafeAreaInsets();

    if (!visible) return null;

    const handleSave = async () => {
        const result = await saveImageOnWebOnly(imageUrl);
        if (!result.ok) {
            Alert.alert('Save failed', result.message ?? 'Failed to save image.');
            return;
        }
        Alert.alert('Saved', 'Download started.');
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
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="contain"
                    />
                </Pressable>
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
});