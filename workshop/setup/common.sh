# Shared by the setup steps.
ONECLI_VERSION_PIN=1.42.0
ONECLI_ENV="$HOME/.onecli/.env"

# The NanoClaw folder from the first argument (relative to where you run the script),
# or ~/odsc_webinar/nanoclaw. Its parent is created if missing.
nanoclaw_dir() {
  local dir="${1:-$HOME/odsc_webinar/nanoclaw}"
  case "$dir" in "~"*) dir="$HOME${dir#\~}" ;; esac
  mkdir -p "$(dirname "$dir")"
  echo "$(cd "$(dirname "$dir")" && pwd)/$(basename "$dir")"
}

# Written into the NanoClaw folder this kit creates; the scripts only ever reuse or
# remove a folder that carries it, never someone's other NanoClaw install.
KIT_MARKER=".odsc-workshop"

say() { printf '\n▸ %s\n' "$*"; }
fail() { printf '\n✗ %s\n' "$*" >&2; exit 1; }

# The dashboard and API address, as OneCLI's installer recorded it.
onecli_url() {
  local host port
  host=$(grep -s '^ONECLI_BIND_HOST=' "$ONECLI_ENV" | tail -1 | cut -d= -f2- || true)
  port=$(grep -s '^ONECLI_APP_PORT=' "$ONECLI_ENV" | tail -1 | cut -d= -f2- || true)
  echo "http://${host:-127.0.0.1}:${port:-10254}"
}

# The running gateway's version, or nothing when none answers.
onecli_version() {
  curl -fsS -m 3 "$(onecli_url)/api/health" 2>/dev/null | sed -n 's/.*"version":"\([^"]*\)".*/\1/p' || true
}
