#!/usr/bin/env bash
# Step 2: get NanoClaw at the tested release, add the Sprint Team templates,
# and run NanoClaw's own installer against the gateway from step 1.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

REF="${NANOCLAW_REF:-v2026.10.1-rc.2}"
DIR="$(nanoclaw_dir "${1:-}")"
REPO_ROOT="$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel 2>/dev/null || true)"
TEMPLATES="$(cd "$(dirname "${BASH_SOURCE[0]}")/../nanoclaw/sprint-team" && pwd)"

[ "$(onecli_version)" = "$ONECLI_VERSION_PIN" ] ||
  fail "OneCLI $ONECLI_VERSION_PIN isn't answering at $(onecli_url). Run setup/1-onecli.sh first."

case "$DIR/" in "$REPO_ROOT"/*) [ -n "$REPO_ROOT" ] && fail "$DIR is inside this repository. Pick a folder outside it, e.g. ~/odsc_webinar/nanoclaw." ;; esac
say "NanoClaw goes in $DIR"

if [ -f "$DIR/$KIT_MARKER" ]; then
  # NanoClaw's setup commits the skills it applies, so the copy is the tested tag plus local commits.
  git -C "$DIR" merge-base --is-ancestor "$REF" HEAD 2>/dev/null ||
    fail "$DIR is from an earlier version of this kit. Remove it with workshop/uninstall.sh, then run this again."
  say "Using the NanoClaw copy this kit installed in $DIR"
elif [ -e "$DIR" ]; then
  fail "$DIR already exists and wasn't installed by this kit. Pass a new folder, e.g. ~/odsc_webinar/nanoclaw2."
else
  say "Getting NanoClaw $REF into $DIR"
  git clone --quiet --branch "$REF" https://github.com/nanocoai/nanoclaw.git "$DIR"
  echo "Installed by the ODSC workshop kit ($REF)" >"$DIR/$KIT_MARKER"
fi

say "Adding the Sprint Team templates"
mkdir -p "$DIR/templates"
rm -rf "$DIR/templates/sprint-team"
cp -R "$TEMPLATES" "$DIR/templates/sprint-team"

say "Running NanoClaw's installer"
echo "  Choose Slack, sign in to Claude, and at \"How should we create your first agent?\""
echo "  pick From local templates, then orchestrator."
cd "$DIR"
# Point setup at the running gateway, so it installs only the onecli command and
# leaves the gateway at 1.42 instead of installing its own pinned version.
NANOCLAW_ONECLI_API_HOST="$(onecli_url)" bash nanoclaw.sh
