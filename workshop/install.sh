#!/usr/bin/env bash
# Sets up the Night City demo: the OneCLI gateway, NanoClaw with the Sprint Team
# templates, and the gateway rules. Usage: bash workshop/install.sh [nanoclaw-folder]
# (default ~/odsc_webinar/nanoclaw). Each step is its own script in setup/, so a
# step that fails can be fixed and run again alone.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/setup/common.sh"

bash "$HERE/setup/1-onecli.sh"
bash "$HERE/setup/2-nanoclaw.sh" "${1:-}"

printf '\nApply the recommended gateway rules (merges wait for your approval, GraphQL blocked)? [Y/n] '
read -r answer </dev/tty || answer=y
case "$answer" in
  [nN]*) echo "Skipped. Run setup/3-rules.sh later, or add your own rules in the dashboard." ;;
  *) bash "$HERE/setup/3-rules.sh" ;;
esac

cat <<DONE

Done. Last step, in the OneCLI dashboard ($(onecli_url)):
  1. Connect GitHub (the GitHub App, or a token for your repository).
  2. Connect Jira.
Then tell your orchestrator in Slack: "check setup".
DONE
