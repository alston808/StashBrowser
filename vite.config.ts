
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import { vitePluginGraphqlLoader } from 'vite-plugin-graphql-loader';
  import path from 'path';

  export default defineConfig({
    plugins: [react(), vitePluginGraphqlLoader()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-apollo': ['@apollo/client', 'graphql'],
            'vendor-radix': [
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-slot'
            ],
            'vendor-icons': ['lucide-react']
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/graphql': {
          target: 'https://x.alst.site',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  });