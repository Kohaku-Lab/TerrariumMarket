# kt-biome

The official batteries-included package for **KohakuTerrarium** —
ready-to-run creatures, reusable terrariums, production-oriented
plugins and tools, packaged skill bundles, and concrete examples.

If you've just installed KohakuTerrarium and you want to see what
the framework can do without writing config from scratch,
`kt install @kt-biome` is the right starting point.

## What's inside

| Kind       | What                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Creatures  | Single-agent personalities + tool surfaces for common workflows (SWE, research, content composition, structured loops, …)               |
| Terrariums | Multi-creature graphs wired for common collaboration shapes (driver / navigator pair, reviewer team, deep-research, automated loops, …) |
| Plugins    | Production-oriented cross-cutting behaviour — sandboxing, budget gates, permission UI, auto-compaction profiles                         |
| Tools      | Extra tools beyond the framework's built-ins                                                                                            |
| Skills     | Packaged how-to skill bundles — markdown manifests loaded on demand                                                                     |
| Examples   | Walkthrough-style folders that explain a single concept end-to-end                                                                      |

See the repo's own README + each subdirectory's manifest for the
current contents — `kt-biome` evolves; this listing tracks the
main branch.

## Install

```bash
kt install @kt-biome
```

`kt-biome` is currently shipped as a moving target on the `main`
branch. Once it cuts its first semver tag, you'll be able to pin
versions:

```bash
kt install @kt-biome@v1.0.0
```

## Use

```bash
# List everything kt-biome registered after install
kt list

# Spawn a terrarium it provides
kt run @kt-biome/terrariums/<name>

# Or chat with a single creature
kt run @kt-biome/creatures/<name>
```

## Source + license

- Repo: https://github.com/Kohaku-Lab/kt-biome
- Licence: KohakuTerrarium License 1.0
- Maintainer: [@Kohaku-Lab](https://github.com/Kohaku-Lab)
