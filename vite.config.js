import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep every logo a file of its own. Vite inlines assets under 4 kB as
    // base64 in the JS bundle, which would put the small marks — light and
    // dark alike — in front of every visitor before <picture> ever gets to
    // pick one, and out of reach of loading="lazy".
    assetsInlineLimit: 0,
  },
});
