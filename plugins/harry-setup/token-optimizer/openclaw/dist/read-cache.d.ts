/**
 * Token Optimizer - Read Cache for OpenClaw.
 *
 * Intercepts Read tool calls via agent:tool:before events to detect redundant reads.
 * Default ON (warn mode). Opt out via TOKEN_OPTIMIZER_READ_CACHE=0 env var
 * or config.json {"read_cache_enabled": false}.
 *
 * Modes:
 *   warn  (default) - logs redundant read, does NOT block
 *   block           - returns digest instead of re-reading
 *
 * Security:
 *   - Path canonicalization via path.resolve()
 *   - 0o600 permissions on cache files
 *   - mtime re-verification on every cache hit
 *   - Binary file skip
 *   - .contextignore support (hard block)
 */
/**
 * Drop every delta cache entry for a session. Exported so index.ts can
 * wire this into agent:stop / session:end events if OpenClaw ever exposes
 * them. Safe to call on an unknown sessionId (no-op).
 */
export declare function clearDeltaCacheForSession(sessionId: string): void;
export interface ReadToolInput {
    file_path?: string;
    offset?: number;
    limit?: number;
}
export interface ToolEventData {
    toolName: string;
    toolInput: ReadToolInput;
    agentId: string;
    sessionId: string;
}
export declare function handleReadBefore(event: ToolEventData): {
    block: boolean;
    message: string;
} | null;
/**
 * Handle agent:tool:after for Edit/Write events (cache invalidation).
 */
export declare function handleWriteAfter(event: ToolEventData): void;
/**
 * Clear all caches (called on compact).
 */
export declare function clearCache(agentId: string, sessionId: string): void;
//# sourceMappingURL=read-cache.d.ts.map