import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        secure: false,
      },
    },
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'editor-vendor';
            }
            if (id.includes('@splinetool') || id.includes('react-spline')) {
              return 'spline-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('reactflow') || id.includes('xyflow')) {
              return 'flow-vendor';
            }
            if (id.includes('react-circular-progressbar')) {
              return 'charts-vendor';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('redux') || id.includes('@reduxjs')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
