import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { metadataService } from '@/services/api';

interface GeneratedMetadata {
    titles: string[];
    description: string;
    hashtags: string[];
    tags: string[];
    generated_by: string;
}

export default function GenerateScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const { isAuthenticated } = useAuthStore();

    const [topic, setTopic] = useState('');
    const [audience, setAudience] = useState('beginners');
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GeneratedMetadata | null>(null);
    const [selectedTitle, setSelectedTitle] = useState<number>(0);

    const audiences = ['beginners', 'intermediate', 'advanced', 'professionals'];

    const handleGenerate = async () => {
        if (!topic.trim()) {
            Alert.alert('Error', 'Please enter a video topic');
            return;
        }

        setLoading(true);
        try {
            const keywordsList = keywords.split(',').map(k => k.trim()).filter(k => k);
            const data = await metadataService.generateMetadata(topic, audience, keywordsList);
            setResult(data);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to generate metadata');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert('Copied!', `${label} copied to clipboard`);
    };

    const copyAll = async () => {
        if (!result) return;

        const allContent = `
Title: ${result.titles[selectedTitle]}

Description:
${result.description}

Tags: ${result.tags.join(', ')}

Hashtags: ${result.hashtags.join(' ')}
    `.trim();

        await Clipboard.setStringAsync(allContent);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied!', 'All metadata copied to clipboard');
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            keyboardShouldPersistTaps="handled"
        >
            {/* Input Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    <Ionicons name="sparkles" size={20} color={colors.primary} /> Generate Metadata
                </Text>

                <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Video Topic *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                        placeholder="e.g., React.js Tutorial for Beginners"
                        placeholderTextColor={colors.textSecondary}
                        value={topic}
                        onChangeText={setTopic}
                    />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Target Audience</Text>
                    <View style={styles.audienceRow}>
                        {audiences.map((aud) => (
                            <TouchableOpacity
                                key={aud}
                                style={[
                                    styles.audienceChip,
                                    {
                                        backgroundColor: audience === aud ? colors.primary : colors.backgroundSecondary,
                                    },
                                ]}
                                onPress={() => setAudience(aud)}
                            >
                                <Text
                                    style={[
                                        styles.audienceChipText,
                                        { color: audience === aud ? '#fff' : colors.text },
                                    ]}
                                >
                                    {aud}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Keywords (comma separated)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
                        placeholder="e.g., react, javascript, web development"
                        placeholderTextColor={colors.textSecondary}
                        value={keywords}
                        onChangeText={setKeywords}
                    />

                    <TouchableOpacity
                        style={[styles.generateButton, { backgroundColor: colors.primary }]}
                        onPress={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="#fff" />
                                <Text style={styles.generateButtonText}>Generate with AI</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results Section */}
            {result && (
                <View style={styles.section}>
                    <View style={styles.resultHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} /> Generated Results
                        </Text>
                        <TouchableOpacity onPress={copyAll} style={styles.copyAllButton}>
                            <Ionicons name="copy" size={16} color={colors.primary} />
                            <Text style={[styles.copyAllText, { color: colors.primary }]}>Copy All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* AI Badge */}
                    <View style={[styles.aiBadge, { backgroundColor: colors.card }]}>
                        <Ionicons name="sparkles" size={14} color={colors.primary} />
                        <Text style={[styles.aiBadgeText, { color: colors.textSecondary }]}>
                            Generated by: {result.generated_by.toUpperCase()}
                        </Text>
                    </View>

                    {/* Titles */}
                    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.resultCardHeader}>
                            <Text style={[styles.resultLabel, { color: colors.text }]}>📝 Titles</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(result.titles[selectedTitle], 'Title')}>
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        {result.titles.map((title, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.titleOption,
                                    {
                                        backgroundColor: selectedTitle === index ? colors.primary + '20' : 'transparent',
                                        borderColor: selectedTitle === index ? colors.primary : colors.cardBorder,
                                    },
                                ]}
                                onPress={() => setSelectedTitle(index)}
                            >
                                <Ionicons
                                    name={selectedTitle === index ? 'radio-button-on' : 'radio-button-off'}
                                    size={18}
                                    color={selectedTitle === index ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[styles.titleText, { color: colors.text }]}>{title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.resultCardHeader}>
                            <Text style={[styles.resultLabel, { color: colors.text }]}>📄 Description</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(result.description, 'Description')}>
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.descriptionText, { color: colors.textSecondary }]} numberOfLines={10}>
                            {result.description}
                        </Text>
                    </View>

                    {/* Hashtags */}
                    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.resultCardHeader}>
                            <Text style={[styles.resultLabel, { color: colors.text }]}># Hashtags</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(result.hashtags.join(' '), 'Hashtags')}>
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagsContainer}>
                            {result.hashtags.map((tag, index) => (
                                <View key={index} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.resultCardHeader}>
                            <Text style={[styles.resultLabel, { color: colors.text }]}>🏷️ Tags</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(result.tags.join(', '), 'Tags')}>
                                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.tagsContainer}>
                            {result.tags.slice(0, 15).map((tag, index) => (
                                <View key={index} style={[styles.tag, { backgroundColor: colors.accent + '20' }]}>
                                    <Text style={[styles.tagText, { color: colors.accent }]}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    inputCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
        marginTop: Spacing.sm,
    },
    input: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        fontSize: FontSizes.md,
    },
    audienceRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    audienceChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    audienceChipText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.lg,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    copyAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyAllText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.md,
    },
    aiBadgeText: {
        fontSize: FontSizes.xs,
    },
    resultCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.md,
    },
    resultCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    resultLabel: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    titleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        marginBottom: Spacing.xs,
    },
    titleText: {
        flex: 1,
        fontSize: FontSizes.sm,
    },
    descriptionText: {
        fontSize: FontSizes.sm,
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    tag: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    tagText: {
        fontSize: FontSizes.xs,
        fontWeight: '500',
    },
});
