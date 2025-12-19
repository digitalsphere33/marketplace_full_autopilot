import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: true,
    proxy: {
      '/auth': 'http://127.0.0.1:3000',
      '/sellers': 'http://127.0.0.1:3000',
      '/listings': 'http://127.0.0.1:3000',
      '/checkout': 'http://127.0.0.1:3000',
      '/admin': 'http://127.0.0.1:3000',
      '/disputes': 'http://127.0.0.1:3000',
      '/recommendations': 'http://127.0.0.1:3000',
    }
  },
});
