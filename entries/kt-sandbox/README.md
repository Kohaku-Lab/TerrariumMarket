# kt-sandbox

[kt-sandbox](https://github.com/Kohaku-Lab/kt-sandbox) runs persistent Docker
sandboxes with an MCP server inside. An agent works in one through MCP, for
example with the `mcp.native` plugin, so `bash`, `read`, `write` and the other
file tools run in the sandbox.

This package is the KohakuTerrarium side: one plugin, `sandbox.files`. With it,
any tool argument that takes a file to read accepts a file inside a sandbox:

```
sandbox:<server>/<path>
```

`<server>` is the name of the sandbox's MCP server in your KohakuTerrarium MCP
settings. Before the tool runs, the plugin fetches the file into a local copy
and passes that copy to the tool, so tools such as `read` or a chat bot's
"send this file" tool work unchanged. The sandbox can be on the same machine or
on another one.

## Install

Requires KohakuTerrarium 2.2.4 or newer. No extra Python packages.

```bash
kt install @kt-sandbox
```

Turn the plugin on for a creature and name the sandbox servers:

```yaml
plugins:
  - name: sandbox.files
    options:
      servers: [sandbox-lab] # names from your MCP settings
```

The agent's prompt then names the handle form and these servers.

## How files are fetched

The plugin uses the server's own MCP settings entry:

- **HTTP** (the remote case): `GET <entry url>/files?path=...` with the entry's
  headers, so the token you set for the MCP server also opens the file route.
  `${VAR}` in headers is expanded.
- **Local `docker exec` entry**: `docker exec <container> kt-sandbox-file <path>`.

Only regular files are served; symbolic links and folders are refused, and
files over the size limit (20 MiB by default) are refused.

## Existing sandboxes

A sandbox made before kt-sandbox 0.1.1 has no file route. On the sandbox's
host, run `kt-sandbox upgrade NAME` once, then restart its MCP server. The
plugin says so when it meets an old server.

## Errors

A failed fetch stops the tool call with one line: the sandbox rejected the
token, the file is missing, it is not a regular file, it is too large, the
server is too old (with the upgrade command), or the host cannot be reached.
