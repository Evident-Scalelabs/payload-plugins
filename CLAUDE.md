# Payload plugin fork

Read [docs/EVIDENT_FORK.md](docs/EVIDENT_FORK.md) first. `origin` is `Evident-Scalelabs/payload-plugins`; `upstream` is FocusReactive. This workspace remains on Payload 3. Selected SEO/A/B compatibility builds use each package's `PAYLOAD4.md` and `pack-payload4.mjs`, producing immutable assets consumed by the sites. Site schemas, content and Wayfinder decisioning remain outside this fork.

Use a task-owned worktree from current `origin/main` and a PR to `main`. Follow the user's requested merge/release scope. A documentation change does not authorize publishing a compatibility asset or an upstream npm package.

## Source owners

- `packages/payload-plugin-*/`: plugin implementation; read its local guidance and compatibility contract when relevant.
- `apps/dev/`: minimal plugin sandbox. `apps/cms/`: reference CMS with Postgres/migrations and its own [data access boundary](apps/cms/src/lib/dal/README.md).
- `package.json`, `bunfig.toml` and `turbo.json`: workspace commands, overrides and build graph. `tsgo` owns `check-types`; Ultracite owns lint/format; Lefthook installs through `prepare`.
- `.agents/skills/` and `.agents/agents/`: instruction sources. `.claude/skills/` and `.claude/agents/` contain relative symlinks into `.agents`, so worktree discovery stays portable. Keep new project guidance here or at its existing owner; preserve imported package-local material.

## Bun layout

`bunfig.toml` uses the hoisted linker. Plugins share peer dependencies (`next`, `payload`); isolated duplicate installations create incompatible TypeScript identities. Keep the root package overrides and actual lockfile aligned rather than copying dependency versions into guidance.

## Commands and verification

```bash
bun install
bun run build
bunx turbo run build --filter='./packages/*'
bun run lint
```

For a compatibility change, use the owning package's Payload 4 build/check procedure and verify the real site consumer. Docs-only changes check touched links/frontmatter and `git diff --check`; they need no package install.

## Release ownership

[The fork guide](docs/EVIDENT_FORK.md) owns immutable experimental tags/assets. The retained [upstream publishing recipe](https://github.com/Evident-Scalelabs/payload-plugins/blob/e03a789db8dd8fdeeced4beccdae996442a5de68/CLAUDE.md#publishing-flow) describes a separate npm/semantic-release lane; load it only for an explicitly requested upstream release. Preserve upstream package ownership metadata, licenses and provenance. Do not infer publishing authority from a generic release command.
