# Handoff: kroart.media redesign (stanje 2026-11-18, 16:20)

Za sljedeću sesiju (Claude ili čovjek). Stranica je na hrvatskom; ovaj dokument i README su za developera.

## Pokretanje
```bash
cd C:\Users\mateo\Desktop\kroart-media
npm run dev          # http://localhost:4321
npm run build        # provjera; dist/ ~108 MB (videi 36 MB)
npx astro preview --port 4322   # brži pregled slika nego dev (dev sporo radi AVIF)
```
Pazi: ako dev server "ne vidi" izmjene, provjeri da nema starog procesa na 4321 (`Get-NetTCPConnection -LocalPort 4321`).

## Stack i struktura
- Astro 6.4.8 statički, `<ClientRouter />` (view transitions), GSAP 3.15, Archivo variable (Fontsource). Hosting: Cloudflare Pages (još nije deployano, nema gita).
- `src/data/work.ts`: SVE sadržajno: `photos` (redoslijed = raspored u mreži), `visuals`, `videos` (lokalni + vanjski), `partners` (Suradnje carousel, recenzije u `quote`), `covers`, `sections`.
- Komponente: `Hero` (GSAP intro logo), `Header` (persistiran, Projekti dropdown), `Panels`, `Clients` (carousel), `Reviews` (chat recenzije), `GalleryPage` + `Lightbox`, `Contact`.
- Naslovnica redom: Hero, Projekti (paneli), Suradnje, Recenzije, Usluge, O nama, Kontakt.

## Media pipeline
- Originali u `raw/` (gitignore, ~1 GB). `npm run media` (`scripts/prepare-media.sh`, ffmpeg): fotke -> 2400 px JPEG, videi -> H.264 <25 MiB + preview + poster. Preskače postojeće.
- Pločice klijenata: `python scripts/prepare-logos.py` (Pillow, numpy, scipy). Sve crno-bijelo, crna podloga, bez glowa. Izvori: `raw/clients-new/PNG firmi/` (+ `raw/clients-web/` samo za Osijek Street Race). Mapiranje slug -> datoteka -> način pretvorbe je na vrhu skripte. Games koristi okrugli "g" (`games-badge.jpg`); `games-wordmark.png` postoji ali se ne koristi (Stibi tako htio).
- Vanjski videi: sličice u `raw/videos-external/`, kopirane u `src/assets/posters/<slug>.jpg`. TikTok cover se dobije iz HTML-a stranice videa (`"cover":"..."`), Instagram iz `/reel/<id>/embed/captioned/` (curl dobije login zid; radi kroz preglednik na instagram.com originu). YouTube: `i.ytimg.com/vi/<id>/oar2.jpg`.

## Ponašanje koje treba znati
- Vanjski videi: YouTube/TikTok se puštaju u lightboxu (iframe tek na klik; TikTok ručni Play, `autoplay=0&muted=0`), Instagram je link u novoj kartici. TikTok `muted=1` zaključava glasnoću. `src/scripts/tiktok-player.ts` prati player errors i 20 s timeout, daje retry/link na original; cleanup pri zatvaranju, promjeni videa i navigaciji.
- Fotke: row-order masonry (CSS grid + `cqi`, `--span` po omjeru slike, `dense`). Redoslijed u `photos` = koncerti po izvođaču + prijelaz boja, pa portreti, pa prostori.
- Carousel (Suradnje): transform + pointer drag, 3 kopije liste (sve klikabilne, samo srednja u tab redoslijedu). NE vraćati `inert` na kopije (zbog toga klik nije radio).
- Carousel nema gumb za pauzu (Stibi tako htio, 2026-11-20); staje na hover, fokus, drag i otvorenu karticu.
- Hero (2026-11-20, Stibi potvrdio): "● REC · KroArt Media, Osijek" (trepće), display naslov "Za brendove koji žele biti viđeni." (zadnja riječ u obrisu), usluge kao klipovi s obojenim lijevim rubom (boje iz intro animacije), gumb "Pogledaj radove" sa strelicom koja na hover propada. Od 1200 px stupci 1:1 da logo bude veći od teksta.
- Ugrađeni scrollbar je skriven na cijeloj stranici (Stibi tako htio, 2026-11-20); položaj pokazuje timeline.
- Timeline (`Timeline.astro`, naslovnica i sve galerije): čisto ukrasna okomita traka uz desni rub (ravnalo, bijeli "odgledani" dio, playhead, timecode uz playhead). Bez teksta, klikova i navigacije (Stibi tako htio, 2026-11-20; verzije s grupama i scrubbingom odbačene kao nepotrebne). Timecode se vidi od 1440 px, traka od 761 px. Pojavi se kad hero ili naslovna slika galerije ode s ekrana. Timecode format dijeli s Herom (`src/scripts/timecode.ts`).
- Lightbox filmstrip: sličice cijele galerije ispod rada (klon `<picture>` iz mreže, `sizes=120px`), klik skače na rad. Na mobitelu nema strelica (swipe + filmstrip).
- SEO: naslovi i opisi po stranici, `sr-only` h1 s Osijekom, OG slika `public/og.jpg` (1200×630, logo preko Jale fotke; originali logotipa u `raw/brand/`), `ProfessionalService` JSON-LD na naslovnici, `src/pages/sitemap.xml.ts`, `public/robots.txt`, 404 `noindex`. Smoke test to provjerava.
- Recenzije: inicijali u avataru, ispod firma + uloga. Tekst doslovno, kvačice ispravljene, "je****ca" ostaje.

## Odluke od Stibija (ne mijenjati bez pitanja)
- Samo hrvatski. "Fotografija i videoprodukcija" (ne "Foto- i..."). Hero: logo se složi pa ode desno, tekst lijevo. Pozadina grafit + ljubičasti/topli sjaj + grain.
- Header: Projekti (dropdown) / Suradnje / Usluge / O nama + "Pošalji upit". Header se ne smije ponovno animirati pri navigaciji.
- Logotipi klijenata: crno-bijeli, bez glowa, crna podloga. Portreti: Bibo TV = dečko s krunom koji viče, Mihael Here = kapuljača s mobitelom, Maminjo = u autu (potvrdio Stibi).
- "O nama": "Tim montažera, dizajnera i developera iz Osijeka."
- Bez Claude/AI atribucije u commitima i README. Budžet 0 EUR.

## Otvoreno / sljedeći koraci
1. TikTok (2026-11-19): u browseru potvrđen Play za „Arsa Ovde, Premršav” i volume 100. „Arsa Ovde, giveaway” vraća TikTok `NotSupportedError` / Player error; sada dobije fallback. Za pouzdano puštanje tog rada treba originalni MP4. Ostale TikTok videe još provjeriti u Chromeu. Build i `node --experimental-strip-types --test scripts/tiktok-player.test.mjs` prolaze.
2. Tekstovi koje je pisao Claude, a KroArt treba potvrditi: opisi usluga, `tag`/`did` klijenata u `work.ts`, naslovi vanjskih videa, alt tekstovi.
3. Web3Forms ključ (`PUBLIC_WEB3FORMS_KEY`) za kontakt formu: Stibi ga mora sam nabaviti (besplatno).
4. Repo: privatni https://github.com/mstibi/kroart-media (main). Ostaje Cloudflare Pages (build `npm run build`, output `dist`, `NODE_VERSION=22`). Commiti bez AI atribucije.
5. Nakon deploya: u Cloudflare Pages uključiti Web Analytics (jedan klik, bez koda i kolačića); u Google Search Console dodati domenu i poslati `https://kroart.media/sitemap.xml`.
6. Mogući dodaci o kojima se pričalo: filter po klijentu u Videima; ostatak "O nama" teksta (sad samo o montaži); prije/poslije slider (treba sirovi i gotov kadar od KroArta).

## Backup
- `.backup/v1/`: hero/global.css/Base/Header/index/work.ts iz ranijih verzija (za revert).
