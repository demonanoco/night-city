#!/usr/bin/env bash
# Step 3: the gateway rules, the same for every agent. Approval for what's yours to
# decide (merging a pull request, deleting a Jira issue), a block for what
# no agent needs (GitHub GraphQL, the way around the merge rule, and deleting
# branches); everything else is allowed. Safe to run again: existing rules are kept.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

URL="$(onecli_url)"
[ -n "$(onecli_version)" ] || fail "OneCLI isn't answering at $URL. Run setup/1-onecli.sh first."

existing=$(curl -fsS -m 10 "$URL/v1/policy/rules") ||
  fail "Couldn't read the rules. Add them by hand in the dashboard ($URL), under Rules."

add_rule() {
  local name="$1" body="$2"
  if printf '%s' "$existing" | grep -qF "\"name\":\"$name\""; then
    echo "  = $name (already there)"
    return
  fi
  curl -fsS -m 10 -X POST "$URL/v1/policy/rules" -H 'Content-Type: application/json' -d "$body" >/dev/null ||
    fail "Couldn't add \"$name\". Add it by hand in the dashboard ($URL), under Rules."
  echo "  + $name"
}

say "Adding the gateway rules"
add_rule "Merging a pull request needs approval" \
  '{"name":"Merging a pull request needs approval","action":"allow","requireApproval":true,"targets":[{"kind":"network","hostPattern":"api.github.com","pathPattern":"/repos/*/*/pulls/*/merge","method":"PUT"}]}'
add_rule "No GitHub GraphQL" \
  '{"name":"No GitHub GraphQL","action":"block","targets":[{"kind":"network","hostPattern":"api.github.com","pathPattern":"/graphql","method":"POST"}]}'
add_rule "No deleting GitHub branches" \
  '{"name":"No deleting GitHub branches","action":"block","targets":[{"kind":"network","hostPattern":"api.github.com","pathPattern":"/repos/*/*/git/refs/*","method":"DELETE"}]}'
add_rule "Deleting a Jira issue needs approval" \
  '{"name":"Deleting a Jira issue needs approval","action":"allow","requireApproval":true,"targets":[{"kind":"app","provider":"jira","tools":["delete_issue"]}]}'

curl -fsS -m 10 -X POST "$URL/v1/policy/publish" -H 'Content-Type: application/json' -d '{}' >/dev/null ||
  fail "The rules were saved but not published. Publish them in the dashboard ($URL), under Rules."

say "Rules are live. Everything else the agents do is allowed."
