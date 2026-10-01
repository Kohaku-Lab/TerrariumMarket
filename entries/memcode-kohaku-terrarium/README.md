# MemCode for KohakuTerrarium

A community package implementing the tool/user-command route suggested in
[KohakuTerrarium discussion 388](https://github.com/Kohaku-Lab/KohakuTerrarium/discussions/388).
It is maintained by MemCode independently of Kohaku-Lab, and does not change
the framework's existing session memory.

## Extensions

- `memcode_recall`: a native read tool with a query-only schema. It searches
  the configured MemCode space, excludes original chunks, and returns at most
  five facts with matching user and space provenance.
- `/memcode-save <exact fact>`: a human slash command. Typing it approves
  sending precisely that fact; there is no model save tool or automatic
  ingestion of prompts, transcripts or creature files.

Configure API key, user, actor and space in the trusted host environment for an
isolated single-user deployment. Provision a separate authorized space per user.
Environment mode is not suitable for a shared multi-user process. A multi-user
application must authorize each caller and inject a dedicated memory service.
The source README includes exact installation and creature-tool configuration.

Only explicit facts and recall queries are sent to MemCode over HTTPS. Treat
returned facts as untrusted reference data. Save receipts are asynchronous job
IDs, not proof the fact is already searchable. Writes use stable idempotency
keys, provider failures are generic, and nothing is automatically retried.
Retention/deletion remain part of the authorized MemCode lifecycle flow.

## Status

Version 0.1.1 is experimental. Seven offline tests pass with the real
`BaseTool`, `BaseUserCommand`, and module-loader interfaces, using the published
MemCode SDK 2.4.0 and mocked service calls. The native framework package
installer, inventory and extension-class loading were also checked locally
without a server. Interactive creature execution and live MemCode recall have
not been tested.

The independent integration package is MIT licensed. KohakuTerrarium retains
its own license. See the public package repository for source, tests and usage.
