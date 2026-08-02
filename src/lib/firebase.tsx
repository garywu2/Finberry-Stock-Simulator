import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig } from "../config";

// Initialize Firebase Auth. When the config is missing or invalid (e.g. no .env
// in a fresh clone), getAuth throws synchronously at module load — which used to
// white-screen the entire app with no message. Guard it so the UI still renders;
// auth actions simply won't work until REACT_APP_FINBERRY_* is configured.
let authInstance: Auth | undefined;
try {
  const firebase = initializeApp(firebaseConfig);
  authInstance = getAuth(firebase);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error(
    "Firebase failed to initialize — check REACT_APP_FINBERRY_* in your .env. Auth is disabled.",
    err
  );
}

// Typed as Auth for consumers; may be undefined at runtime when unconfigured.
// Auth-dependent code paths (useAuthListener, the API token interceptor, login)
// guard against that.
export const auth = authInstance as Auth;
