#!/usr/bin/env bash
set -euo pipefail

TARGET_WIDTH=388
TARGET_HEIGHT=534
INPUT_DIR="${1:-res}"

shopt -s nullglob

for input in "$INPUT_DIR"/*.jpg "$INPUT_DIR"/*.jpeg; do
    tmp="$(mktemp "${TMPDIR:-/tmp}/feyhaven.XXXXXX.jpg")"

    if ffmpeg -hide_banner -loglevel error -y \
        -i "$input" \
        -vf "scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=increase:flags=lanczos,crop=${TARGET_WIDTH}:${TARGET_HEIGHT}" \
        -map_metadata 0 \
        -q:v 2 \
        "$tmp"; then
        mv "$tmp" "$input"
    else
        rm -f "$tmp"
        exit 1
    fi
done
