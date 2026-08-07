/**
 * Drift Detection for OpenClaw.
 *
 * Snapshots the OpenClaw config at a point in time.
 * Later, diffs against current state to catch config creep.
 */
export interface ConfigSnapshot {
    capturedAt: string;
    skillCount: number;
    agentCount: number;
    cronCount: number;
    soulMdSize: number;
    memoryMdSize: number;
    agentsMdSize: number;
    toolsMdSize: number;
    modelConfig: string;
    skills: string[];
    agents: string[];
}
export interface DriftReport {
    hasDrift: boolean;
    snapshotDate: string;
    changes: DriftChange[];
}
export interface DriftChange {
    component: string;
    type: "added" | "removed" | "changed";
    details: string;
}
export declare function captureSnapshot(openclawDir: string): string;
export declare function detectDrift(openclawDir: string): DriftReport;
//# sourceMappingURL=drift.d.ts.map