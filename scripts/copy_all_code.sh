#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: $0 DESTINATION

Copy the entire project repository to the DESTINATION directory.
The destination can be an existing empty directory or a new path.
USAGE
}

if [[ ${1-} == "" ]]; then
  usage >&2
  exit 1
fi

dest="$1"

if [[ -e "$dest" && ! -d "$dest" ]]; then
  echo "Error: destination exists and is not a directory: $dest" >&2
  exit 1
fi

mkdir -p "$dest"

# Resolve to absolute path for safety
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dest_abs="$(cd "$dest" && pwd)"

# Use rsync when available for efficient copying; fall back to cp otherwise
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude='.git' --exclude='node_modules' "$repo_root/" "$dest_abs/"
else
  (cd "$repo_root" && find . -mindepth 1 -maxdepth 1 \
    ! -name '.git' ! -name 'node_modules' \
    -exec cp -R {} "$dest_abs" \;)
fi

echo "Repository copied to $dest_abs"
