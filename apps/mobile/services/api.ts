import axios from 'axios';
import { API_CONFIG } from '@/constants/Config';

// Create axios instances
export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const pythonApi = axios.create({
    baseURL: API_CONFIG.PYTHON_API_URL,
    timeout: 60000, // Longer timeout for AI generation
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth service
export const authService = {
    // Check session validity
    checkSession: async (userId: string, accessToken: string) => {
        const response = await api.post('/api/google', {
            action: 'checkSession',
            userId,
            accessToken,
        });
        return response.data;
    },

    // Get usage stats
    getUsage: async (userId: string) => {
        const response = await api.post('/api/google', {
            action: 'getUsage',
            userId,
        });
        return response.data;
    },
};

// YouTube service
export const youtubeService = {
    // Get channel data
    getChannelData: async (accessToken: string, userId: string) => {
        const response = await api.post('/api/google', {
            action: 'getChannelData',
            accessToken,
            userId,
        });
        return response.data;
    },

    // Update video metadata
    updateVideo: async (
        accessToken: string,
        userId: string,
        videoId: string,
        title: string,
        description: string,
        tags: string[]
    ) => {
        const response = await api.post('/api/google', {
            action: 'updateVideo',
            accessToken,
            userId,
            videoId,
            title,
            description,
            tags,
        });
        return response.data;
    },

    // Get analytics
    getAnalytics: async (accessToken: string, userId: string) => {
        const response = await api.post('/api/google', {
            action: 'getAnalytics',
            accessToken,
            userId,
        });
        return response.data;
    },
};

// Metadata generation service (Python API)
export const metadataService = {
    // Generate all metadata
    generateMetadata: async (
        videoTopic: string,
        targetAudience?: string,
        keywords?: string[]
    ) => {
        const response = await pythonApi.post('/generate/metadata', {
            video_topic: videoTopic,
            target_audience: targetAudience || 'beginners',
            keywords: keywords || [],
            use_ai: true,
        });
        return response.data;
    },

    // Generate only titles
    generateTitles: async (videoTopic: string, targetAudience?: string) => {
        const response = await pythonApi.post('/generate/titles', {
            video_topic: videoTopic,
            target_audience: targetAudience || 'beginners',
            use_ai: true,
        });
        return response.data;
    },

    // Generate only description
    generateDescription: async (videoTopic: string, targetAudience?: string) => {
        const response = await pythonApi.post('/generate/description', {
            video_topic: videoTopic,
            target_audience: targetAudience || 'beginners',
            use_ai: true,
        });
        return response.data;
    },

    // Generate hashtags
    generateHashtags: async (videoTopic: string) => {
        const response = await pythonApi.post('/generate/hashtags', {
            video_topic: videoTopic,
            use_ai: true,
        });
        return response.data;
    },

    // Generate tags
    generateTags: async (videoTopic: string) => {
        const response = await pythonApi.post('/generate/tags', {
            video_topic: videoTopic,
            use_ai: true,
        });
        return response.data;
    },
};

// TTS service
export const ttsService = {
    // Get available voices
    getVoices: async () => {
        const response = await api.get('/api/tts');
        return response.data;
    },

    // Generate TTS audio
    generateAudio: async (text: string, voiceId: string) => {
        const response = await api.post('/api/tts', {
            text,
            voiceId,
        });
        return response.data;
    },
};
