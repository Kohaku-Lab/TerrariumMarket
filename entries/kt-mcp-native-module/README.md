# kt-mcp-native-module

Makes the tools of an MCP server native tools of a KohakuTerrarium agent.

The operator attaches a server from KohakuTerrarium's global MCP registry at
runtime. Each of its tools is registered under its own name, with the server's
description and argument schema, and replaces the agent's tool of the same name
until the server is detached. The model calls `read` or `bash` directly, and the
call runs on the server.

Without the plugin an agent reaches MCP tools through `mcp_call(server, tool,
args)`. That path stays unchanged.

The first use is [kt-sandbox](https://github.com/Kohaku-Lab/kt-sandbox): its MCP
server offers `bash`, `read`, `write`, `multi_edit`, `glob`, `grep` and `tree`,
so attaching a sandbox makes the agent work inside it with its usual tool set.
The plugin works with any server in the registry.

## Install

Requires KohakuTerrarium 2.2.4 or newer.

```bash
kt install @kt-mcp-native-module
```

Package plugins are installed turned off. Turn it on for a creature with
`/plugin enable mcp.native`, or in the creature's config:

```yaml
plugins:
  - name: mcp.native
    options:
      servers: [sandbox-lab] # attached when the creature starts
```

## Registry entries

The plugin connects a server from its entry in the global MCP registry
(`kt config mcp`). `${VAR}` and `${VAR:default}` in `command`, `args`, `env`,
`url` and `headers` are read from the environment; an unset `${VAR}` without
default stops the attach with a message that names the variable.

```yaml
- name: sandbox-lab
  transport: streamable_http # stdio for a local command, sse for an older SSE server
  url: http://127.0.0.1:8765/mcp
  headers:
    Authorization: Bearer ${SANDBOX_TOKEN}
```

## Use

Only the operator attaches servers; the agent gets no tool for it.

| Command                    | Does                                        |
| -------------------------- | ------------------------------------------- |
| `/mcp-native`              | lists the registry servers and their state  |
| `/mcp-native <server>`     | attaches the server                         |
| `/mcp-native off <server>` | detaches it and brings the local tools back |
| `/mcp-native off`          | detaches every attached server              |

The `servers` option (Modules panel, or `/module set mcp.native servers ...`) does
the same and is saved with the session.

## What the agent sees

- The server's tools under their usual names, labelled `mcp:<server>` in
  `/module`.
- A block in the system prompt with the server's own instructions, removed on
  detach.
- Text as text and images as images: reading a PNG on the server shows the model
  the picture.

Built-in tools the server does not offer, such as `edit` and `python`, stay and
still act on the local machine. Turn them off with `/module disable <name>`.

## Failures

- A server that cannot be reached gives one line with the cause and what to
  check, never header values, for example
  `MCP server 'web': HTTP 401 Unauthorized from http://127.0.0.1:8765/mcp: check the headers/token`
  or `... cannot connect to http://127.0.0.1:8765/mcp: All connection attempts failed`.
  An `sse` entry for a streamable-HTTP server is told to use `streamable_http`.
- If the server stops answering, a call returns an error that names
  `/mcp-native <server>`. The agent never falls back to the local tools on its
  own; only a detach brings them back.
- If a saved server cannot be reached on resume, `/mcp-native` lists it as
  `unreachable` and the system prompt tells the agent its file and shell tools
  currently act on this machine.
- Two servers cannot provide the same tool name. Give one a prefix with
  `/module set mcp.native prefixes '{"<server>": "<prefix>"}'`.

Full documentation: the
[repository README](https://github.com/Kohaku-Lab/kt-mcp-native-module#readme).
