"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDelta = computeDelta;
const MAX_LCS_BYTES = 50_000;
const MAX_LCS_LINES = 2000;
/**
 * Compute a minimal diff between the old cached content and the new content.
 * Returns a compact summary + body. Fallbacks to a short marker when the
 * inputs are too large for the LCS table.
 */
function computeDelta(oldContent, newContent) {
    if (oldContent === newContent) {
        return { summary: "+0/-0", body: "(no change)", bytes: 10, fallback: false };
    }
    // Bail out on oversize inputs — LCS is O(n*m) time and space.
    if (oldContent.length > MAX_LCS_BYTES ||
        newContent.length > MAX_LCS_BYTES) {
        return {
            summary: "?/?",
            body: "(content changed; file exceeds delta size budget — full re-read required)",
            bytes: 80,
            fallback: true,
        };
    }
    const a = oldContent.split("\n");
    const b = newContent.split("\n");
    if (a.length > MAX_LCS_LINES || b.length > MAX_LCS_LINES) {
        return {
            summary: "?/?",
            body: "(content changed; file exceeds delta line budget — full re-read required)",
            bytes: 80,
            fallback: true,
        };
    }
    // Standard LCS dynamic programming table.
    const n = a.length;
    const m = b.length;
    const lcs = new Uint16Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                lcs[i * (m + 1) + j] = lcs[(i + 1) * (m + 1) + (j + 1)] + 1;
            }
            else {
                const down = lcs[(i + 1) * (m + 1) + j];
                const right = lcs[i * (m + 1) + (j + 1)];
                lcs[i * (m + 1) + j] = down > right ? down : right;
            }
        }
    }
    // Walk the table to emit diff ops.
    const ops = [];
    let adds = 0;
    let dels = 0;
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            // Skip — omitted from compact output.
            i++;
            j++;
        }
        else if (lcs[(i + 1) * (m + 1) + j] >= lcs[i * (m + 1) + (j + 1)]) {
            ops.push(`- ${a[i]}`);
            dels++;
            i++;
        }
        else {
            ops.push(`+ ${b[j]}`);
            adds++;
            j++;
        }
    }
    while (i < n) {
        ops.push(`- ${a[i]}`);
        dels++;
        i++;
    }
    while (j < m) {
        ops.push(`+ ${b[j]}`);
        adds++;
        j++;
    }
    // Cap diff body so a huge rewrite never blows past our telemetry budget.
    const MAX_OPS = 200;
    let truncatedNote = "";
    let emitted = ops;
    if (ops.length > MAX_OPS) {
        emitted = ops.slice(0, MAX_OPS);
        truncatedNote = `\n... (${ops.length - MAX_OPS} more diff lines truncated)`;
    }
    const body = emitted.join("\n") + truncatedNote;
    return {
        summary: `+${adds}/-${dels}`,
        body,
        bytes: body.length,
        fallback: false,
    };
}
//# sourceMappingURL=delta-diff.js.map