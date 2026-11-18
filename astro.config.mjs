// @ts-check
import { defineConfig } from 'astro/config';

// Statička stranica za Cloudflare Pages (build: `npm run build`, output: `dist`).
export default defineConfig({
  site: 'https://kroart.media',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
