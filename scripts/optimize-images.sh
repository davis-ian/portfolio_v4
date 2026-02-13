#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/scripts/source-images"
OUT_DIR="$ROOT_DIR/images/optimized"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe is required but was not found in PATH." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

WIDTHS=(640 960 1280 1600 2200)
IMAGES=(
  "upnext:upnext.png"
  "callsign:callsign-mockup2.png"
  "minigames:minigames1.png"
  "clipper:clipper2.png"
  "clipforge:clipforge.png"
)

for entry in "${IMAGES[@]}"; do
  base="${entry%%:*}"
  file="${entry#*:}"
  input="$SRC_DIR/$file"

  if [[ ! -f "$input" ]]; then
    echo "Skipping missing source: $input"
    continue
  fi

  width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$input")"

  echo "Optimizing $file -> $base"
  for target in "${WIDTHS[@]}"; do
    if (( target > width )); then
      continue
    fi

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos" \
      -frames:v 1 \
      -c:v libaom-av1 \
      -still-picture 1 \
      -cpu-used 6 \
      -row-mt 1 \
      -crf 34 \
      -b:v 0 \
      -pix_fmt yuv420p \
      "$OUT_DIR/${base}-${target}.avif"

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos" \
      -frames:v 1 \
      -c:v libwebp \
      -quality 72 \
      -compression_level 6 \
      -preset photo \
      -pix_fmt yuv420p \
      "$OUT_DIR/${base}-${target}.webp"

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos" \
      -frames:v 1 \
      -c:v mjpeg \
      -q:v 3 \
      -pix_fmt yuvj420p \
      "$OUT_DIR/${base}-${target}.jpg"

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos,hue=s=0" \
      -frames:v 1 \
      -c:v libaom-av1 \
      -still-picture 1 \
      -cpu-used 6 \
      -row-mt 1 \
      -crf 34 \
      -b:v 0 \
      -pix_fmt yuv420p \
      "$OUT_DIR/${base}-gray-${target}.avif"

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos,hue=s=0" \
      -frames:v 1 \
      -c:v libwebp \
      -quality 72 \
      -compression_level 6 \
      -preset photo \
      -pix_fmt yuv420p \
      "$OUT_DIR/${base}-gray-${target}.webp"

    ffmpeg -y -loglevel error -i "$input" \
      -map_metadata -1 \
      -vf "scale=${target}:-2:flags=lanczos,hue=s=0" \
      -frames:v 1 \
      -c:v mjpeg \
      -q:v 3 \
      -pix_fmt yuvj420p \
      "$OUT_DIR/${base}-gray-${target}.jpg"
  done

done

echo "Done. Optimized images written to $OUT_DIR"
