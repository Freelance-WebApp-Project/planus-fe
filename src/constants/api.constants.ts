import { APP_CONFIG } from '../config/app.config';

export const API_CONFIG = {
  BASE_URL: APP_CONFIG.API.BASE_URL,
  UPLOADS_URL: APP_CONFIG.API.UPLOADS_URL,
  NOMINATIM_URL: APP_CONFIG.API.NOMINATIM_URL,
  OSRM_URL: APP_CONFIG.API.OSRM_URL,
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
      CREATE_WITH_PAYMENT: '/plans/create-with-payment',
      FAVORITE: '/plans/favorite',
      UNFAVORITE: '/plans/unfavorite',
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
  TIMEOUT: APP_CONFIG.TIMEOUT,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
};
