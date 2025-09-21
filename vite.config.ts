import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  build: {
    outDir: './docs'
  },
  // For Telegram Mini Apps, keep root base so assets resolve correctly
  base: '/',
  server: {
    https: true
  }
});
