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
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'validation/index': resolve(__dirname, 'src/validation/index.ts'),
        'docker/index': resolve(__dirname, 'src/docker/index.ts'),
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
      external: ['express', 'mongoose', 'fs', 'path', 'child_process', 'http', 'https', 'url'],
      output: {
        globals: {
          express: 'express',
          mongoose: 'mongoose',
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

