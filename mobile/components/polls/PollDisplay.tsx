import { ITweet } from "@/types/tweet";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";

export default function PollDisplay({
    poll,
    onVote,
}: {
    poll: NonNullable<ITweet['poll']>;
    onVote: (optionId: number) => void;
}) {
    const { colorScheme, isDark } = useTheme();
    const colors = Colors[colorScheme];

    const textColor = colors.text;
    const mutedColor = colors.icon;
    const borderColor = isDark ? '#2f3336' : '#eff3f4';
    const optionBg = colors.background;
    const barColor = '#1d9bf0';

    const ended = poll.isClosed || new Date(poll.endsAt) <= new Date();
    const hasVoted = poll.selectedOptionId != null;
    const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
    const canVote = !ended && !hasVoted;

    return (
        <View style={[pollStyles.container, { borderColor }]}>
            {poll.options.map((option) => {
                const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isSelected = option.id === poll.selectedOptionId;

                return (
                    <TouchableOpacity
                        key={option.id}
                        disabled={!canVote}
                        onPress={(e) => { e.stopPropagation?.(); onVote(option.id); }}
                        style={[
                            pollStyles.option,
                            {
                                backgroundColor: isSelected
                                    ? isDark ? '#1a2a3a' : '#e8f5fe'
                                    : optionBg,
                                borderColor
                            },
                        ]}
                        activeOpacity={canVote ? 0.7 : 1}
                    >
                        {(hasVoted || ended) && (
                            <View
                                style={[
                                    pollStyles.bar,
                                    {
                                        width: `${pct}%` as any,
                                        backgroundColor: isSelected
                                            ? `${barColor}30`
                                            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                    },
                                ]}
                            />
                        )}
                        <View style={pollStyles.optionContent}>
                            <Text style={[pollStyles.optionLabel, { color: textColor, fontWeight: isSelected ? '700' : '400' }]}>
                                {option.label}
                            </Text>
                            {(hasVoted || ended) && (
                                <Text style={[pollStyles.optionPct, { color: isSelected ? '#1d9bf0' : mutedColor }]}>
                                    {pct.toFixed(0)}%
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}

            <View style={[pollStyles.footer, { backgroundColor: colors.background, borderTopColor: borderColor }]}>
                <Text style={[pollStyles.footerText, { color: mutedColor }]}>
                    {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? 's' : ''}
                </Text>
                <Text style={[pollStyles.footerText, { color: mutedColor }]}>·</Text>
                <Text style={[pollStyles.footerText, { color: ended ? '#f91880' : mutedColor }]}>
                    {ended ? 'Final results' : `Ends ${new Date(poll.endsAt).toLocaleDateString()}`}
                </Text>
            </View>
        </View>
    );
}

const pollStyles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        marginBottom: 10,
        marginTop: 8,
    },
    option: {
        minHeight: 44,
        borderBottomWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    bar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    optionLabel: {
        fontSize: 15,
        flex: 1,
    },
    optionPct: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerText: {
        fontSize: 13,
    },
});