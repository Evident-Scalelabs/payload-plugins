# Evident Payload 4 SEO compatibility trial

Based on FocusReactive `main` at `b645ef0c84` (19 October 2026). This fork evaluates **SEO only** for Cedar Valley. Other packages retain their upstream configuration and are not certified for Payload 4.

The tested host is Payload / `@payloadcms/*` **4.0.0-beta.2**, Next **16.4.0**, React **19.3.0**, Lucide **1.56.0**, Node **24.15.0**. The peer range admits this exact Payload beta; later betas need a new test before widening it.

## Maintained changes

- Admit the tested Payload beta, Next 16 and Lucide 1 in SEO peer dependencies and workspace lock metadata. Keep upstream's v3 development stack and semantic-release version unchanged.
- Use a native accessible toolbar button. Payload 4 removed the old `Button` style, size and icon options; the existing label, icon, CSS and drawer action remain.
- Allow an optional `resolveTitle(values)` property on the existing content extractor. Hosts can share their rendered title calculation with unsaved-form analysis without storing synthetic fields. Existing extractors retain their behavior.
- Strip a leading slash from the configured slug before analysis/preview. Cedar stores full local paths, which otherwise produce `https://site//path` in search previews.

The analysis engine, scoring rules, collections, endpoints and publication behavior are unchanged. Cedar owns its content extractor. Do not move Cedar-specific schema or rendering logic into this fork.

## Build a pinned package

From the repository root, using the actual Node 24.15+ executable and Bun:

```sh
node packages/payload-plugin-seo/scripts/pack-payload4.mjs /absolute/output/directory
```

The helper stages only SEO in a temporary directory, pins its build dependencies to the tested host, includes the upstream license, builds JavaScript/CSS/declarations and packs `1.10.1-evident.payload4.2`. It prints the staging directory so `bun run test` can run there. The suffix is applied only to the staged package; upstream source versions remain semantic-release-owned. It does not publish to npm or run the monorepo release workflow.

Publish the resulting tarball as an experimental GitHub release on the Evident fork, tagged at the exact source commit. Cedar pins the release asset URL; its npm lockfile records the tarball integrity. A raw GitHub dependency points at the monorepo root and does not provide this built subpackage.

## Verification and known upstream failures

- Patched SEO builds JavaScript, isolated CSS and TypeScript declarations against both Payload 3.90.1 and 4.0.0-beta.2.
- Stock Payload 3 passes **357/362 tests**; patched Payload 4 passes **358/363**, including the new unsaved-title regression test, with the same five failures: ScoreBadge color class, keyphrase-density detail, zero-subheading detail, inclusive-category grouping and description-length gauge bands. No test was deleted or relaxed. Standalone tests need the jsdom/testing-library dependencies normally hoisted from the upstream workspace; the helper supplies them.
- The upstream workspace lock validates with frozen-lockfile mode.
- Cedar's application and browser acceptance are recorded in its `docs/FOCUSREACTIVE_SEO.md`. A package build alone is not editor/runtime acceptance.

## Taking upstream updates

Keep `upstream` pointed at `https://github.com/focusreactive/payload-plugins.git`. Fetch and merge upstream into the task-owned compatibility branch, reviewing the small runtime changes above. Rebuild the tarball, compare the stock/patched tests, and run Cedar's `verify:seo` against the new asset before changing its pin. Create a new release tag and asset for every accepted build; do not replace an existing pinned tarball.
