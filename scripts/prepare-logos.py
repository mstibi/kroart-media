"""Pločice klijenata za carousel -> src/assets/clients/{slug}.jpg

Pravilo: sve crno-bijelo. Potpuno crna kvadratna podloga, logo bijeli i bez sjaja, iste optičke
veličine na svakoj pločici. Portreti kreatora su crno-bijele fotografije.
Mali izvori se prije obrade povećaju (Lanczos + izoštravanje), da pločica bude oštra i na 2x ekranima.

Izvori: raw/clients-new/PNG firmi/ (originali od KroArta) i raw/clients-web/ (stara stranica, samo ono čega nema drugdje).
Načini pretvorbe loga u bijelo-na-crnom:
  alpha  - prozirni PNG, cijeli oblik postaje bijel
  diff   - logo na jednobojnoj podlozi: bijelo je sve što se razlikuje od boje podloge
  inv    - višebojni logo na svijetlom: tamni dijelovi (tekst, obrisi) bijeli, boje u sivim tonovima
  lum    - višebojni grb: svijetli dijelovi bijeli, tamni sivi
  mix    - višebojni logo: i vrlo tamni i vrlo svijetli dijelovi svijetli, srednji tonovi tamniji
  sticker- games naljepnica na žutom: ostaju bijela slova, točkice i slovo S; žuta podloga, bijeli rub
           naljepnice i crna ploča nestaju
  badge  - okrugli znak na bijeloj podlozi (games): žuti prsten i slovo bijeli, crni disk ostaje crn
  games  - stari games logo (više se ne koristi): makne se žuti okvir i crna ploča, ostaju bijela slova i 'S';
           izvor je samo ~200 px, pa se maska poveća 8x i ponovno izoštri u glatke rubove
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
NEW = ROOT / 'raw' / 'clients-new' / 'PNG firmi'
WEB = ROOT / 'raw' / 'clients-web'
OUT = ROOT / 'src' / 'assets' / 'clients'
SIZE = 1000
LUM = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

# slug: (datoteka, način, dodatno)
LOGOS = {
    'pannonian-padel': ('PP b.png', 'alpha', {}),
    'fissure': ('FISSURE_2024_lightmode.png', 'alpha', {}),
    'vinkovacke-jeseni': ('Grb_vkjeseni.jpg', 'inv', {'scale': 1.15}),
    'hrvatski-telekom': ('T.png', 'diff', {}),
    'games-doo': ('games-badge.jpg', 'badge', {'scale': 1.1}),
    'active-hub': ('Web Cover_ copy.png', 'alpha', {}),
    'mnk-osijek-galacticos': ('image.png', 'lum', {'scale': 1.15}),
    'autoskola-sunce': ('images (4).jpg', 'mix', {'scale': 1.35}),  # rijedak, razveden logo: optički treba biti veći
    'temu': ('images (6).jpg', 'diff', {'crop': 0.08}),  # izreži bijele zaobljene kutove, podloga je narančasta
    'fantastic-esports': ('images (7).jpg', 'diff', {}),
    'padel-colonia': ('logo padela.png', 'alpha', {}),
    'groom-room': ('logo vertical.png', 'inv', {'scale': 1.2}),
    'lorien': ('lorien logo.png', 'alpha', {}),
    'intersport': ('openGraphDefault.png', 'diff', {}),
}
# portreti kreatora (raspored potvrdio Stibi, 2026-11-18)
PORTRAITS = {
    'arsa-ovde': ('images (1).jpg', 0.0),
    'leon-dejanovic': ('3a4c42ee3739ee14977b8cf1cf9ba6da39803be3-1200x1600.avif', 0.12),
    'zmajo': ('images (3).jpg', 0.0),
    'mihael-here': ('images (2).jpg', 0.0),
    'maminjo': ('images.jpg', 0.38),
    'bibo-tv': ('images (5).jpg', 0.0),
}
WEB_ONLY = {'osijek-street-race'}  # nema ga u novom paketu: logo se izvuče s pločice stare stranice


def upscale(im: Image.Image, target: int) -> Image.Image:
    if max(im.size) >= target:
        return im
    s = target / max(im.size)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))


def to_mask(im: Image.Image, mode: str, crop: float = 0) -> np.ndarray:
    if crop:
        w, h = im.size
        im = im.crop((round(w * crop), round(h * crop), round(w * (1 - crop)), round(h * (1 - crop))))
    im = upscale(im.convert('RGBA'), 1600)
    a = np.asarray(im).astype(np.float32) / 255
    rgb, alpha = a[..., :3], a[..., 3]
    lum = rgb @ LUM
    if mode == 'alpha':
        return alpha
    bg = rgb[2, 2]
    shape = alpha * np.clip((np.abs(rgb - bg).max(-1) - 0.08) / 0.2, 0, 1)
    if mode == 'diff':
        return shape
    if mode == 'inv':
        return shape * np.clip(1 - lum, 0, 1)
    if mode == 'lum':
        return shape * lum
    if mode == 'mix':
        return shape * np.clip(0.25 + 1.5 * np.abs(lum - 0.5), 0, 1)
    raise ValueError(mode)


def sticker_mask(im: Image.Image) -> np.ndarray:
    from scipy import ndimage
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = a @ LUM
    sat = a.max(-1) - a.min(-1)
    yellow = (r > 0.55) & (g > 0.4) & (b < 0.5) & (sat > 0.3)
    lab, _ = ndimage.label(yellow)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outer = np.isin(lab, list(edge))  # žuta podloga (i sjena naljepnice)
    s_fill = yellow & ~outer          # žuto unutar naljepnice = slovo S
    white = (lum > 0.6) & (sat < 0.25)
    wl, _ = ndimage.label(white)
    near = ndimage.binary_dilation(outer, iterations=4)
    rim = set(np.unique(wl[near & white])) - {0}  # bijeli rub naljepnice dodiruje žutu podlogu
    letters = white & ~np.isin(wl, list(rim))
    m = (letters | ndimage.binary_closing(s_fill, iterations=2)).astype(np.float32)
    ys, xs = np.nonzero(m)
    m = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    # 4x povećanje pa ponovno zaoštravanje: glatki rubovi
    big = Image.fromarray((m * 255).astype(np.uint8))
    big = big.resize((big.width * 4, big.height * 4), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.5))
    v = np.asarray(big).astype(np.float32) / 255
    return np.clip((v - 0.42) / 0.16, 0, 1)


def badge_mask(im: Image.Image) -> np.ndarray:
    from scipy import ndimage
    a = np.asarray(upscale(im.convert('RGB'), 1600)).astype(np.float32) / 255
    lum = a @ LUM
    sat = a.max(-1) - a.min(-1)
    # bijela podloga = bijelo područje spojeno s rubom; bijelo slovo unutar diska ostaje
    lab, _ = ndimage.label((lum > 0.88) & (sat < 0.12))
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = ndimage.binary_dilation(np.isin(lab, list(edge)), iterations=3)
    return np.clip((lum - 0.35) / 0.3, 0, 1) * ~bg


def games_mask(im: Image.Image) -> np.ndarray:
    from scipy import ndimage
    a = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    ys, xs = np.nonzero(np.abs(a - 1).max(-1) > 0.12)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = a @ LUM
    sat = a.max(-1) - a.min(-1)
    yellow = (r > 0.6) & (g > 0.45) & (b < 0.45)
    # žuti okvir je žuto područje spojeno s rubom slike; žuto unutar crnog obruba je slovo S
    lab, _ = ndimage.label(yellow)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    s_fill = yellow & ~np.isin(lab, list(edge))
    letters = np.clip((lum - 0.55) / 0.3, 0, 1) * (sat < 0.25)
    # bijela pozadina u zaobljenim kutovima okvira nije slovo
    white_lab, _ = ndimage.label(letters > 0.5)
    corner = set(np.unique(np.concatenate([white_lab[0], white_lab[-1], white_lab[:, 0], white_lab[:, -1]]))) - {0}
    letters = letters * ~np.isin(white_lab, list(corner))
    m = np.maximum(letters, ndimage.binary_dilation(s_fill) * 1.0)
    # točkasta linija ispod slova je na ovoj rezoluciji samo šum: makni sitne komadiće
    lab2, n2 = ndimage.label(m > 0.5)
    sizes = ndimage.sum(np.ones_like(m), lab2, range(1, n2 + 1))
    m = m * np.isin(lab2, [i + 1 for i, sz in enumerate(sizes) if sz >= 12])
    # povećanje 8x pa ponovno "zaoštravanje": glatki rubovi umjesto mutnih piksela
    big = Image.fromarray((m * 255).astype(np.uint8))
    big = big.resize((big.width * 8, big.height * 8), Image.LANCZOS).filter(ImageFilter.GaussianBlur(7))
    v = np.asarray(big).astype(np.float32) / 255
    return np.clip((v - 0.42) / 0.16, 0, 1)


def tile_from_mask(alpha: np.ndarray, scale: float = 1) -> Image.Image:
    ys, xs = np.nonzero(alpha > 0.04)
    assert len(xs), 'prazan logo'
    mask = Image.fromarray((alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1] * 255).astype(np.uint8))
    # najviše 42 % širine i 34 % visine, plus ograničenje površine da široki i kockasti logotipi budu optički jednaki
    s = min(SIZE * 0.42 / mask.width, SIZE * 0.34 / mask.height, SIZE * 0.27 / (mask.width * mask.height) ** 0.5) * scale
    mask = mask.resize((max(1, round(mask.width * s)), max(1, round(mask.height * s))), Image.LANCZOS)
    tile = Image.new('L', (SIZE, SIZE), 0)
    tile.paste(mask, ((SIZE - mask.width) // 2, (SIZE - mask.height) // 2))
    return tile.convert('RGB')


def portrait(im: Image.Image, top: float) -> Image.Image:
    im = ImageOps.exif_transpose(im).convert('L')
    w, h = im.size
    side = min(w, h)
    y = round(min(h - side, h * top)) if h > w else 0
    x = (w - side) // 2
    im = im.crop((x, y, x + side, y + side))
    im = ImageOps.autocontrast(im, cutoff=1)
    im = upscale(im, SIZE) if side < SIZE else im.resize((SIZE, SIZE), Image.LANCZOS)
    return im.convert('RGB')


OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob('*'):
    old.unlink()

for slug, (f, mode, extra) in LOGOS.items():
    scale = extra.pop('scale', 1)
    src = Image.open(NEW / f)
    special = {'games': games_mask, 'badge': badge_mask, 'sticker': sticker_mask}
    mask = special[mode](src) if mode in special else to_mask(src, mode, **extra)
    tile_from_mask(mask, scale).save(OUT / f'{slug}.jpg', quality=90, optimize=True)
    print(f'{slug}: {mode}')
for slug, (f, top) in PORTRAITS.items():
    portrait(Image.open(NEW / f), top).save(OUT / f'{slug}.jpg', quality=88, optimize=True)
    print(f'{slug}: portrait')
for slug in WEB_ONLY:
    v = np.asarray(Image.open(WEB / f'{slug}.jpg').convert('L')).astype(np.float32)
    tile_from_mask(np.clip((v - 80) / 155, 0, 1)).save(OUT / f'{slug}.jpg', quality=90, optimize=True)  # prag ubija stari sjaj
    print(f'{slug}: web')
