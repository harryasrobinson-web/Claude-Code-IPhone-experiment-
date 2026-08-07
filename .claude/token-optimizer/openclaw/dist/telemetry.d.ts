/**
 * v5 compression event telemetry for OpenClaw.
 *
 * Schema matches the Python `compression_events` SQLite table shape so the
 * two plugins can be reasoned about side-by-side, but OpenClaw writes to an
 * append-only JSONL file under `~/.openclaw/token-optimizer/` to avoid
 * pulling in a native SQLite dependency. Each plugin owns its own data file;
 * there is no cross-plugin read path.
 */
export interface CompressionEvent {
    timestamp: string;
    session_id: string | null;
    feature: string;
    command_pattern: string | null;
    original_tokens: number;
    compressed_tokens: number;
    compression_ratio: number;
    quality_preserved: 0 | 1;
    verified: 0 | 1;
    detail: string | null;
}
export interface CompressionFeatureSummary {
    events: number;
    original_tokens: number;
    compressed_tokens: number;
    tokens_saved: number;
    avg_ratio: number;
}
export interface CompressionSummary {
    total_events: number;
    total_original_tokens: number;
    total_compressed_tokens: number;
    total_tokens_saved: number;
    overall_ratio: number;
    by_feature: Record<string, CompressionFeatureSummary>;
    period_days: number;
}
export interface LogCompressionEventInput {
    feature: string;
    sessionId?: string | null;
    commandPattern?: string | null;
    originalText?: string;
    compressedText?: string;
    originalTokens?: number;
    compressedTokens?: number;
    qualityPreserved?: boolean;
    verified?: boolean;
    detail?: string | null;
}
/**
 * Append one compression event to the telemetry log. Never throws —
 * returns true on success, false on any failure. Callers should ignore
 * the return value unless they genuinely need to branch on it.
 */
export declare function logCompressionEvent(input: LogCompressionEventInput): boolean;
/** Read events from the telemetry log within the given window. */
export declare function readRecentEvents(days: number): CompressionEvent[];
/** Summary equivalent of Python's `_get_compression_summary`. */
export declare function getCompressionSummary(days?: number): CompressionSummary;
/** Prune events older than `days`. Used by a background maintenance task.
 *
 * Atomic replace via tmp-file + rename so a concurrent `logCompressionEvent`
 * append during the prune window lands either in the pre-prune file (and
 * gets replaced) or against the post-prune file (and survives). Without
 * the atomic swap, an append that races with the read-filter-writeFileSync
 * sequence would be silently dropped.
 */
export declare function pruneOldEvents(days?: number): number;
//# sourceMappingURL=telemetry.d.ts.map