# Linear intake and connectivity

Prefer an existing authenticated Linear connector in the current client. Tools may be named differently across clients; use the capabilities available for reading issues, searching, and reading comments. Do not install an API wrapper or request a personal API key when an existing connector can do the work.

If authentication is missing, explain that skill installation and Linear authentication are separate. The user signs in through their client's OAuth flow. See the repository [setup guide](https://github.com/SomeMedic/mlga#подключение-linear) for commands, or the [official Linear MCP documentation](https://linear.app/docs/mcp).

## Intake order

1. Resolve the exact issue. Keep identifier, title, URL, team/project, status, description, acceptance criteria, and relevant links.
2. Read the discussion. Later owner clarifications can refine the description; identify an actual conflict instead of silently choosing.
3. Inspect parents, sub-issues, blockers, designs, or attachments only when relevant to scope or acceptance. Avoid crawling an entire workspace.
4. Match the repository and inspect its existing implementation. A broad issue can already be partially implemented.
5. Explain the requirement and unresolved decisions before implementation.

If a tool returns a missing-tool error, use other available reading tools. If access is denied, do not report that the issue or discussion is empty. Ask the user to authenticate or provide the missing material. Unreadable designs or acceptance criteria must remain explicit gaps.

## Examples

- “Сделай MV-123 и оставь локально потыкать” → read, clarify only material gaps, plan, implement, verify, run the app.
- “Посмотри MV-123, пока ничего не меняй” → read and explain; no implementation.
- “Сделай задачу про экспорт” with several plausible matches → show a small shortlist and ask which issue.
- “Давай настроим такой процесс” → configure or explain the process; do not pick an example issue and implement it.
