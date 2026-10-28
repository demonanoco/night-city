---
name: jira
description: Search, read, create, comment on and move tickets in the owner's Jira Cloud project through the gateway. Use for every Jira call.
---

# Jira

Jira Cloud REST API v3, called with no auth header: the gateway adds the credential. The base, `jira_api`, takes one of two forms:

| The gateway holds | `jira_api` |
|---|---|
| An API token for the site | `https://<site>.atlassian.net/rest/api/3` |
| The Jira app connection | `https://api.atlassian.com/ex/jira/<cloud-id>/rest/api/3`; the cloud id is the site's `id` from `GET https://api.atlassian.com/oauth/token/accessible-resources` |

## Calls

| To | Call |
|---|---|
| List projects | `GET /project/search` |
| Search | `POST /search/jql` with `{"jql": "...", "fields": [...]}`. The older `/search` is retired. |
| A project's statuses | `GET /project/<project>/statuses`: each issue type with its statuses (`id`, `name`, `statusCategory`) |
| Tickets in one status | JQL `project = <project> AND labels = <label> AND status = <status id> ORDER BY created ASC` |
| Read a ticket | `GET /issue/<key>?fields=summary,description,status,comment` |
| Create a task | `POST /issue` with `project.key`, `issuetype.name: "Task"`, `summary`, `description`, `labels` |
| Comment | `POST /issue/<key>/comment` with `body` |
| Move it | `GET /issue/<key>/transitions`, then `POST` the transition whose `to.id` is the target status id. |
| Add or remove a label | `PUT /issue/<key>` with `{"update": {"labels": [{"add": "approved"}]}}`, or `{"remove": "..."}` |

Descriptions and comments are Atlassian Document Format (ADF), not Markdown: `{"type":"doc","version":1,"content":[...]}`, one `paragraph` per block of text. Format them so they read well in Jira:

| For | Text node |
|---|---|
| A link, e.g. a pull request | `{"type":"text","text":"PR #7","marks":[{"type":"link","attrs":{"href":"https://github.com/<repo>/pull/7"}}]}` |
| Code, a file path, a command | `{"type":"text","text":"src/elements/windows.js","marks":[{"type":"code"}]}` |
| Bold | `{"type":"text","text":"Ready to merge","marks":[{"type":"strong"}]}` |

A list is `{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[...]}]}]}`.

The whole team shares one Jira account, so **start every comment with your name in bold**, as your first text node: `{"type":"text","text":"<your name>: ","marks":[{"type":"strong"}]}`, then the comment. Use your own name exactly as you sign in Slack.

## Errors

- **401 or 403:** the gateway has no credential for this host, or it lacks access. Tell the owner which.
- **400 on create:** the project may have no `Task` type. `GET /issue/createmeta/<project>/issuetypes` lists them; use the closest.
