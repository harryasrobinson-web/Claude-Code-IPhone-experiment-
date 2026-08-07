/**
 * Minimal line-diff for Delta Mode (Token Optimizer v5).
 *
 * Hand-rolled because the plan requires zero new dependencies. Uses a
 * standard LCS table walk to emit a "compact" diff:
 *   - Lines that appear in both files are omitted.
 *   - Deletions prefixed with "- "
 *   - Insertions prefixed with "+ "
 *   - A short header with the total +N/-N counts.
 *
 * Designed for small payloads (<50KB of cached content). On larger inputs
 * it falls back to a "file changed, full re-read" marker so the LCS table
 * does not blow up on pathological cases.
 */
export interface DeltaResult {
    /** "+N/-M" summary counts. */
    summary: string;
    /** Textual diff body (compact unified-style). */
    body: string;
    /** Total bytes written (body.length). */
    bytes: number;
    /** True when LCS bailed out and we produced a fallback marker instead. */
    fallback: boolean;
}
/**
 * Compute a minimal diff between the old cached content and the new content.
 * Returns a compact summary + body. Fallbacks to a short marker when the
 * inputs are too large for the LCS table.
 */
export declare function computeDelta(oldContent: string, newContent: string): DeltaResult;
//# sourceMappingURL=delta-diff.d.ts.map