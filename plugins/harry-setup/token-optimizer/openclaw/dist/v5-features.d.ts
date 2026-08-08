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
export type V5FeatureId = "delta_read" | "structure_map_beta" | "quality_nudge" | "loop_detection" | "bash_compression";
export interface V5Feature {
    id: V5FeatureId;
    label: string;
    description: string;
    defaultEnabled: boolean;
    risk: "low" | "medium" | "high";
    status: "shipped" | "beta" | "deferred";
}
export declare const V5_FEATURES: Record<V5FeatureId, V5Feature>;
/** Return true if the feature is currently enabled (user state OR default). */
export declare function isV5Enabled(id: V5FeatureId): boolean;
/** Persist a new enabled/disabled flag for a v5 feature. */
export declare function setV5(id: V5FeatureId, enabled: boolean): void;
/** Snapshot of every v5 feature and its current (effective) state. */
export declare function listV5Features(): Array<V5Feature & {
    enabled: boolean;
}>;
/** True once the plugin has shown the v2.3.0 welcome prompt to this user. */
export declare function hasSeenWelcome(version: string): boolean;
export declare function markWelcomeSeen(version: string): void;
//# sourceMappingURL=v5-features.d.ts.map