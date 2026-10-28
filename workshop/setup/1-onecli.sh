#!/usr/bin/env bash
# Step 1: install the OneCLI gateway with OneCLI's own installer, pinned to 1.42.0.
# 1.42 has project rules by method, host and path, so one rule can hold merges for
# approval while git and the API keep working. Later 1.x versions replace those
# rules with per-agent grants that block git's first request.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

running=$(onecli_version)
if [ "$running" = "$ONECLI_VERSION_PIN" ]; then
  say "OneCLI $running is already running at $(onecli_url)"
  exit 0
elif [ -n "$running" ]; then
  fail "OneCLI $running is already running at $(onecli_url). This demo needs $ONECLI_VERSION_PIN. Stop that one first (cd ~/.onecli && docker compose down), then run this again."
fi

docker info >/dev/null 2>&1 || fail "Docker isn't running. Start Docker Desktop (or your Docker engine) and run this again."

say "Installing OneCLI $ONECLI_VERSION_PIN with OneCLI's installer"
export ONECLI_VERSION="$ONECLI_VERSION_PIN"
curl -fsSL https://onecli.sh/install | sh

# The installer doesn't record the version, so a later `docker compose up` would pull
# the newest image. NanoClaw's own setup records it the same way.
touch "$ONECLI_ENV"
grep -v '^ONECLI_VERSION=' "$ONECLI_ENV" >"$ONECLI_ENV.new" || true
echo "ONECLI_VERSION=$ONECLI_VERSION_PIN" >>"$ONECLI_ENV.new"
cat "$ONECLI_ENV.new" >"$ONECLI_ENV" && rm "$ONECLI_ENV.new"

[ "$(onecli_version)" = "$ONECLI_VERSION_PIN" ] ||
  fail "OneCLI didn't come up as $ONECLI_VERSION_PIN. See: cd ~/.onecli && docker compose logs onecli"
say "OneCLI $ONECLI_VERSION_PIN is running. Dashboard: $(onecli_url)"
