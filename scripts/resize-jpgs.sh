#!/usr/bin/env bash
set -euo pipefail

TARGET_WIDTH=388
TARGET_HEIGHT=534
inputs=()

add_inputs() {
    local path="$1"

    if [ -d "$path" ]; then
        shopt -s nullglob
        inputs+=("$path"/*.jpg "$path"/*.jpeg)
        return
    fi

    case "$path" in
        *.jpg|*.jpeg)
            inputs+=("$path")
            ;;
    esac
}

if [ "$#" -eq 0 ]; then
    shopt -s nullglob
    inputs=(res/*.jpg res/*.jpeg)
else
    for arg in "$@"; do
        add_inputs "$arg"
    done
fi

for input in "${inputs[@]}"; do
    [ -e "$input" ] || continue

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
