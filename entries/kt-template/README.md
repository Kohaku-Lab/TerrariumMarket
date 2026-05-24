# kt-template

The starter template for building your own KohakuTerrarium
package. Structured as a real reusable pack — not just a loose
example — so you can clone it, rename it, and ship it with
minimal restructuring.

## What's inside

| Path                           | Purpose                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `kohaku.yaml`                  | Package manifest — names, paths, framework constraint. The same shape every published package uses               |
| `creatures/template-creature/` | A standalone creature with heavily-commented config, system prompt, memory files, and custom extension templates |
| `terrariums/template-team/`    | A multi-creature terrarium example with root prompts and channel wiring                                          |
| `kt_template/`                 | The installable Python package directory — drop your shared tools, plugins, and helpers here                     |

Each subdirectory's README walks through what every file does
and what you can change without breaking the manifest contract.

## How to use it

```bash
# Install it just to read through
kt install @kt-template

# Or clone + start your own
git clone https://github.com/Kohaku-Lab/kt-template my-package
cd my-package
# Rename kohaku.yaml's `name:` and the creature/terrarium folder
# names, then start customising.
```

When your package is ready, [submit it to
TerrariumMarket](https://github.com/Kohaku-Lab/TerrariumMarket/blob/main/CONTRIBUTING.md)
so others can discover and install it.

## Source + license

- Repo: https://github.com/Kohaku-Lab/kt-template
- Licence: KohakuTerrarium License 1.0
- Maintainer: [@Kohaku-Lab](https://github.com/Kohaku-Lab)
