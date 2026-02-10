import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
    }),
  ],
  build: {
    target: 'node18',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'database/index': resolve(__dirname, 'src/database/index.ts'),
        'validation/index': resolve(__dirname, 'src/validation/index.ts'),
        'docker/index': resolve(__dirname, 'src/docker/index.ts'),
        'middleware/index': resolve(__dirname, 'src/middleware/index.ts'),
        'websocket/index': resolve(__dirname, 'src/websocket/index.ts'),
        'scheduler/index': resolve(__dirname, 'src/scheduler/index.ts'),
        'cache/index': resolve(__dirname, 'src/cache/index.ts'),
        'auth/index': resolve(__dirname, 'src/auth/index.ts'),
        'cli/index': resolve(__dirname, 'src/cli/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'es.js' : 'cjs.js';
        if (entryName === 'index') {
          return `index.${ext}`;
        }
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      external: [
        // Node.js built-ins
        'events',
        'fs',
        'fs/promises',
        'path',
        'child_process',
        'http',
        'https',
        'url',
        'util',
        'os',
        'net',
        'tls',
        'dns',
        'stream',
        'crypto',
        'zlib',
        'timers',
        'timers/promises',
        'process',
        // External dependencies
        'express',
        'mongoose',
        'mongodb',
        'ws',
        'ioredis',
        'check-disk-space',
      ],
      output: {
        globals: {
          express: 'express',
          mongoose: 'mongoose',
          mongodb: 'mongodb',
          ws: 'ws',
          ioredis: 'ioredis',
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, 'src/types'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@core': resolve(__dirname, 'src/core'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
