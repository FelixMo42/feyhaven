#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RES_DIR="$ROOT_DIR/res"

if ! command -v sips >/dev/null 2>&1; then
  echo "sips is required but was not found on PATH." >&2
  exit 1
fi

find "$RES_DIR" -type f \
  ! -iname '*.jpg' \
  ! -iname '*.jpeg' \
  | while IFS= read -r src; do
      dir="$(dirname "$src")"
      base="$(basename "$src")"
      name="${base%.*}"
      target="$dir/$name.jpg"

      rm -f "$target"
      sips -s format jpeg "$src" --out "$target" >/dev/null
      echo "Converted: $src -> $target"
    done
