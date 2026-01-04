import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { API_CONFIG } from '@/constants/Config';
import { api } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];
    const { login } = useAuthStore();
    const params = useLocalSearchParams<{ code?: string }>();

    const [loading, setLoading] = useState(false);

    // Handle OAuth callback when code is present
    useEffect(() => {
        const code = params.code;
        if (code && !loading) {
            handleCodeExchange(code);
        }
    }, [params.code]);

    const handleCodeExchange = async (code: string) => {
        setLoading(true);
        try {
            const tokenResponse = await api.post('/api/google', {
                action: 'exchangeCode',
                code,
            });

            if (tokenResponse.data.success) {
                const { user, tokens } = tokenResponse.data;

                await login(user, tokens.access_token);
                if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }

                router.replace('/(tabs)');
            } else {
                throw new Error('Failed to authenticate');
            }
        } catch (error: any) {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            Alert.alert('Authentication Error', error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);

        try {
            // Get auth URL from backend
            const response = await api.get('/api/google?action=auth');
            const authUrl = response.data.authUrl;

            if (!authUrl) {
                throw new Error('Failed to get auth URL');
            }

            if (Platform.OS === 'web') {
                // On web, open a popup window for OAuth
                const width = 500;
                const height = 600;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const popup = window.open(
                    authUrl,
                    'Google Sign In',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Listen for the OAuth callback message from popup
                const handleMessage = async (event: MessageEvent) => {
                    if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.tokens) {
                        window.removeEventListener('message', handleMessage);

                        try {
                            const { access_token } = event.data.tokens;

                            // Get channel data to verify auth and get user info
                            const channelResponse = await api.post('/api/google', {
                                action: 'getChannelData',
                                accessToken: access_token,
                            });

                            if (channelResponse.data.success && channelResponse.data.channel) {
                                const channel = channelResponse.data.channel;

                                // Create user object from channel data
                                const user = {
                                    id: channel.id,
                                    name: channel.snippet?.title || 'YouTube User',
                                    image: channel.snippet?.thumbnails?.default?.url,
                                    youtubeChannelId: channel.id,
                                    youtubeChannelName: channel.snippet?.title,
                                    youtubeChannelImage: channel.snippet?.thumbnails?.default?.url,
                                };

                                await login(user, access_token);
                                router.replace('/(tabs)');
                            } else {
                                throw new Error('Failed to get channel data');
                            }
                        } catch (error: any) {
                            Alert.alert('Authentication Error', error.message || 'Failed to complete sign in');
                            setLoading(false);
                        }
                    }
                };

                window.addEventListener('message', handleMessage);

                // Check if popup was closed without completing auth
                const checkPopup = setInterval(() => {
                    if (popup?.closed) {
                        clearInterval(checkPopup);
                        window.removeEventListener('message', handleMessage);
                        setLoading(false);
                    }
                }, 500);

                return;
            }

            // On native, use WebBrowser for OAuth
            const redirectUrl = Linking.createURL('auth');

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                redirectUrl
            );

            if (result.type === 'success' && result.url) {
                // Extract code from callback URL
                const url = new URL(result.url);
                const code = url.searchParams.get('code');

                if (code) {
                    await handleCodeExchange(code);
                }
            } else if (result.type === 'cancel') {
                // User cancelled
                setLoading(false);
            }
        } catch (error: any) {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            Alert.alert('Authentication Error', error.message || 'Failed to sign in');
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>

            {/* Content */}
            <View style={styles.content}>
                {/* Logo */}
                <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="logo-youtube" size={48} color={colors.primary} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Connect YouTube
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Sign in with your Google account to manage your YouTube channel and generate AI-powered metadata.
                </Text>

                {/* Features */}
                <View style={styles.features}>
                    {[
                        { icon: 'sparkles', text: 'AI Metadata Generation' },
                        { icon: 'mic', text: '60+ AI Voices for TTS' },
                        { icon: 'analytics', text: 'Video Analytics' },
                        { icon: 'create', text: 'Direct Video Updates' },
                    ].map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <Ionicons name={feature.icon as any} size={20} color={colors.primary} />
                            <Text style={[styles.featureText, { color: colors.text }]}>
                                {feature.text}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Google Sign In Button */}
                <TouchableOpacity
                    style={[styles.googleButton, { backgroundColor: '#fff' }]}
                    onPress={handleGoogleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={24} color="#4285F4" />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}


                </TouchableOpacity>

                {/* Terms */}
                <Text style={[styles.terms, { color: colors.textSecondary }]}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        right: Spacing.md,
        zIndex: 1,
        padding: Spacing.sm,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSizes.md,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    features: {
        alignSelf: 'stretch',
        marginBottom: Spacing.xl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    featureText: {
        fontSize: FontSizes.md,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        width: '100%',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    googleButtonText: {
        color: '#000',
        fontSize: FontSizes.md,
        fontWeight: '600',
    },
    terms: {
        fontSize: FontSizes.xs,
        textAlign: 'center',
        marginTop: Spacing.lg,
        lineHeight: 18,
    },
});
