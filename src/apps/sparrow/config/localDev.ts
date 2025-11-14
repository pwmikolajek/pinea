// Local development mode configuration
// When enabled, bypasses Firebase and uses mock data stored in localStorage

export const isLocalDevMode = import.meta.env.VITE_LOCAL_DEV_MODE === 'true';

export const LOCAL_STORAGE_KEYS = {
  AUTH_USER: 'sparrow_local_user',
  AUTH_TOKEN: 'sparrow_local_token',
  PDFS: 'sparrow_local_pdfs',
  COMMENTS: 'sparrow_local_comments',
  PROJECTS: 'sparrow_local_projects',
};
