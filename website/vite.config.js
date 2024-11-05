import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,  // Optional: Adjust warning limit
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Flask backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
