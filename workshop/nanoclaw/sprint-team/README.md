# Sprint Team

Three NanoClaw templates that run a small team of coding agents on one GitHub repository. You drive it from your Jira board: drag a ticket to start it, drag it again to merge it. The orchestrator gives each ticket to a worker, has the reviewer check every pull request, and merges only what you approved.

| Template | Agent | Does |
|---|---|---|
| `sprint-team/orchestrator` | Maya (Lead) | Watches your board, assigns tickets, routes reviews, merges what you approve |
| `sprint-team/worker` | Leo (Dev), Ana (Dev), Sam (Dev) | One ticket at a time: a worktree from the latest `main`, the change, tests, a pull request |
| `sprint-team/reviewer` | Iris (Reviewer) | Checks each pull request against its ticket and the repo's `AGENTS.md`, and runs the tests |

You install the orchestrator. It creates the workers and the reviewer itself, from their templates, when you say `set up your team`.

## Install

From the root of this repository, with the folder NanoClaw should go in (default `~/odsc_webinar/nanoclaw`):

```sh
bash workshop/install.sh
```

A relative folder is taken from where you run the command, and a missing parent is created. The folder must be outside this repository.

It runs three steps, each its own script in `workshop/setup/`, so a step can be run again on its own:

| Step | Does |
|---|---|
| `1-onecli.sh` | Installs the OneCLI gateway with OneCLI's own installer, pinned to version 1.42.0, on its usual ports (dashboard 10254) |
| `2-nanoclaw.sh` | Gets NanoClaw at the tested release into that folder, adds these templates, and runs NanoClaw's installer against that gateway: choose Slack, sign in to Claude, then **From local templates → orchestrator** |
| `3-rules.sh` | Adds the gateway rules below. The installer asks first; skip it to set your own |

The demo needs OneCLI 1.42: its rules work by method, host and path, which is what holds a merge without blocking git. If another OneCLI version is already running, step 1 stops and says so.

`bash workshop/uninstall.sh` removes both again (pass the same folder if you chose another). It only touches a folder this kit installed.

## Your board

`check setup` maps your board's columns to these roles and asks you to add any that are missing:

| Role | Typical column | Who moves cards there |
|---|---|---|
| Parked | Backlog | You |
| Start | To Do | You |
| Working | In Progress | Orchestrator |
| In review | In Review | Orchestrator, once the pull request is open. It adds the label `approved` when the review passes, or `changes-needed` and moves the card back to In Progress |
| Merge | Merge | You |
| Done | Done | Orchestrator |

## Gateway

The agents hold no credentials. In the OneCLI dashboard, connect Jira and the **GitHub App** (not the plain GitHub connection): the App reaches only the repositories you install it on. Every agent can use them; the rules decide what needs you:

| Request | Rule |
|---|---|
| Merging a pull request (`PUT api.github.com/repos/*/*/pulls/*/merge`) | Needs approval: each merge waits for your OK in Slack |
| Deleting a Jira issue | Needs approval |
| GitHub GraphQL (`POST api.github.com/graphql`) | Blocked, so a merge can't go around the first rule |
| Deleting a GitHub branch | Blocked |
| Everything else | Allowed |

The same rules apply to every agent, so they are in place before the team exists.

The gateway can't tell branches apart on a push. Protect `main` on GitHub so a pushed branch can only land through a pull request.

## Talk to it

| Say | It does |
|---|---|
| `check setup` | Finds your Jira site, asks for the project and repository, maps your board, and starts watching it |
| `create the starter tickets` | Creates the tickets in the repo's `workshop/tickets.md`, word for word |
| `set up your team` | Creates the three workers and the reviewer, and a team room |
