# Evident Payload 4 A/B compatibility trial

Based on FocusReactive `b645ef0c849e8390f0b0bca91885580e1fc6a36c`, in the same fork as the accepted SEO port. This package is tested on Payload/UI **4.0.0-beta.2**, Next **16.4.0**, React **19.3.0**, Node **24.15.0**. Later betas require another test.

## Maintained delta

- Admit the exact tested Payload/UI beta in peer ranges and matching workspace lock metadata. Keep the upstream v3 development stack and semantic-release version.
- Pass the configured collection, slug and display-name fields into the existing variants panel, so non-default fields work through its duplicate/edit UI.
- Require authentication and a configured collection at the duplicate endpoint. Use the server's slug-field configuration, native write access and request identity. Create variants as drafts so duplication alone does not assign traffic; publishing remains explicit. Preserve native access-error status.

The allocation algorithm, cookie selection, manifest format, analytics implementation and statistics remain upstream-owned. No Cedar business schema belongs in this fork.

## Build and verify

With the actual Node 24.15+ executable and Bun on PATH:

```sh
node packages/payload-plugin-ab/scripts/pack-payload4.mjs /absolute/output/directory
```

The helper stages only A/B, includes the upstream license, pins the tested host dependencies, builds JS/declarations and packs `2.10.1-evident.payload4.1`. Its suffix changes only the staged manifest; upstream source versions stay semantic-release-owned. It does not publish to npm or run the monorepo release workflow.

Stock v3 and unmodified v4 both build and pass **48/48 tests**. The four new public-plugin regression checks first fail on stock source, then the patched v3 and v4 builds both pass **52/52**. No tests are deleted or relaxed. The workspace lock validates in frozen mode. Cedar's real editor/renderer, native migrations and browser assignment acceptance are recorded separately in its A/B trial document; a package build alone is insufficient.

## Upstream updates

Fetch `upstream/main` and review the three small source changes above when merging updates into the Evident fork. Rebuild, compare stock/patched tests, then run Cedar's `verify:ab` against the built release asset. Every accepted package gets a new immutable experimental tag/asset, exact source commit and application lock integrity. Never replace an existing pinned tarball. Preserve the existing SEO pin and compatibility patch.
