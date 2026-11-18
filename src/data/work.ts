import type { ImageMetadata } from 'astro';

const photoFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });
const visualFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/visuals/*.jpg', { eager: true });
const posterFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/posters/*.jpg', { eager: true });

const pick = (files: Record<string, { default: ImageMetadata }>, dir: string, slug: string, ext = 'jpg') => {
  const file = files[`../assets/${dir}/${slug}.${ext}`];
  if (!file) throw new Error(`Nema slike: ${dir}/${slug}.${ext} (pokreni npm run media)`);
  return file.default;
};

export type Item = { slug: string; alt: string; src: ImageMetadata };
// lokalni video ima video/preview; vanjski (Instagram, TikTok, YouTube) ima href i platformu i otvara se na toj platformi
export type VideoItem = Item & {
  title: string; note: string;
  video?: string; preview?: string;
  href?: string; platform?: 'Instagram' | 'TikTok' | 'YouTube';
  embed?: string; // ako postoji, video se pušta u lightboxu (iframe se učitava tek na klik)
};

// Redoslijed: prvo koncerti, grupirani po izvođaču, s prijelazima boja (crveno -> ljubičasto -> zeleno -> plavo),
// pa portreti (KSV, Brights) i prostori. Mreža se čita red po red, pa se ovaj slijed i vidi.
export const photos: Item[] = ([
  // Jelena Rozga: crveno i žuto, pa bijelo, pa ljubičasto
  ['rozga-1', 'Pjevačica u crnom pjeva uz stalak za mikrofon u crvenom svjetlu'],
  ['rozga-grid-1', 'Kolaž tri fotografije pjevačice na pozornici u crvenom svjetlu'],
  ['rozga-3', 'Nasmijana pjevačica drži mikrofon u crveno-žutom svjetlu'],
  ['rozga-2', 'Pjevačica u žutom i crvenom svjetlu pozornice'],
  ['rozga-6', 'Pjevačica u protusvjetlu i dimu'],
  ['rozga-5', 'Pjevačica na pozornici u ljubičastom svjetlu'],
  // Jale i bend, isti koncert: ljubičasto, crveno, bijelo, zeleno
  ['jaleee-10', 'Pjevač na velikoj pozornici u ljubičastom svjetlu'],
  ['jaleee-5', 'Pjevač među iskrama pirotehnike'],
  ['bubnjar', 'Bubnjar za setom u šarenom svjetlu'],
  ['kljavator', 'Klavijaturist u crvenom svjetlu'],
  ['basist', 'Basist u odijelu pred svjetlima publike'],
  ['jaleee-11', 'Pjevač u crvenim hlačama izbliza'],
  ['jaleee-3', 'Pjevač na pozornici u dimu i reflektorima'],
  ['basist-2', 'Bend na pozornici pod reflektorima'],
  ['jaleee-8', 'Široki kadar pozornice s bendom u zelenom svjetlu'],
  // zeleno i tirkizno, pa plavo-ljubičasto
  ['peki1', 'Reper na pozornici u zelenom laserskom svjetlu'],
  ['vojko-1', 'Izvođač na pozornici u tirkiznom i narančastom svjetlu'],
  ['filip', 'Pjevač kleči na pozornici u ljubičastom svjetlu'],
  // Zmajo
  ['zmajo-i-jakov-2', 'Nasmijani obožavatelj s darom na koncertu'],
  ['zmajo-6', 'Izvođač uz ogradu s publikom'],
  // portreti: KSV, pa Brights naočale (žuta stakla povezuju ta dva seta)
  ['ksv2', 'Portret mladića sa žutim naočalama na otvorenom'],
  ['ksv-1', 'Portret mladića u tamnoj trenirci pod vedrim nebom'],
  ['prdivoj1', 'Nasmijani mladić s kovrčavom kosom i žutim naočalama Brights'],
  ['prdivoj-3', 'Mladić namješta naočale Brights sa žutim staklima'],
  ['prdivoj-grid', 'Crno-bijeli kolaž mladića sa žutim naočalama Brights'],
  ['prdivoj2', 'Krupni kadar naočala Brights na licu mladića'],
  // prostori
  ['groomroomweb4', 'Interijer brijačnice Groom Room'],
  ['groomroomweb15', 'Brijač šiša klijenta u salonu Groom Room'],
  ['groomroomweb5', 'Svjetleći znak brijačnice Groom Room'],
] as const).map(([slug, alt]) => ({ slug, alt, src: pick(photoFiles, 'photos', slug) }));

export const visuals: Item[] = ([
  ['carina-reket', 'Objava za Pannonian Padel s reketom na plavom terenu'],
  ['jozinovic-flyer', 'Plakat za nastup Jakova Jozinovića na Vinkovačkim jesenima'],
  ['groom-room-vinkovacke-jeseni', 'Objava Groom Rooma za termine prije Vinkovačkih jeseni'],
  ['bosna', 'Navijačka objava „Sretno!” s igračem u dresu'],
  ['zmajo', 'Plakat „Dalmacija” za Zmaja'],
  ['najam-reketa', 'Objava o najmu reketa za 3 €'],
  ['redbull-na-pannonianu', 'Objava o Red Bullu u Pannonian Padelu'],
  ['vidimo-se', 'Plakat za Vinkovačke jeseni'],
  ['pannonian-liga-post', 'Objava za početak Pannonian lige'],
  ['artboard-2-1', 'Objava za izazov Prepme Walk Challenge'],
  ['padel-tereni-u-hr', 'Objava o padel terenima u Hrvatskoj'],
] as const).map(([slug, alt]) => ({ slug, alt, src: pick(visualFiles, 'visuals', slug) }));

export const videos: VideoItem[] = ([
  ['zmajo-la-playa', 'Zmajo, La Playa', 'Event recap', 'Noć uz iskre i publiku na La Playi'],
  ['groom-room-zmajo-edit', 'Groom Room × Zmajo', 'Brand video', 'Zmajo na šišanju u brijačnici Groom Room'],
  ['sequence-03', 'Produktni promo', 'Reklama', 'Mladić za stolom s limenkom pića'],
] as const).map(([slug, title, note, alt]) => ({
  slug, title, note, alt,
  src: pick(posterFiles, 'posters', slug),
  video: `/videos/${slug}.mp4`,
  preview: `/videos/${slug}-preview.mp4`,
} as VideoItem)).concat(([
  // vanjski videi: sličica u raw/videos-external/ -> src/assets/posters/ (linkovi platformi na sličice istječu)
  // [slug, naslov, opis, alt, platforma, id na platformi, link]
  ['ht-free-wifi', 'Hrvatski Telekom × Croatia Airlines', 'Instagram reel', 'Mladić s ruksakom trči kroz zračnu luku, natpis „Free Wi-Fi na 10.000 m visine?”', 'Instagram', 'DOX7tHUiPh0', 'https://www.instagram.com/reel/DOX7tHUiPh0/'],
  ['arsa-giveaway', 'Arsa Ovde, giveaway', 'TikTok', 'Arsa sa slušalicama oko vrata i brojem 9,876', 'TikTok', '7518081728536415493', 'https://www.tiktok.com/@arsaovdelive/video/7518081728536415493'],
  ['arsa-premrsav', 'Arsa Ovde, Premršav', 'TikTok', 'Arsa na kauču s mikrofonom, natpis „Premršav”', 'TikTok', '7534739935497112838', 'https://www.tiktok.com/@nijearsaovde/video/7534739935497112838'],
  ['kroart-sta-ako-uspijemo', 'A šta ako uspijemo?', 'Osobni projekt · YouTube Short', 'Mladić pokazuje znak OK u kameru', 'YouTube', '7ar3Fc92h1g', 'https://youtube.com/shorts/7ar3Fc92h1g'],
  ['kroart-wear-brights', 'Wear Brights × Nuke', 'Osobni projekt · YouTube Short', 'Mladić s crvenim naočalama za stolom otvara kutiju', 'YouTube', 'lVohOqianU4', 'https://youtube.com/shorts/lVohOqianU4'],
  ['bibo-ps5-giveaway', 'Bibo TV, PS5 giveaway', 'Instagram reel', 'Bibo drži kutiju PlayStationa 5', 'Instagram', 'DWB76xbDCmo', 'https://www.instagram.com/reel/DWB76xbDCmo/'],
  ['bibo-portfolio', 'Bibo TV, portfolio', 'YouTube Short', 'Bibo u kapuljači na ulici, natpis „experience”', 'YouTube', 'BZF93xeFtzo', 'https://www.youtube.com/shorts/BZF93xeFtzo'],
  ['pannonian-otvoreni-smo', 'Pannonian Padel, otvorenje', 'Instagram reel', 'Mladić s mikrofonom na padel terenu, natpis „Otvoreni smo!”', 'Instagram', 'DO5n_7jjSoy', 'https://www.instagram.com/pannonianpadel/reel/DO5n_7jjSoy/'],
  ['pannonian-rezerviraj-online', 'Pannonian Padel, rezerviraj online', 'Instagram reel', 'Plavi padel teren, natpis „Rezerviraj online, plati u klubu”', 'Instagram', 'DOqLIoVjXy1', 'https://www.instagram.com/pannonianpadel/reel/DOqLIoVjXy1/'],
  ['pannonian-padel-hunt', 'Pannonian Padel, Padel Hunt', 'Instagram reel', 'Mladić s omotnicom na livadi, natpis „Besplatan Padel Hunt”', 'Instagram', 'DPitX82DRjM', 'https://www.instagram.com/pannonianpadel/reel/DPitX82DRjM/'],
  ['groom-gta-euforija', 'Groom Room, GTA euforija', 'Instagram reel', 'Mladić s fadeom u brijačnici, gradska svjetla u pozadini', 'Instagram', 'Df2eTfHMHmk', 'https://www.instagram.com/reel/Df2eTfHMHmk/'],
  ['groom-transformacija', 'Groom Room, transformacija', 'Instagram reel', 'Mladić s mullet frizurom u brijačkom ogrtaču', 'Instagram', 'DfkIDQuMpo2', 'https://www.instagram.com/reel/DfkIDQuMpo2/'],
  ['mnk-galacticos-reel', 'MNK Osijek Galacticos', 'Instagram reel', 'Igrač u bijelim čarapama s loptom na terenu', 'Instagram', 'DKvGfyHtW1A', 'https://www.instagram.com/reel/DKvGfyHtW1A/'],
  ['intersport-sup', 'Intersport, SUP za ljeto', 'TikTok', 'Daska za SUP i dvojica mladića u trgovini', 'TikTok', '7527277316460825878', 'https://www.tiktok.com/@intersporthrvatska/video/7527277316460825878'],
  ['games-univerzum', 'Games, GameS univerzum', 'TikTok', 'Mladić s mikrofonom ispred trgovine GameS', 'TikTok', '7528706953699233030', 'https://www.tiktok.com/@gamesdoo/video/7528706953699233030'],
  ['games-ivica-kutije', 'Games, ivica kutije', 'TikTok', 'Dvojica mladića među policama s igrama u GameS-u', 'TikTok', '7525839047583943942', 'https://www.tiktok.com/@gamesdoo/video/7525839047583943942'],
  ['games-cekaju-te', 'Games, čekaju te u GameS-u', 'TikTok', 'Mladić pokazuje prema trgovini GameS', 'TikTok', '7525085130579397944', 'https://www.tiktok.com/@gamesdoo/video/7525085130579397944'],
  ['fissure-faceit', 'Fissure, klasični igrači Faceita', 'TikTok', 'Dvojica mladića s mikrofonom, natpis „Imam nož”', 'TikTok', '7527703015059426616', 'https://www.tiktok.com/@fissurebalkan/video/7527703015059426616'],
] as const).map(([slug, title, note, alt, platform, id, href]): VideoItem => ({
  slug, title, note, alt, platform, href,
  // YouTube i TikTok se puštaju u našem lightboxu (TikTok kreće utišan, inače preglednik blokira autoplay); Instagram embed se ne da urediti, pa vodi na Instagram
  embed: platform === 'YouTube' ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`
    : platform === 'TikTok' ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&muted=1&music_info=1&description=0&rel=0`
    : undefined,
  src: pick(posterFiles, 'posters', slug),
})));

const tileFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/clients/*.jpg', { eager: true });
const find = <T extends Item>(list: T[], slug: string) => {
  const it = list.find((x) => x.slug === slug);
  if (!it) throw new Error(`Nema rada: ${slug}`);
  return it;
};

export type Partner = {
  name: string;
  tile: ImageMetadata; // pločica u stilu postojeće stranice (scripts/prepare-logos.py)
  tag?: string; // djelatnost
  did?: string; // što smo radili
  work?: { item: Item; href: string }[];
  quote?: { lines: string[]; author: string; role: string }; // poruka klijenta, doslovno kako je poslana
};

const vid = (slug: string) => ({ item: find(videos, slug), href: '/videi/' });

const P = (slug: string, name: string, rest: Omit<Partner, 'name' | 'tile'> = {}): Partner =>
  ({ name, tile: pick(tileFiles, 'clients', slug), ...rest });

// tag/did ostavljeni prazni gdje ne znamo detalje suradnje: KroArt neka popuni
export const partners: Partner[] = [
  P('pannonian-padel', 'Pannonian Padel', {
    tag: 'Padel klub', did: 'Reelsi, vizuali i objave za društvene mreže',
    quote: { lines: ['Top video!!!'], author: 'M. B.', role: 'Vlasnik' },
    work: [vid('pannonian-otvoreni-smo'), vid('pannonian-padel-hunt'), { item: find(visuals, 'carina-reket'), href: '/vizuali/' }],
  }),
  P('arsa-ovde', 'Arsa Ovde', { tag: 'Kreator sadržaja · 2M+ pratitelja', did: 'Montaža TikTok videa', work: [vid('arsa-giveaway'), vid('arsa-premrsav')] }),
  P('groom-room', 'Groom Room', {
    tag: 'Barbershop', did: 'Reelsi, brand video i fotografija prostora',
    quote: {
      lines: ['Daaa vidjela sam, čak smo nadmašili i onaj prvi video 🤣🤣', 'A mislila sam da ne ide više od toga', 'Top topp!!'],
      author: 'M. P.', role: 'Vlasnica',
    },
    work: [
      { item: find(videos, 'groom-room-zmajo-edit'), href: '/videi/' },
      vid('groom-gta-euforija'),
      { item: find(photos, 'groomroomweb15'), href: '/fotografije/' },
    ],
  }),
  P('hrvatski-telekom', 'Hrvatski Telekom', {
    tag: 'Telekomunikacije', did: 'Video za Instagram',
    work: [vid('ht-free-wifi')],
  }),
  P('temu', 'Temu', { tag: 'Online trgovina' }),
  P('zmajo', 'Zmajo', {
    tag: 'Kreator sadržaja · 20K+ pratitelja', did: 'Event recap, brand video, koncertna fotografija i plakati',
    work: [
      { item: find(videos, 'zmajo-la-playa'), href: '/videi/' },
      { item: find(photos, 'zmajo-6'), href: '/fotografije/' },
      { item: find(visuals, 'zmajo'), href: '/vizuali/' },
    ],
  }),
  P('vinkovacke-jeseni', 'Vinkovačke jeseni', {
    tag: 'Festival', did: 'Plakati i vizuali za nastupe',
    work: ['jozinovic-flyer', 'vidimo-se', 'groom-room-vinkovacke-jeseni'].map((s) => ({ item: find(visuals, s), href: '/vizuali/' })),
  }),
  P('leon-dejanovic', 'Leon Dejanović', { tag: 'Kreator sadržaja · 1M+ pratitelja' }),
  P('intersport', 'Intersport', { tag: 'Sportska oprema', did: 'TikTok video', work: [vid('intersport-sup')] }),
  P('padel-colonia', 'Padel Colonia', { tag: 'Padel klub' }),
  P('bibo-tv', 'Bibo TV', { tag: 'Kreator sadržaja · 300K+ pratitelja', did: 'Reelsi i YouTube Shorts', work: [vid('bibo-ps5-giveaway'), vid('bibo-portfolio')] }),
  P('osijek-street-race', 'Osijek Street Race', { tag: 'Utrka' }),
  P('lorien', 'Lorien'),
  P('mihael-here', 'Mihael Here', { tag: 'Kreator sadržaja · 200K+ pratitelja' }),
  P('fantastic-esports', 'Fantastic Esports', { tag: 'Esports' }),
  P('active-hub', 'Active Hub', {
    quote: { lines: ['samo ću to reći...je****ca! 🔥'], author: 'I. S.', role: 'Vlasnik' },
  }),
  P('maminjo', 'Maminjo', { tag: 'Kreator sadržaja · 150K+ pratitelja' }),
  P('mnk-osijek-galacticos', 'MNK Osijek Galacticos', { tag: 'Malonogometni klub', did: 'Reel za Instagram', work: [vid('mnk-galacticos-reel')] }),
  P('autoskola-sunce', 'Autoškola Sunce', { tag: 'Autoškola' }),
  P('fissure', 'Fissure', { did: 'TikTok video', work: [vid('fissure-faceit')] }),
  P('games-doo', 'Games d.o.o.', { tag: 'Gaming trgovina', did: 'TikTok videi', work: [vid('games-univerzum'), vid('games-ivica-kutije'), vid('games-cekaju-te')] }),
];

// naslovna slika svake galerije (panel na naslovnici i vrh galerije), neovisno o redoslijedu u mreži
export const covers = { fotografije: 'jaleee-3', videi: 'zmajo-la-playa', vizuali: 'carina-reket' } as const;

export const sections = [
  { slug: 'fotografije', title: 'Fotografije', note: 'Koncerti, portreti i prostori', count: photos.length },
  { slug: 'videi', title: 'Videi', note: 'Montaža za TikTok, Reels i evente', count: videos.length },
  { slug: 'vizuali', title: 'Vizuali', note: 'Objave i plakati za društvene mreže', count: visuals.length },
] as const;

export const CONTACT_EMAIL = 'contact@kroart.media';
export const INSTAGRAM = 'https://www.instagram.com/kroart.media/';
