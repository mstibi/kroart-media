#!/usr/bin/env bash
# Pretvara originale iz raw/ u web verzije. Pokreni iz root foldera: bash scripts/prepare-media.sh
# raw/ nije u gitu (originali su ~1 GB); u git idu samo rezultati.
set -euo pipefail
slug() { echo "$1" | tr 'A-Z' 'a-z' | sed -E 's/\.[a-z0-9]+$//; s/[^a-z0-9]+/-/g; s/^-|-$//g'; }
mkdir -p src/assets/photos src/assets/visuals src/assets/posters public/videos

# Fotke: 2400 px duža strana, Astro iz toga radi AVIF/WebP u više širina
for f in raw/photos/*; do
  out="src/assets/photos/$(slug "$(basename "$f")").jpg"
  [ -f "$out" ] || ffmpeg -v error -y -i "$f" -vf "scale='if(gt(iw,ih),2400,-2)':'if(gt(iw,ih),-2,2400)':flags=lanczos" -q:v 2 "$out"
done
for f in raw/visuals/*; do
  out="src/assets/visuals/$(slug "$(basename "$f")").jpg"
  [ -f "$out" ] || ffmpeg -v error -y -i "$f" -q:v 2 "$out"
done

# Videi: H.264 + AAC, faststart. Cloudflare Pages ima limit 25 MiB po datoteci, maxrate drži sve ispod toga.
for f in raw/videos/*; do
  s=$(slug "$(basename "$f")")
  [ -f "public/videos/$s.mp4" ] || ffmpeg -v error -y -i "$f" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 23 -maxrate 4500k -bufsize 9000k -profile:v high -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "public/videos/$s.mp4"
  # nijemi pregled za hover/panel (6 s, 540p)
  [ -f "public/videos/$s-preview.mp4" ] || ffmpeg -v error -y -ss 1 -t 6 -i "$f" -an -vf "scale=540:960:flags=lanczos" -c:v libx264 -preset slow -crf 27 -maxrate 1500k -bufsize 3000k -pix_fmt yuv420p -movflags +faststart "public/videos/$s-preview.mp4"
  [ -f "src/assets/posters/$s.jpg" ] || ffmpeg -v error -y -ss 1 -i "$f" -frames:v 1 -q:v 2 "src/assets/posters/$s.jpg"
done
ls -la public/videos src/assets/photos | head -50
