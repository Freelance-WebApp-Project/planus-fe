export const APP_CONFIG = {
  API: {
    BASE_URL: 'https://api-planus.fpt-exe.shop/api',
    UPLOADS_URL: 'https://storage.googleapis.com/balerion/images',
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    OSRM_URL: 'https://router.project-osrm.org',
  },
  TIMEOUT: 10000, // 10 seconds
} as const;
