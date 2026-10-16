import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  server: { port: Number(process.env.APP_PORT || 3005), host: '0.0.0.0' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/apiHelper.ts',
        'src/lib/toolsHelper.ts',
        'src/features/auth/api/authApi.ts',
        'src/features/users/api/usersApi.ts',
        'src/features/courses/api/courseApi.ts'
      ],
      exclude: ['**/*.test.ts'],
      reporter: ['text', 'html'],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 }
    }
  }
});
