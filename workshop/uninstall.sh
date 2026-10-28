#!/usr/bin/env bash
# Usage: bash workshop/uninstall.sh [nanoclaw-folder] (default ~/odsc_webinar/nanoclaw).
# Removes what install.sh set up: NanoClaw through its own uninstaller, then the
# OneCLI gateway and its data. Slack apps the agents created stay in your
# workspace; remove them there.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/setup/common.sh"

DIR="$(nanoclaw_dir "${1:-}")"
shift || true

if [ -f "$DIR/$KIT_MARKER" ]; then
  bash "$DIR/uninstall.sh" "$@"
  rm -rf "$DIR"
elif [ -e "$DIR" ]; then
  echo "$DIR wasn't installed by this kit, so it's left alone."
else
  echo "No NanoClaw copy in $DIR, skipping."
fi

if [ -f "$HOME/.onecli/docker-compose.yml" ]; then
  printf '\nRemove the OneCLI gateway and everything stored in it (~/.onecli)? [y/N] '
  read -r answer </dev/tty || answer=n
  case "$answer" in
    [yY]*) (cd "$HOME/.onecli" && env -u ONECLI_VERSION docker compose down -v) && rm -rf "$HOME/.onecli" ;;
    *) echo "Kept the gateway in ~/.onecli." ;;
  esac
fi
