# kt-biome

The official creature + terrarium reference pack for
KohakuTerrarium.  Nine creatures and five terrariums covering the
common single-agent and multi-agent workflow shapes the framework
was built for.

## Creatures

| Name | Role |
|---|---|
| `general` | Base creature — 24 tools, 6 sub-agents, core personality |
| `bounded_general` | `general` with a 50-turn shared iteration budget |
| `swe` | Software engineering specialist |
| `researcher` | Research and analysis specialist |
| `music` | Music composition via LilyPond |
| `video` | HTML-based HyperFrame video / frame composition |
| `diagrammer` | Diagrams via Mermaid / Graphviz / D2 |
| `ralph_initializer` | Ralph-loop scaffolding (one-shot) |
| `ralph_worker` | Ralph-loop iterative worker |

All non-`general` creatures inherit from `general` so they share the
core tool surface + personality and override only the system-prompt
+ a focused tool subset.

## Terrariums

| Name | Topology |
|---|---|
| `swe_team` | Implementer + reviewer (two `swe` instances on role-asymmetric channels) |
| `pair_programming` | Driver + navigator pair (two `swe` instances) |
| `deep_research` | Planner, researcher, synthesizer, critic |
| `auto_research` | Ideator, coder, runner, analyzer loop |
| `ralph_loop` | Huntley-style Ralph loop — one-shot initializer + repeating worker |

## Install

```bash
kt install @kt-biome
```

Or pin a specific version:

```bash
kt install @kt-biome@v0.3.0
```

## Use

```bash
# Spawn the swe-team terrarium
kt run @kt-biome/terrariums/swe_team

# Or chat with a single creature
kt run @kt-biome/creatures/researcher
```

## Source + license

- Repo: https://github.com/Kohaku-Lab/kt-biome
- Licence: MIT
- Maintainer: [@Kohaku-Blueleaf](https://github.com/Kohaku-Blueleaf)
