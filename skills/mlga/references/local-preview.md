# Local preview delivery

## Before starting

- Read the repository's launch and verification instructions. Identify frontend, backend, local database, queues, workers, storage, and feature flags actually needed for this issue.
- Inspect running services and port ownership before starting another instance. Reuse a suitable runtime; if a port belongs to another project, choose a free port and report it.
- Use the repository's local configuration and synthetic fixtures. Do not overwrite an existing environment file or reuse production connection strings.
- If test data is needed, create only the minimum local fixtures through supported seeds or application services. Keep local data changes reversible. Do not delete volumes or reset a database to fix an unrelated startup failure.

## Start and inspect

- Prefer the supported Docker Compose setup where present. Otherwise use the documented development commands in persistent sessions.
- Confirm that the services remain alive, inspect startup logs, and request the relevant local page or health endpoint.
- Open the actual application and exercise the changed flow when browser tools are available. For UI work, inspect console/network failures and applicable viewport behavior.
- Distinguish a live integration from a mock. A mocked email, payment, or AI provider does not verify the real external integration.
- If login is required, provide a synthetic local account or a documented local sign-in path. Do not expose production credentials or tokens.

## Handoff shape

> Implemented [ISSUE-123 — title](https://linear.app/...).
>
> Open: http://127.0.0.1:<actual-port>/<actual-path>
>
> Try: open the changed screen → perform the action → check the observable result.
>
> Verified: targeted tests, relevant build checks, and the browser flow actually exercised.
>
> Limits: name any mocked dependency, skipped check, or missing prerequisite.
>
> Runtime: services left running; include the actual restart/stop command or a link to project instructions.

Adapt the length to the task. Never invent ports, credentials, test results, or a browser check.
