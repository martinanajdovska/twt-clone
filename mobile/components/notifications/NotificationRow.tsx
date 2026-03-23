import { INotificationItem } from "@/types/notification";
import { Colors } from "@/constants/theme";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { ThemedText } from "../ui/themed-text";
import { formatRelativeTime } from "@/lib/relativeTime";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/contexts/ThemeContext";


function getIcon(type: string, color: string) {
    switch (type) {
        case 'LIKE':
            return <MaterialIcons name="favorite" size={18} color="#f91880" />;
        case 'REPLY':
        case 'MENTION':
            return <MaterialIcons name="chat-bubble-outline" size={18} color={color} />;
        case 'RETWEET':
            return <MaterialIcons name="repeat" size={18} color={color} />;
        case 'FOLLOW':
            return <MaterialIcons name="person-add" size={18} color={color} />;
        default:
            return <MaterialIcons name="notifications" size={18} color={color} />;
    }
}

export default function NotificationRow({
    item,
    onPress,
}: {
    item: INotificationItem;
    onPress: () => void;
}) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];
    const borderColor = isDark ? '#3d4146' : '#d8dde1';

    return (
        <TouchableOpacity
            style={[
                styles.notifRow,
                { borderBottomColor: borderColor },
                !item.isRead && { backgroundColor: colors.tint + '15' },
            ]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.notifIcon}>{getIcon(item.type, colors.icon)}</View>
            <View style={styles.notifBody}>
                <ThemedText style={styles.notifText}>
                    <ThemedText type="defaultSemiBold">@{item.actor}</ThemedText> {item.message}
                </ThemedText>
                <ThemedText style={[styles.notifTime, { color: colors.icon }]}>
                    {formatRelativeTime(item.createdAt)}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    notifRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    notifIcon: { width: 28, alignItems: 'center' },
    notifBody: { flex: 1 },
    notifText: { fontSize: 15 },
    notifTime: { fontSize: 13, marginTop: 2 },

});