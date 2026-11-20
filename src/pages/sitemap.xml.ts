import type { APIRoute } from 'astro';
import { sections } from '../data/work';

// statički sitemap: naslovnica + galerije (404 namjerno nije unutra)
export const GET: APIRoute = ({ site }) => {
  const urls = ['/', ...sections.map((s) => `/${s.slug}/`)].map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
