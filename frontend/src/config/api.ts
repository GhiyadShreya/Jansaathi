/**
 * Single source of truth for the backend URL.
 *
 * VITE_API_URL should be the backend ORIGIN, e.g. https://jansaathi-api.onrender.com
 * A trailing "/api" or "/" is tolerated and stripped, so both
 * "https://host" and "https://host/api" work.
 */
const RAW = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export const API_ORIGIN = RAW.trim().replace(/\/+$/, '').replace(/\/api$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;
