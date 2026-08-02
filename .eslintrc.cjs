module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['@typescript-eslint', 'react-refresh'],
  ignorePatterns: [
    'build',
    'dist',
    'node_modules',
    'server',
    'design_handoff_finberry_redesign',
    'vite.config.ts',
    '*.config.js',
  ],
  rules: {
    // The existing codebase is any-heavy and has unused symbols throughout.
    // These are relaxed so lint surfaces real issues without failing on the
    // legacy mess; tighten them as pages are migrated (see roadmap).
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-empty': 'warn',
    'react-refresh/only-export-components': 'off',
  },
};
