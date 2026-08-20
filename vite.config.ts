import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Dev proxy — forwards /api/* to the Express backend
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts';
          if (id.includes('lucide-react'))   return 'vendor-icons';
          if (id.includes('react-router'))   return 'vendor-router';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
          if (id.includes('clsx') || id.includes('date-fns')) return 'vendor-utils';
        },
      },
    },
  },
});
