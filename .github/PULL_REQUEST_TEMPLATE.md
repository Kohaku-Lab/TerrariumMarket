<!-- Thanks for contributing!  See CONTRIBUTING.md for the full walkthrough. -->

## What is this PR?

- [ ] **New package listing**
- [ ] **New version of an existing listing**
- [ ] **Edit to package metadata / README**
- [ ] **Withdrawal (yank a version or remove a listing)**
- [ ] **Marketplace tooling (site/, scripts/, schemas/, workflows/)**

## Package details (if listing-related)

- Name: <!-- e.g. my-creature-pack -->
- Repo: <!-- https://github.com/your-name/your-package -->
- Version tag: <!-- e.g. v0.1.0 -->
- License (SPDX): <!-- e.g. MIT -->

## Checklist

- [ ] Folder under `entries/<name>/` matches the `name` field in `entry.yaml`
- [ ] `entry.yaml` validates against `schemas/entry.schema.json` (CI confirms this)
- [ ] `versions[].tag` exists in the source repo
- [ ] `README.md` is present and describes the package
- [ ] License is a recognised SPDX identifier
- [ ] I ran `npm run build-index` locally and committed the refreshed `registry.yaml` (or trust the CI to do it on merge)

## Notes for the maintainer

<!-- Anything you'd like the reviewer to know. -->
