import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  throw new Error("Use Cedar Node 24.22.1+ to build this compatibility package.");
}

// Build only SEO: the upstream workspace continues to test its other plugins on v3.
const source = fileURLToPath(new URL("..", import.meta.url));
const stage = mkdtempSync(join(tmpdir(), "evident-focus-seo-payload4-"));
const destination = resolve(process.argv[2] ?? process.cwd());
mkdirSync(destination, { recursive: true });
cpSync(source, stage, {
  recursive: true,
  filter: (path) => !["node_modules", "dist"].includes(path.split("/").at(-1)),
});
cpSync(fileURLToPath(new URL("../../../LICENSE", import.meta.url)), join(stage, "LICENSE"));
const manifestPath = join(stage, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version += "-evident.payload4.3";
Object.assign(manifest.devDependencies, {
  "@payloadcms/next": "4.0.0-beta.5",
  "@payloadcms/richtext-lexical": "4.0.0-beta.5",
  "@payloadcms/ui": "4.0.0-beta.5",
  payload: "4.0.0-beta.5",
  next: "16.4.0",
  react: "19.3.0",
  "react-dom": "19.3.0",
  "@types/react": "19.3.0",
  "@types/react-dom": "19.3.0",
  "lucide-react": "1.56.0",
  jsdom: "26.1.0",
  "@testing-library/react": "16.3.0",
  "@testing-library/jest-dom": "6.6.3",
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Standalone build and tests: ${stage}`);
for (const [command, args] of [
  ["bun", ["install"]],
  ["bun", ["run", "build"]],
  ["npm", ["pack", "--ignore-scripts", "--pack-destination", destination]],
]) {
  const result = spawnSync(command, args, { cwd: stage, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
