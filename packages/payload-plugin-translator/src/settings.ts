import { TranslatorConfigError } from "./core/errors/index.js";
import { normalizePath } from "./server/shared/index.js";

import type { TargetSelectionMode } from "./types/TargetSelection.js";

/**
 * The plugin options that resolve to a value rather than wire a dependency. They are declared here,
 * beside the resolved shape and the defaults, so one setting is one place to edit.
 * {@link TranslatorPluginConfig} composes them into the public option type.
 */
export type TranslatorSettingsOptions = {
  /**
   * Base path for all translation API endpoints.
   * Useful to avoid conflicts with existing routes.
   * @example '/my-translate' results in '/my-translate/enqueue', '/my-translate/run/:id', etc.
   * @default '/translate'
   */
  basePath?: string;
  /**
   * How far back (ms) the collection panel counts failures. Work still in flight is listed however
   * old.
   * @default 259200000 (3 days)
   * @since 0.17.0
   */
  failedWindowMs?: number;
  /**
   * How the target-language field behaves in the translation forms. `'single'` (default) keeps
   * today's one-locale-per-run behaviour, byte-identical. `'multi'` renders a compact multi-select so
   * an editor can queue several target locales in one run — the run fans out one translation per
   * `(document × target locale)`. Opt-in and fully backward-compatible; no schema, no migration.
   * @default 'single'
   * @since 0.10.0
   */
  targetSelection?: TargetSelectionMode;
  /**
   * Where switches for behaviour on its way to becoming the default live. The option itself is
   * permanent; each **entry** is deprecated the day it ships, because it exists only so you can
   * adopt a change early and the next major removes the switch, not the behaviour.
   *
   * @since 0.13.0
   */
  experimental?: {
    /**
     * Translate each rich-text container (paragraph, heading, list item) as one string with
     * numbered inline marks, instead of node by node.
     *
     * Requires a provider declaring `capabilities.inlineMarks`; without one the plugin keeps
     * translating node by node. A container whose reply comes back with damaged marks is left in
     * its source language rather than half-written.
     *
     * Turning it back off stops future translations from splitting wrappers; documents already
     * translated under it stay split. And the next major removes the flag itself, so it is a
     * schedule, not a permanent safety valve.
     *
     * @default false
     * @deprecated Transitional. Removed in the next major, when this becomes the only mode.
     * @see docs/DEPRECATIONS.md#experimental-inline-marks — why this exists and when it goes
     */
    inlineMarks?: boolean;
  };
};

/**
 * {@link TranslatorSettingsOptions} after defaults and normalisation, as every layer below
 * `plugin.ts` sees them. The levels, the route bundle and the admin panel read these; the layers
 * between relay the whole value without naming a field.
 */
export type TranslatorSettings = {
  basePath: string;
  failedWindowMs: number;
  targetSelection: TargetSelectionMode;
  inlineMarks: boolean;
};

export const DEFAULT_BASE_PATH = "/translate";
export const DEFAULT_FAILED_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
export const DEFAULT_TARGET_SELECTION: TargetSelectionMode = "single";

const failedWindowOf = (failedWindowMs: number | undefined): number => {
  const resolved = failedWindowMs ?? DEFAULT_FAILED_WINDOW_MS;
  if (!Number.isFinite(resolved) || resolved < 0) {
    throw new TranslatorConfigError(
      `[payload-plugin-translator] failedWindowMs must be a non-negative finite number (got ${resolved})`
    );
  }
  return resolved;
};

export const resolveSettings = (options: TranslatorSettingsOptions): TranslatorSettings => ({
  basePath: normalizePath(options.basePath ?? DEFAULT_BASE_PATH),
  failedWindowMs: failedWindowOf(options.failedWindowMs),
  targetSelection: options.targetSelection ?? DEFAULT_TARGET_SELECTION,
  inlineMarks: options.experimental?.inlineMarks === true,
});
