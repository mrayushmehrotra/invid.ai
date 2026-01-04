import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { APP_CONFIG } from '@/constants/Config';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const { user, isAuthenticated, logout, usage } = useAuthStore();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to disconnect your YouTube account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    },
                },
            ]
        );
    };

    const handleUpgrade = () => {
        Alert.alert(
            'Upgrade to Pro',
            'Get unlimited AI generations, TTS, and more!\n\nPro features:\n• 50 metadata generations/day\n• 30 TTS generations/day\n• 10 video uploads/day\n• Priority support',
            [
                { text: 'Maybe Later', style: 'cancel' },
                { text: 'Learn More', onPress: () => Linking.openURL('https://invid.ai/pricing') },
            ]
        );
    };

    const menuItems = [
        {
            icon: 'sparkles',
            label: 'Usage Statistics',
            description: 'View your daily usage',
            onPress: () => { },
            showChevron: true,
        },
        {
            icon: 'diamond',
            label: 'Upgrade to Pro',
            description: 'Unlock unlimited features',
            onPress: handleUpgrade,
            showChevron: true,
            accent: true,
        },
        {
            icon: 'notifications-outline',
            label: 'Notifications',
            description: 'Manage notification settings',
            onPress: () => { },
            showChevron: true,
        },
        {
            icon: 'help-circle-outline',
            label: 'Help & Support',
            description: 'Get help with the app',
            onPress: () => Linking.openURL('https://invid.ai/support'),
            showChevron: true,
        },
        {
            icon: 'document-text-outline',
            label: 'Privacy Policy',
            description: 'Read our privacy policy',
            onPress: () => Linking.openURL('https://invid.ai/privacy'),
            showChevron: true,
        },
        {
            icon: 'information-circle-outline',
            label: 'About',
            description: `Version ${APP_CONFIG.VERSION}`,
            onPress: () => { },
            showChevron: false,
        },
    ];

    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.authPrompt}>
                    <Ionicons name="person-circle" size={80} color={colors.textSecondary} />
                    <Text style={[styles.authTitle, { color: colors.text }]}>
                        Not Connected
                    </Text>
                    <Text style={[styles.authDescription, { color: colors.textSecondary }]}>
                        Connect your YouTube account to access all features
                    </Text>
                    <TouchableOpacity
                        style={[styles.connectButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/auth')}
                    >
                        <Ionicons name="logo-google" size={20} color="#fff" />
                        <Text style={styles.connectButtonText}>Connect with Google</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Profile Header */}
            <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Image
                    source={{ uri: user?.image || user?.youtubeChannelImage || 'https://via.placeholder.com/80' }}
                    style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>
                        {user?.name || user?.youtubeChannelName || 'User'}
                    </Text>
                    <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                        {user?.email}
                    </Text>
                    <View style={[styles.planBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="diamond" size={12} color="#fff" />
                        <Text style={styles.planText}>{user?.plan?.toUpperCase() || 'FREE'}</Text>
                    </View>
                </View>
            </View>

            {/* Usage Summary */}
            {usage && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Usage</Text>
                    <View style={[styles.usageCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.usageRow}>
                            <View style={styles.usageItem}>
                                <Ionicons name="sparkles" size={20} color={colors.primary} />
                                <Text style={[styles.usageValue, { color: colors.text }]}>
                                    {usage.metadataGenerations?.used || 0}/{usage.metadataGenerations?.limit || 3}
                                </Text>
                                <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>AI Gen</Text>
                            </View>
                            <View style={styles.usageItem}>
                                <Ionicons name="mic" size={20} color={colors.accent} />
                                <Text style={[styles.usageValue, { color: colors.text }]}>
                                    {usage.ttsGenerations?.used || 0}/{usage.ttsGenerations?.limit || 1}
                                </Text>
                                <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>TTS</Text>
                            </View>
                            <View style={styles.usageItem}>
                                <Ionicons name="create" size={20} color={colors.success} />
                                <Text style={[styles.usageValue, { color: colors.text }]}>
                                    {usage.videoUpdates?.used || 0}/{usage.videoUpdates?.limit || 3}
                                </Text>
                                <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Updates</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Channel Info */}
            {user?.youtubeChannelName && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Channel</Text>
                    <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                        <View style={styles.channelInfo}>
                            <Text style={[styles.channelName, { color: colors.text }]}>
                                {user.youtubeChannelName}
                            </Text>
                            <Text style={[styles.channelId, { color: colors.textSecondary }]}>
                                {user.youtubeChannelId}
                            </Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    </View>
                </View>
            )}

            {/* Menu Items */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        onPress={item.onPress}
                    >
                        <View style={[styles.menuIcon, { backgroundColor: item.accent ? colors.primary + '20' : colors.backgroundSecondary }]}>
                            <Ionicons
                                name={item.icon as any}
                                size={20}
                                color={item.accent ? colors.primary : colors.textSecondary}
                            />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                            <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                                {item.description}
                            </Text>
                        </View>
                        {item.showChevron && (
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Disconnect Account</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    authDescription: {
        fontSize: FontSizes.md,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xl,
    },
    connectButtonText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.full,
    },
    profileInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    profileName: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    profileEmail: {
        fontSize: FontSizes.sm,
        marginTop: 2,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
        marginTop: Spacing.sm,
    },
    planText: {
        color: '#fff',
        fontSize: FontSizes.xs,
        fontWeight: '600',
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
    usageCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    usageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    usageItem: {
        alignItems: 'center',
        gap: 4,
    },
    usageValue: {
        fontSize: FontSizes.lg,
        fontWeight: '700',
    },
    usageLabel: {
        fontSize: FontSizes.xs,
    },
    channelCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.md,
    },
    channelInfo: {
        flex: 1,
    },
    channelName: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    channelId: {
        fontSize: FontSizes.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.sm,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    menuLabel: {
        fontSize: FontSizes.md,
        fontWeight: '500',
    },
    menuDescription: {
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
    },
    logoutText: {
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
});
