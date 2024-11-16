export const CONFIG = {
    API_URL: process.env.NEXT_PUBLIC_DEVELOPING_API === 'true'
        ? 'http://localhost:3000'
        : 'https://gamex.benjyross.xyz',
    API_VERSION: 'v1',
    ENDPOINTS: {
        PLAYER_DATA: '/api/player-data',
        USER_ID: '/api/user'
    },
    DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE === 'true'
};