# kt-claude-code

A KohakuTerrarium LLM backend that runs each model step through **your own,
already signed-in Claude Code**, using the Claude Agent SDK. It is also a small,
complete example of a package-provided backend (`llm_backends:` in
`kohaku.yaml`).

## No login, by design

This package has no login method of any kind. It never reads, copies or stores
Claude credentials. Sign in to Claude Code yourself (`claude`, then `/login`);
the SDK's bundled CLI uses that sign-in. Use it for your own, personal work.
Anthropic's terms apply to how you use your plan.

## Install

Requires a KohakuTerrarium release newer than 2.1.7.

```bash
kt install @kt-claude-code
kt doctor --llm claude-code/claude-code-sonnet --ping
```

## Use

Presets: `claude-code/claude-code-opus`, `claude-code/claude-code-sonnet`,
`claude-code/claude-code-haiku`. Pick one in Settings, with `/model`, or in a
creature config:

```yaml
controller:
  llm: claude-code/claude-code-sonnet
```

KohakuTerrarium runs every tool itself (plugins, sandbox and permission gates
included); the Claude Code CLI only proposes the calls. Each step is stateless,
so edit, regenerate, rewind, branch, compaction and resume all work.

## Limits

- About 1.2–1.5 s of CLI start-up per step.
- `temperature`, `top_p`, stop sequences and provider-native tools are not
  supported.

See the [repository](https://github.com/Kohaku-Lab/kt-claude-code) for options
and details.
