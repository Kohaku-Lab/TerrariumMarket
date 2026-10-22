# kt-biome

The official batteries-included package for **KohakuTerrarium**: ready-to-run
creatures, reusable graph recipes, plugins, tools, and skill bundles.

## What's inside

| Kind         | Contents                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------- |
| Creatures    | `general`, `swe`, and `researcher`                                                          |
| Terrariums   | `swe_team`, `deep_research`, and `adaptive_team`                                            |
| Task helpers | Bounded `explore` and `critic` sub-agents inside each creature                              |
| Plugins      | Context files, family guidance, telemetry, checkpoints, memory, and other optional policies |
| Tools        | Database access, skill management, and optional SSH/Docker shell backends                   |
| Skills       | Git workflow, TODO files, graph creation, diagrams, PDF merging, LilyPond, and HyperFrame   |

See the [package manifest](https://github.com/Kohaku-Lab/kt-biome/blob/v4.0.0/kohaku.yaml)
for the full inventory.

## Install

Requires **KohakuTerrarium >2.1.7,<3.0.0**. Use a qualifying nightly containing
the inspection-helper changes or a later compatible stable release.

```bash
kt install @kt-biome
# Reproducible release selection:
kt install @kt-biome@v4.0.0
```

The listing now pins a release commit instead of tracking the moving `main`
branch under an outdated compatibility constraint.

## Lightweight inspection, graph collaboration

- **explore** answers a bounded workspace question with file evidence and gaps.
- **critic** independently reviews a supplied change, artifact, or proposal for
  concrete defects. It does not fix the work or run test suites.

Both use `read`, `glob`, `grep`, and `tree`, without shell access. Supply the
question or review target, relevant requirements, and a diff for change reviews.
They start without the parent's conversation.

Defaults: 8/12 soft/hard model-call budgets, 24/40 tool-call budgets, a 14-call
absolute cap, and a 600-second emergency timeout. Neither preset opts into
automatic compaction. Critic inherits the parent model; explore uses the
configured sub-agent mapping or the parent as fallback.

The parent owns planning and decisions. Graph creatures own substantial
implementation, research, and coordination through channels and output wiring.

## Upgrade from older versions

The inherited `worker` and `plan` sub-agents have been removed. KT also retires
the builtin `research` and `coordinator` presets. Updated KT warns and skips
unavailable builtin config entries instead of preventing startup, including in
strict mode. Update downstream delegation instructions accordingly.

Service presets `response`, `summarize`, `memory_read`, and `memory_write` remain
available in KT but are not automatically enabled by these creature presets.
Read the [release notes](https://github.com/Kohaku-Lab/kt-biome/releases/tag/v4.0.0).

## Use

```bash
kt run @kt-biome/creatures/swe
kt terrarium run @kt-biome/terrariums/swe_team
```

## Source and license

- Repository: https://github.com/Kohaku-Lab/kt-biome
- License: KohakuTerrarium License 1.0
- Maintainer: [@Kohaku-Lab](https://github.com/Kohaku-Lab)
