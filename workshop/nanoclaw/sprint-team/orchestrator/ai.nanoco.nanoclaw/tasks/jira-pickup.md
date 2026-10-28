---
schedule: "*/10 * * * * *"
script: |
  # Reports each ticket in pickup or merge once, until it leaves that column.
  # .jira-seen.json is only this check's cursor, not the agent's memory.
  set -euo pipefail
  CFG=/workspace/agent/sprint.json
  SEEN=/workspace/agent/.jira-seen.json
  if [ ! -f "$CFG" ]; then echo '{"wakeAgent":false}'; exit 0; fi
  API=$(node -p 'require(process.argv[1]).jira_api' "$CFG")
  BODY=$(node -e '
    const c = require(process.argv[1]);
    const s = c.statuses || {};
    const ids = [s.pickup, s.merge].filter(Boolean);
    if (!ids.length) process.exit(0);
    const jql = `project = ${c.project} AND labels = ${c.label} AND status in (${ids.join(", ")}) ORDER BY created ASC`;
    process.stdout.write(JSON.stringify({ jql, fields: ["summary", "status"], maxResults: 100 }));
  ' "$CFG")
  if [ -z "$BODY" ]; then echo '{"wakeAgent":false}'; exit 0; fi
  RES=$(curl -sSf --max-time 20 -X POST "$API/search/jql" -H 'Content-Type: application/json' -H 'Accept: application/json' -d "$BODY")
  node -e '
    const fs = require("fs");
    const [cfg, res, seenFile] = process.argv.slice(1);
    const s = require(cfg).statuses;
    let seen = [];
    try { seen = JSON.parse(fs.readFileSync(seenFile, "utf8")); } catch {}
    const issues = JSON.parse(res).issues || [];
    const now = issues.map((i) => `${i.key}:${i.fields.status.id}`);
    fs.writeFileSync(seenFile, JSON.stringify(now));
    const role = (id) => (id === String(s.merge) ? "merge" : "pickup");
    const tickets = issues
      .filter((i) => !seen.includes(`${i.key}:${i.fields.status.id}`))
      .map((i) => `${i.key} (${role(i.fields.status.id)}): ${i.fields.summary}`);
    console.log(JSON.stringify(tickets.length ? { wakeAgent: true, data: { tickets } } : { wakeAgent: false }));
  ' "$CFG" "$RES" "$SEEN"
---
Tickets newly in `pickup` or `merge` (listed in the data above, each with its role). Handle them as your loop says.
