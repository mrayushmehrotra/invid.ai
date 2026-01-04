import React, { useState, useEffect } from 'react';
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
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ttsService } from '@/services/api';

// Voice categories and data (from web app)
const VOICE_CATEGORIES = [
    {
        name: 'English (US)',
        icon: '🇺🇸',
        voices: [
            { id: 'en-US-1', name: 'Matthew', gender: 'Male', style: 'Professional' },
            { id: 'en-US-2', name: 'Joanna', gender: 'Female', style: 'Friendly' },
            { id: 'en-US-3', name: 'Brian', gender: 'Male', style: 'Deep' },
            { id: 'en-US-4', name: 'Emma', gender: 'Female', style: 'Warm' },
        ],
    },
    {
        name: 'English (UK)',
        icon: '🇬🇧',
        voices: [
            { id: 'en-GB-1', name: 'Arthur', gender: 'Male', style: 'Distinguished' },
            { id: 'en-GB-2', name: 'Amy', gender: 'Female', style: 'Elegant' },
        ],
    },
    {
        name: 'Hindi',
        icon: '🇮🇳',
        voices: [
            { id: 'hi-IN-1', name: 'Aditi', gender: 'Female', style: 'Native' },
            { id: 'hi-IN-2', name: 'Raj', gender: 'Male', style: 'Professional' },
        ],
    },
    {
        name: 'Spanish',
        icon: '🇪🇸',
        voices: [
            { id: 'es-ES-1', name: 'Lucia', gender: 'Female', style: 'Expressive' },
            { id: 'es-ES-2', name: 'Diego', gender: 'Male', style: 'Natural' },
        ],
    },
];

export default function TTSScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(VOICE_CATEGORIES[0].voices[0]);
    const [selectedCategory, setSelectedCategory] = useState(VOICE_CATEGORIES[0]);
    const [loading, setLoading] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);

    useEffect(() => {
        // Configure audio
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });

        return () => {
            // Cleanup sound on unmount
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const handleGenerate = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter text to convert to speech');
            return;
        }

        if (text.length > 1000) {
            Alert.alert('Error', 'Text must be under 1000 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await ttsService.generateAudio(text, selectedVoice.id);

            if (response.audioUrl) {
                // Download audio file
                const fileUri = FileSystem.cacheDirectory + 'tts_audio.mp3';
                await FileSystem.downloadAsync(response.audioUrl, fileUri);
                setAudioUri(fileUri);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Audio generated successfully!');
            } else {
                throw new Error('No audio URL received');
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message || 'Failed to generate audio');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPause = async () => {
        if (!audioUri) return;

        try {
            if (isPlaying && sound) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                if (sound) {
                    await sound.playAsync();
                } else {
                    const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: audioUri },
                        { shouldPlay: true }
                    );
                    setSound(newSound);

                    newSound.setOnPlaybackStatusUpdate((status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            setIsPlaying(false);
                        }
                    });
                }
                setIsPlaying(true);
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.error('Playback error:', error);
        }
    };

    const handleStop = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.setPositionAsync(0);
            setIsPlaying(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Ionicons name="mic" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Text to Speech
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Convert your text into natural-sounding voiceovers
                </Text>
            </View>

            {/* Voice Selection */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Select Voice
                </Text>

                {/* Category Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
                    {VOICE_CATEGORIES.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryTab,
                                {
                                    backgroundColor: selectedCategory.name === category.name
                                        ? colors.primary
                                        : colors.card,
                                    borderColor: colors.cardBorder,
                                },
                            ]}
                            onPress={() => {
                                setSelectedCategory(category);
                                setSelectedVoice(category.voices[0]);
                            }}
                        >
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: selectedCategory.name === category.name ? '#fff' : colors.text },
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Voice Options */}
                <View style={styles.voicesGrid}>
                    {selectedCategory.voices.map((voice, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.voiceCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: selectedVoice.id === voice.id ? colors.primary : colors.cardBorder,
                                    borderWidth: selectedVoice.id === voice.id ? 2 : 1,
                                },
                            ]}
                            onPress={() => setSelectedVoice(voice)}
                        >
                            <Ionicons
                                name={voice.gender === 'Male' ? 'man' : 'woman'}
                                size={24}
                                color={selectedVoice.id === voice.id ? colors.primary : colors.textSecondary}
                            />
                            <Text style={[styles.voiceName, { color: colors.text }]}>{voice.name}</Text>
                            <Text style={[styles.voiceStyle, { color: colors.textSecondary }]}>{voice.style}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Text Input */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Enter Text
                </Text>
                <View style={[styles.textInputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder="Type or paste your text here..."
                        placeholderTextColor={colors.textSecondary}
                        value={text}
                        onChangeText={setText}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        maxLength={1000}
                    />
                    <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                        {text.length}/1000
                    </Text>
                </View>
            </View>

            {/* Generate Button */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: colors.primary }]}
                    onPress={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="volume-high" size={20} color="#fff" />
                            <Text style={styles.generateButtonText}>Generate Audio</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Audio Player */}
            {audioUri && (
                <View style={styles.section}>
                    <View style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.playerTitle, { color: colors.text }]}>
                            Generated Audio
                        </Text>
                        <View style={styles.playerControls}>
                            <TouchableOpacity
                                style={[styles.playerButton, { backgroundColor: colors.primary }]}
                                onPress={handlePlayPause}
                            >
                                <Ionicons
                                    name={isPlaying ? 'pause' : 'play'}
                                    size={28}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.playerButtonSmall, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={handleStop}
                            >
                                <Ionicons name="stop" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.voiceInfo, { color: colors.textSecondary }]}>
                            Voice: {selectedVoice.name} ({selectedVoice.style})
                        </Text>
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
    header: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: FontSizes.sm,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    categoryRow: {
        marginBottom: Spacing.md,
    },
    categoryTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        marginRight: Spacing.sm,
    },
    categoryIcon: {
        fontSize: 16,
    },
    categoryText: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
    },
    voicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    voiceCard: {
        width: '48%',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    voiceName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },
    voiceStyle: {
        fontSize: FontSizes.xs,
    },
    textInputContainer: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
    },
    textInput: {
        fontSize: FontSizes.md,
        minHeight: 120,
    },
    charCount: {
        fontSize: FontSizes.xs,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    playerCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    playerTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    playerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    playerButton: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerButtonSmall: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceInfo: {
        fontSize: FontSizes.sm,
    },
});
