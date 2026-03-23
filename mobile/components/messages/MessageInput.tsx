import { Colors } from "@/constants/theme";
import { useKeyboardHeight } from "@/hooks/useKeyboard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useSendMessage } from "@/hooks/messages/useSendMessage";
import { Image } from 'expo-image';


export default function MessageInput({ setGifPickerVisible, gifUrl, setGifUrl, imageUrl, setImageUrl, conversationId }: { setGifPickerVisible: (visible: boolean) => void, gifUrl: string | null, setGifUrl: (url: string | null) => void, imageUrl: string | null, setImageUrl: (url: string | null) => void, conversationId: number }) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const borderColor = isDark ? '#3d4146' : '#d8dde1';
    const textColor = colors.text;
    const mutedColor = colors.icon;

    const [input, setInput] = useState('');

    const insets = useSafeAreaInsets();

    useKeyboardHeight();
    const { mutateAsync: sendMessage, isPending } = useSendMessage(conversationId);

    const handleSend = () => {
        const t = input.trim();
        if (!t && !imageUrl && !gifUrl) return;
        if (isPending) return;
        const payload = { content: t, imageUrl, gifUrl };
        setInput('');
        setImageUrl(null);
        setGifUrl(null);
        sendMessage(payload);
    };

    return (
        <View style={[styles.inputRow, { borderTopColor: borderColor, paddingBottom: insets.bottom + 5 || 12 }]}>
            {(imageUrl || gifUrl) && (
                <View style={styles.previewRow}>
                    {imageUrl && (
                        <View style={styles.previewWrap}>
                            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.previewRemove} onPress={() => setImageUrl(null)}>
                                <MaterialIcons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                    {gifUrl && (
                        <View style={styles.previewWrap}>
                            <Image source={{ uri: gifUrl }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.previewRemove} onPress={() => setGifUrl(null)}>
                                <MaterialIcons name="close" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            <View style={styles.inputAndActions}>
                <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={async () => {
                        if (Platform.OS === 'web') return;
                        const ImagePicker = require('expo-image-picker');
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') return;
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets[0]) {
                            setGifUrl(null);
                            setImageUrl(result.assets[0].uri);
                        }
                    }}
                    hitSlop={8}
                    disabled={isPending}
                >
                    <MaterialIcons name="image" size={22} color="#1d9bf0" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => setGifPickerVisible(true)}
                    hitSlop={8}
                    disabled={isPending}
                >
                    <MaterialIcons name="gif" size={26} color="#1d9bf0" />
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, { color: textColor, borderColor }]}
                    placeholderTextColor={mutedColor}
                    placeholder="Say something..."
                    value={input}
                    onChangeText={setInput}
                    multiline
                    maxLength={10000}
                    editable={!isPending}
                />
                <TouchableOpacity
                    style={[
                        styles.sendBtn,
                        {
                            backgroundColor:
                                (!input.trim() && !imageUrl && !gifUrl) || isPending
                                    ? mutedColor + '40'
                                    : '#1d9bf0',
                        },
                    ]}
                    onPress={handleSend}
                    disabled={(!input.trim() && !imageUrl && !gifUrl) || isPending}
                >
                    {isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <MaterialIcons name="send" size={22} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    inputRow: {
        flexDirection: 'column',
        paddingHorizontal: 12,
        paddingTop: 12,
        gap: 8,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        minHeight: 44,
        textAlignVertical: 'center',
        alignContent: 'center',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewRow: {
        flexDirection: 'row',
        gap: 8,
    },
    previewWrap: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    previewImage: {
        width: 80,
        height: 80,
    },
    previewRemove: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputAndActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mediaBtn: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
    },
});