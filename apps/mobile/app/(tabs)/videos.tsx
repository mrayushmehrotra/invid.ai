import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { youtubeService } from '@/services/api';

interface Video {
    snippet: {
        resourceId: { videoId: string };
        title: string;
        description: string;
        thumbnails: { medium: { url: string } };
        publishedAt: string;
    };
    statistics?: {
        viewCount: string;
        likeCount: string;
        commentCount: string;
    };
    contentDetails?: {
        duration: string;
    };
}

export default function VideosScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const { user, accessToken, isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchVideos = async () => {
        if (!accessToken || !user?.id) {
            setLoading(false);
            return;
        }

        try {
            const data = await youtubeService.getChannelData(accessToken, user.id);
            if (data.success) {
                setVideos(data.recentVideos || []);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [accessToken, user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchVideos();
    };

    const formatNumber = (num: string) => {
        const n = parseInt(num || '0');
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return num || '0';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const openEditModal = (video: Video) => {
        setSelectedVideo(video);
        setEditTitle(video.snippet.title);
        setEditDescription(video.snippet.description || '');
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedVideo || !accessToken || !user?.id) return;

        setSaving(true);
        try {
            const videoId = selectedVideo.snippet.resourceId.videoId;
            const result = await youtubeService.updateVideo(
                accessToken,
                user.id,
                videoId,
                editTitle,
                editDescription,
                []
            );

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Video updated successfully!');
                setEditModalVisible(false);
                fetchVideos();
            } else {
                throw new Error(result.error || 'Failed to update');
            }
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message || 'Failed to update video');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Ionicons name="videocam-off" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Connect your YouTube account to see videos
                </Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Your Videos ({videos.length})
                    </Text>
                </View>

                {videos.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="videocam-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No videos found
                        </Text>
                    </View>
                ) : (
                    videos.map((video, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                            onPress={() => openEditModal(video)}
                        >
                            <Image
                                source={{ uri: video.snippet.thumbnails?.medium?.url }}
                                style={styles.thumbnail}
                            />
                            <View style={styles.videoDetails}>
                                <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                                    {video.snippet.title}
                                </Text>
                                <Text style={[styles.videoDate, { color: colors.textSecondary }]}>
                                    {formatDate(video.snippet.publishedAt)}
                                </Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                            {formatNumber(video.statistics?.viewCount || '0')}
                                        </Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                            {formatNumber(video.statistics?.likeCount || '0')}
                                        </Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.statText, { color: colors.textSecondary }]}>
                                            {formatNumber(video.statistics?.commentCount || '0')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    ))
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Text style={[styles.cancelButton, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Video</Text>
                        <TouchableOpacity onPress={handleSaveEdit} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {selectedVideo && (
                            <Image
                                source={{ uri: selectedVideo.snippet.thumbnails?.medium?.url }}
                                style={styles.modalThumbnail}
                            />
                        )}

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            placeholder="Video title"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Video description"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top"
                        />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: FontSizes.md,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    videoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    thumbnail: {
        width: 120,
        height: 68,
        borderRadius: BorderRadius.md,
    },
    videoDetails: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    videoTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        marginBottom: 4,
    },
    videoDate: {
        fontSize: FontSizes.xs,
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: FontSizes.xs,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
    },
    cancelButton: {
        fontSize: FontSizes.md,
    },
    saveButton: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: Spacing.md,
    },
    modalThumbnail: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
    },
    input: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        fontSize: FontSizes.md,
    },
    textArea: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        fontSize: FontSizes.md,
        minHeight: 200,
    },
});
