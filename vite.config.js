import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    // Vite preview blocks non-local hostnames by default; Caddy forwards the real Host header.
    allowedHosts: ['davidbingmann.de'],
  },
});
