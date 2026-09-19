# kt-biome-extended

Personal [KohakuTerrarium](https://github.com/Kohaku-Lab/KohakuTerrarium) package extending the official [kt-biome](https://github.com/Kohaku-Lab/kt-biome) package.

This repo intentionally does **not** fork kt-biome's files: every creature here inherits from `@kt-biome/...` via `base_config`, so upstream updates are picked up by reinstalling kt-biome instead of merge conflicts.

## Contents

| Creature | Description |
| --- | --- |
| `summoner` | Graph-oriented root creature: summons and manages other creatures via the `group_*` tools. Runs with no sub-agents. |
| `simplified_general` | A simplified general-purpose creature. Avoid using graph tools unless absolutely necessary. |

## Install

Requires [kt-biome](https://github.com/Kohaku-Lab/kt-biome) (provides the `general` base creature):

```bash
kt install https://github.com/Kohaku-Lab/kt-biome.git
kt install https://github.com/SLAPaper/kt-biome-extended.git

# or install this local checkout in editable mode
kt install ./kt-biome-extended -e
```

## Run

```bash
kt run @kt-biome-extended/creatures/summoner
```
