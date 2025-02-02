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
        target: 'http://13.239.34.210', // Flask backend URL for local dev
        changeOrigin: true,
        secure: false,  // If needed for local development with non-https
      },
    },
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
