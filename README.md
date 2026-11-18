# kroart.media

Portfolio site for KroArt Media, a multimedia agency from Osijek. Static Astro site, hosted on Cloudflare Pages. Site language: Croatian.

## Stack

- Astro 6 (static output, `<ClientRouter />` for page transitions, `astro:assets` for image optimization)
- GSAP for the hero intro and the lightbox
- Archivo variable font (self-hosted via Fontsource, width + weight axes)

## Develop

```bash
npm install
npm run dev
```

## Media

Original files live in `raw/` (not committed, ~1 GB). `npm run media` converts them:

- photos → 2400 px JPEG in `src/assets/photos/` (Astro then outputs AVIF/WebP in several widths)
- visuals → JPEG in `src/assets/visuals/`
- videos → H.264 1080×1920 MP4 + 6 s muted preview in `public/videos/`, poster in `src/assets/posters/`

Client tiles for the carousel: `python scripts/prepare-logos.py` (needs Pillow + numpy). It builds every tile the same way (pure black square, white logo, creator portraits in black-and-white) from the logo pack in `raw/clients-new/` (all black-and-white, no glow).

Videos are capped at 4.5 Mbit/s so every file stays under Cloudflare Pages' 25 MiB per-file limit.
To add work: put the file in `raw/`, run `npm run media`, then add an entry with alt text in `src/data/work.ts`.

## Deploy (Cloudflare Pages)

- Framework preset: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `NODE_VERSION=22`, and optionally `PUBLIC_WEB3FORMS_KEY` (free key from web3forms.com) to show the contact form. Without the key the page shows email and Instagram only.
