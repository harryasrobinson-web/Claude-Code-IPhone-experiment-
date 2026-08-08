/**
 * v5 Active Compression feature registry for OpenClaw.
 *
 * Mirrors the Python Token Optimizer v5 feature catalog so both plugins
 * speak the same feature identifiers when writing telemetry. Low-risk
 * features (delta read, structure map beta) ship ON by default; higher-risk
 * features stay opt-in. Bash Output Compression, Quality Nudges, and
 * Loop Detection are deferred because the current OpenClaw plugin API
 * does not expose tool-input mutation or session notification hooks.
 *
 * Toggle state is persisted to `~/.openclaw/token-optimizer/v5-features.json`
 * so a gateway restart preserves user choices.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export type V5FeatureId =
  | "delta_read"
  | "structure_map_beta"
  | "quality_nudge"
  | "loop_detection"
  | "bash_compression";

export interface V5Feature {
  id: V5FeatureId;
  label: string;
  description: string;
  defaultEnabled: boolean;
  risk: "low" | "medium" | "high";
  status: "shipped" | "beta" | "deferred";
}

export const V5_FEATURES: Record<V5FeatureId, V5Feature> = {
  delta_read: {
    id: "delta_read",
    label: "Delta Mode",
    description:
      "Serve file reads from an in-memory cache and return a minimal line diff when mtime changes.",
    defaultEnabled: true,
    risk: "low",
    status: "shipped",
  },
  structure_map_beta: {
    id: "structure_map_beta",
    label: "Structure Map Beta",
    description:
      "Return a structural digest for large source files instead of full contents when they repeat within a session.",
    defaultEnabled: true,
    risk: "low",
    status: "beta",
  },
  quality_nudge: {
    id: "quality_nudge",
    label: "Quality Nudges",
    description:
      "Surface a short hint to the session when the quality signal drops sharply between two scored turns.",
    defaultEnabled: false,
    risk: "medium",
    // Deferred: OpenClaw's plugin API does not expose a session-visible
    // notification surface for inline context injection.
    status: "deferred",
  },
  loop_detection: {
    id: "loop_detection",
    label: "Loop Detection",
    description:
      "Flag when the same tool call is repeating with the same arguments inside a single turn.",
    defaultEnabled: false,
    risk: "medium",
    // Deferred: requires the same notification surface as quality_nudge.
    status: "deferred",
  },
  bash_compression: {
    id: "bash_compression",
    label: "Bash Output Compression",
    description:
      "Compress read-only CLI output (git, pytest, lint, docker, etc.) via PreToolUse command rewriting.",
    defaultEnabled: false,
    risk: "medium",
    // Deferred: OpenClaw's current plugin API does not expose a tool-result
    // mutation hook. Reassessed once the upstream hook-mutation RFCs land.
    status: "deferred",
  },
};

const HOME = process.env.HOME ?? process.env.USERPROFILE ?? os.homedir();
const V5_DIR = path.join(HOME, ".openclaw", "token-optimizer");
const V5_STATE_PATH = path.join(V5_DIR, "v5-features.json");

function readState(): Record<string, boolean> {
  try {
    if (!fs.existsSync(V5_STATE_PATH)) return {};
    const raw = fs.readFileSync(V5_STATE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, boolean>;
    }
  } catch {
    // Fail open — a corrupt state file falls back to defaults.
  }
  return {};
}

function writeState(state: Record<string, boolean>): void {
  try {
    fs.mkdirSync(V5_DIR, { recursive: true, mode: 0o700 });
    // Atomic write: tmp-file + rename so a concurrent read from a second
    // CLI invocation never sees a torn/partial JSON blob.
    const tmp = V5_STATE_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    fs.renameSync(tmp, V5_STATE_PATH);
  } catch {
    // Never crash the gateway over a toggle failing to persist.
  }
}

/** Return true if the feature is currently enabled (user state OR default). */
export function isV5Enabled(id: V5FeatureId): boolean {
  const feature = V5_FEATURES[id];
  if (!feature || feature.status === "deferred") return false;
  const state = readState();
  if (id in state) return Boolean(state[id]);
  return feature.defaultEnabled;
}

/** Persist a new enabled/disabled flag for a v5 feature. */
export function setV5(id: V5FeatureId, enabled: boolean): void {
  const feature = V5_FEATURES[id];
  if (!feature || feature.status === "deferred") return;
  const state = readState();
  state[id] = enabled;
  writeState(state);
}

/** Snapshot of every v5 feature and its current (effective) state. */
export function listV5Features(): Array<V5Feature & { enabled: boolean }> {
  return (Object.keys(V5_FEATURES) as V5FeatureId[]).map((id) => ({
    ...V5_FEATURES[id],
    enabled: isV5Enabled(id),
  }));
}

/** True once the plugin has shown the v2.3.0 welcome prompt to this user. */
export function hasSeenWelcome(version: string): boolean {
  const state = readState();
  const marker = `welcome_${version}`;
  return Boolean(state[marker]);
}

export function markWelcomeSeen(version: string): void {
  const state = readState();
  state[`welcome_${version}`] = true;
  writeState(state);
}
