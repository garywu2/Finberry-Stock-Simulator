import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// CRA compatibility: the app reads Firebase config and the API-base flag from
// `process.env.REACT_APP_*`. Vite normally only exposes `import.meta.env`, so we
// load the REACT_APP_-prefixed vars and define `process.env` for the client bundle.
// This keeps all existing `process.env.REACT_APP_*` reads working unchanged.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
    build: {
      // Match CRA's output directory so existing deploy config keeps working.
      outDir: 'build',
    },
    define: {
      'process.env': JSON.stringify({ ...env, NODE_ENV: mode }),
    },
  };
});
