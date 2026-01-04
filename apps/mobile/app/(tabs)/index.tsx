import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { youtubeService, authService } from '@/services/api';

interface ChannelData {
  snippet: {
    title: string;
    thumbnails: { default: { url: string } };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

interface Video {
  snippet: {
    resourceId: { videoId: string };
    title: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user, accessToken, isAuthenticated, usage, setUsage } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);

  const fetchData = async () => {
    if (!accessToken || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch channel data
      const channelData = await youtubeService.getChannelData(accessToken, user.id);
      if (channelData.success) {
        setChannel(channelData.channel);
        setVideos(channelData.recentVideos || []);
      }

      // Fetch usage stats
      const usageData = await authService.getUsage(user.id);
      if (usageData.success) {
        setUsage(usageData.usage);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatNumber = (num: string) => {
    const n = parseInt(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return num;
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authPrompt}>
          <Ionicons name="logo-youtube" size={80} color={colors.primary} />
          <Text style={[styles.authTitle, { color: colors.text }]}>
            Connect Your YouTube Channel
          </Text>
          <Text style={[styles.authDescription, { color: colors.textSecondary }]}>
            Sign in with Google to manage your videos and generate AI-powered metadata.
          </Text>
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/auth')}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.authButtonText}>Connect with Google</Text>
          </TouchableOpacity>
        </View>
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Channel Card */}
      {channel && (
        <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.channelHeader}>
            <Image
              source={{ uri: channel.snippet.thumbnails.default.url }}
              style={styles.channelAvatar}
            />
            <View style={styles.channelInfo}>
              <Text style={[styles.channelName, { color: colors.text }]}>
                {channel.snippet.title}
              </Text>
              <Text style={[styles.planBadge, { backgroundColor: colors.primary }]}>
                {user?.plan?.toUpperCase() || 'FREE'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(channel.statistics.subscriberCount)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Subscribers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(channel.statistics.videoCount)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Videos
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatNumber(channel.statistics.viewCount)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Views
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/generate')}
          >
            <Ionicons name="sparkles" size={28} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Generate</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>AI Metadata</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/tts')}
          >
            <Ionicons name="mic" size={28} color={colors.accent} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>TTS</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Voiceover</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/videos')}
          >
            <Ionicons name="videocam" size={28} color={colors.success} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Videos</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Usage Stats */}
      {usage && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Usage</Text>
          <View style={[styles.usageCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {Object.entries(usage).map(([key, value]) => (
              <View key={key} style={styles.usageItem}>
                <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.min((value.used / value.limit) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.usageValue, { color: colors.text }]}>
                  {value.used}/{value.limit === -1 ? '∞' : value.limit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Videos */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Videos</Text>
        {videos.slice(0, 5).map((video, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.videoItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Image
              source={{ uri: video.snippet.thumbnails?.medium?.url }}
              style={styles.videoThumbnail}
            />
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                {video.snippet.title}
              </Text>
              <View style={styles.videoStats}>
                <Text style={[styles.videoStat, { color: colors.textSecondary }]}>
                  <Ionicons name="eye" size={12} /> {formatNumber(video.statistics?.viewCount || '0')}
                </Text>
                <Text style={[styles.videoStat, { color: colors.textSecondary }]}>
                  <Ionicons name="heart" size={12} /> {formatNumber(video.statistics?.likeCount || '0')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  authTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: FontSizes.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  authButtonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  channelCard: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  channelAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
  },
  channelInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  channelName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.sm,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  actionDesc: {
    fontSize: FontSizes.xs,
  },
  usageCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  usageLabel: {
    flex: 1,
    fontSize: FontSizes.sm,
    textTransform: 'capitalize',
  },
  usageBar: {
    flex: 2,
    height: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  usageValue: {
    width: 50,
    textAlign: 'right',
    fontSize: FontSizes.sm,
  },
  videoItem: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  videoThumbnail: {
    width: 120,
    height: 68,
    borderRadius: BorderRadius.sm,
  },
  videoInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  videoTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  videoStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  videoStat: {
    fontSize: FontSizes.xs,
  },
});
