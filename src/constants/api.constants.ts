export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  UPLOADS_URL: process.env.EXPO_PUBLIC_UPLOADS_URL || 'https://storage.googleapis.com/balerion/images',
  NOMINATIM_URL: process.env.EXPO_PUBLIC_NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  OSRM_URL: process.env.EXPO_PUBLIC_OSRM_URL || 'https://router.project-osrm.org',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh-token',
      GOOGLE_LOGIN: '/auth/google',
    },
    PLACE: {
      GET_ALL: '/places/get-all',
      GET_ONE: '/places/get-one',
      RANDOM: '/places/random',
    },
    USER: {
      UPDATE_PROFILE: '/users/update-profile',
    },
    PLAN: {
      GENERATE: '/mcp/generate-travel-plan',
      GET_ALL: '/plans/get-all',
      GET_ME: '/plans/get-me',
    },
    WALLET: {
      BALANCE: '/wallet/balance',
      PAY: '/wallet/pay',
      HISTORY: '/wallet/history',
      CHECKOUT: '/wallet/checkout',
      PAYOS_SUCCESS: '/wallet/payos-success',
      BUY_VIP: '/wallet/buy-vip',
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
};
