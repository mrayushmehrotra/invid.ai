import Constants from 'expo-constants';

// API Configuration
export const API_CONFIG = {
    // Replace with your actual API URL
    BASE_URL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000',
    PYTHON_API_URL: Constants.expoConfig?.extra?.pythonApiUrl || 'http://localhost:8000',

    // API Endpoints
    ENDPOINTS: {
        // Auth
        AUTH: '/api/google',
        CHECK_SESSION: '/api/google',

        // YouTube
        GET_CHANNEL: '/api/google',
        UPDATE_VIDEO: '/api/google',

        // Metadata Generation (Python API)
        GENERATE_METADATA: '/generate/metadata',
        GENERATE_TITLES: '/generate/titles',
        GENERATE_DESCRIPTION: '/generate/description',
        GENERATE_HASHTAGS: '/generate/hashtags',
        GENERATE_TAGS: '/generate/tags',

        // TTS
        TTS: '/api/tts',
    },
};

// App configuration
export const APP_CONFIG = {
    APP_NAME: 'Invid.AI',
    APP_DESCRIPTION: 'AI-Powered YouTube Creator Suite',
    VERSION: '1.0.0',

    // Feature limits for free tier
    FREE_TIER_LIMITS: {
        metadataGenerations: 3,
        ttsGenerations: 1,
        videoUploads: 1,
        videoUpdates: 3,
        analyticsViews: 5,
        maxVideosStored: 5,
    },
};

// Storage keys for secure store
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'youtube_access_token',
    REFRESH_TOKEN: 'youtube_refresh_token',
    USER_ID: 'user_id',
    USER_DATA: 'user_data',
    THEME: 'theme_preference',
};
