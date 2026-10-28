# Setup

One-time steps, each started by a message from the owner.

## `check setup`

Fill `sprint.json` in your workspace, finding what you can and asking only for the rest. Keep what is already there.

If Jira or GitHub isn't connected in the gateway yet, its reply carries a connect link; send the owner that link. For GitHub, change `connect=github` in it to `connect=github-app`: the GitHub App reaches only the repositories the owner picks, while the plain GitHub connection acts as their whole account.

1. **Jira site:** find `jira_api` as the `jira` skill explains. If the gateway's Jira app reaches more than one site, or only a site token is set up, ask which site.
2. **Project:** list the projects you can see (`GET /project/search`) and ask the owner which one to use, unless there is only one.
3. **Repository:** list the repositories the gateway's GitHub access reaches (`GET api.github.com/installation/repositories` for a GitHub App, `GET api.github.com/user/repos` for a token) and ask which one, unless there's only one. If none fits, tell the owner how to give that access: add the repository to the GitHub App's installation, or create a token for it. Then check `GET api.github.com/repos/<repo>` works.
4. **Label:** `agent`, unless the owner names another.
5. **Board:** read the project's statuses and pick one for each role in your instructions' board table, by meaning rather than exact name. Show the owner the mapping as a table. For a role with no fitting status, suggest a column name (`In Review` for `review`, `Merge` for `merge`) and ask the owner to add it; you can't. Map again once they say it's there.
6. **Write `sprint.json`**, with the status ids:
   ```json
   {"jira_api": "...", "project": "<key>", "label": "agent", "repo": "<owner>/<name>",
    "statuses": {"parked": "<id>", "pickup": "<id>", "working": "<id>", "review": "<id>", "merge": "<id>", "done": "<id>"}}
   ```
7. **Start the Jira check:** resume your paused `jira-pickup` task with `ncl tasks`, then report the setup in a few lines.

## `create the starter tickets`

1. Read `workshop/tickets.md` on the repo's `main`. Each numbered item is a ticket: the bold sentence, without its final period, is the summary, and the rest is the description.
2. Create each as a Task with the label, copying the text exactly. Skip summaries that already exist.
3. Report the keys you created. New tickets land in the board's first column; the owner moves them to `pickup` when they want them started.

## `set up your team`

1. Create the workers `Leo (Dev)`, `Ana (Dev)` and `Sam (Dev)` with the template `sprint-team/worker`, and the reviewer `Iris (Reviewer)` with `sprint-team/reviewer`, each with `room: 'none'`. Use these names exactly.
2. Put the four of them in one team room with the owner, using `create_room`, and save the room's destination name in `sprint.json` as `room`.
3. Tell the owner in the room that the team is up, then assign the tickets waiting in `pickup`, as in your loop.
