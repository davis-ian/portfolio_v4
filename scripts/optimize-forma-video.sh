#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT="$ROOT_DIR/videos/forma-demo.mp4"
OUT_DIR="$ROOT_DIR/videos/optimized"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found in PATH." >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Missing input video: $INPUT" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# WebM first for best compression in modern browsers.
ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "scale=1280:-2:flags=lanczos,fps=30" \
  -an \
  -c:v libvpx-vp9 \
  -b:v 0 \
  -crf 34 \
  -row-mt 1 \
  -tile-columns 2 \
  -frame-parallel 1 \
  -g 240 \
  -pix_fmt yuv420p \
  "$OUT_DIR/forma-demo-720p30.webm"

# MP4 fallback for broad compatibility.
ffmpeg -y -loglevel error -i "$INPUT" \
  -vf "scale=1280:-2:flags=lanczos,fps=30" \
  -an \
  -c:v libx264 \
  -preset slow \
  -crf 25 \
  -profile:v high \
  -level 4.0 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  "$OUT_DIR/forma-demo-720p30.mp4"

echo "Done. Optimized video outputs are in $OUT_DIR"
