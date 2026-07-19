import { defineConfig } from 'vitest/config';

// The mobile app is an Expo/React Native project; only its pure, dependency-free
// lib helpers (e.g. src/lib/theme.ts) are unit-tested here. Component tests would
// need jest-expo and are intentionally out of scope. Scoping `include` to src/lib
// keeps Vitest (Node environment) away from any React Native imports.
export default defineConfig({
  test: {
    include: ['src/lib/**/*.test.ts'],
    environment: 'node',
  },
});
