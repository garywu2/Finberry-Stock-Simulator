import axios from 'axios';
import { auth } from '@/lib/firebase';

// Single source of truth for the API base URL, replacing the ternary that was
// copy-pasted into ~10 page files. Prefer REACT_APP_API_URL; otherwise fall back
// to the historical dev/prod switch so existing environments keep working.
const baseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/');

const api = axios.create({ baseURL });

// Attach the Firebase ID token so the server can verify the caller's identity
// instead of trusting an email in the URL. Server-side verification lands in
// Phase 3; until then this header is harmless. Requests proceed unauthenticated
// when no user is signed in.
api.interceptors.request.use(async (config) => {
  const current = auth?.currentUser;
  if (current) {
    try {
      const token = await current.getIdToken();
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token retrieval failed; send the request without an auth header.
    }
  }
  return config;
});

export default api;
