# Evident compatibility fork

This repository maintains small FocusReactive adaptations for Groundwork sites. `origin` is the Evident fork; `upstream` is FocusReactive. The upstream workspace remains a Payload 3 development environment; admitting an exact Payload 4 beta in selected peer ranges does not certify every plugin or a later beta.

| Owner | Procedure | Consumer acceptance |
| --- | --- | --- |
| SEO | [Package compatibility guide](../packages/payload-plugin-seo/PAYLOAD4.md) | Each site's SEO guide and actual package lock |
| A/B | [Package compatibility guide](../packages/payload-plugin-ab/PAYLOAD4.md) | Each site's A/B guide, renderer/proxy and actual package lock |

Use a task-owned branch from current `origin/main`, PR to `main`. Inspect the small maintained delta before taking upstream updates. Follow the package guide to stage and build only that package against its tested runtime, compare stock/patched behavior and validate the actual site consumer. Keep schema, content, titles and rendering adapters in Cedar or St. Thomas. The A/B compatibility lab does not replace Wayfinder's decisions or measurement.

When release is requested, create a new immutable experimental GitHub tag/asset at the exact source commit and update consumers through their own PRs/lockfiles. Never replace an existing pinned asset. Package builds, site acceptance, merge and deployment are separate evidence. Do not use the upstream npm publication recipe for an Evident compatibility build; the helper does not publish.

Agent guidance lives in `.agents`; `.claude` aliases it. Keep upstream skills/references recognizable. The imported `cache-components` description has a local YAML quoting repair so parsers can read it; its procedure is unchanged. The sandbox README uses the actual Bun workspace/scripts and no longer points at an absent setup prompt. Oversized imported skills remain upstream references, not a reason to duplicate their bodies into the project router. Existing package-local upstream guidance is retained; new fork guidance belongs here or in the owning package compatibility guide.

Docs-only verification: parse changed frontmatter, resolve touched links and run `git diff --check`. No package installation, release, site database migration or runtime deployment is needed for prose changes.
