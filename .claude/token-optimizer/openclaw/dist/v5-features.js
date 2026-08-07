"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.V5_FEATURES = void 0;
exports.isV5Enabled = isV5Enabled;
exports.setV5 = setV5;
exports.listV5Features = listV5Features;
exports.hasSeenWelcome = hasSeenWelcome;
exports.markWelcomeSeen = markWelcomeSeen;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
exports.V5_FEATURES = {
    delta_read: {
        id: "delta_read",
        label: "Delta Mode",
        description: "Serve file reads from an in-memory cache and return a minimal line diff when mtime changes.",
        defaultEnabled: true,
        risk: "low",
        status: "shipped",
    },
    structure_map_beta: {
        id: "structure_map_beta",
        label: "Structure Map Beta",
        description: "Return a structural digest for large source files instead of full contents when they repeat within a session.",
        defaultEnabled: true,
        risk: "low",
        status: "beta",
    },
    quality_nudge: {
        id: "quality_nudge",
        label: "Quality Nudges",
        description: "Surface a short hint to the session when the quality signal drops sharply between two scored turns.",
        defaultEnabled: false,
        risk: "medium",
        // Deferred: OpenClaw's plugin API does not expose a session-visible
        // notification surface for inline context injection.
        status: "deferred",
    },
    loop_detection: {
        id: "loop_detection",
        label: "Loop Detection",
        description: "Flag when the same tool call is repeating with the same arguments inside a single turn.",
        defaultEnabled: false,
        risk: "medium",
        // Deferred: requires the same notification surface as quality_nudge.
        status: "deferred",
    },
    bash_compression: {
        id: "bash_compression",
        label: "Bash Output Compression",
        description: "Compress read-only CLI output (git, pytest, lint, docker, etc.) via PreToolUse command rewriting.",
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
function readState() {
    try {
        if (!fs.existsSync(V5_STATE_PATH))
            return {};
        const raw = fs.readFileSync(V5_STATE_PATH, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed;
        }
    }
    catch {
        // Fail open — a corrupt state file falls back to defaults.
    }
    return {};
}
function writeState(state) {
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
    }
    catch {
        // Never crash the gateway over a toggle failing to persist.
    }
}
/** Return true if the feature is currently enabled (user state OR default). */
function isV5Enabled(id) {
    const feature = exports.V5_FEATURES[id];
    if (!feature || feature.status === "deferred")
        return false;
    const state = readState();
    if (id in state)
        return Boolean(state[id]);
    return feature.defaultEnabled;
}
/** Persist a new enabled/disabled flag for a v5 feature. */
function setV5(id, enabled) {
    const feature = exports.V5_FEATURES[id];
    if (!feature || feature.status === "deferred")
        return;
    const state = readState();
    state[id] = enabled;
    writeState(state);
}
/** Snapshot of every v5 feature and its current (effective) state. */
function listV5Features() {
    return Object.keys(exports.V5_FEATURES).map((id) => ({
        ...exports.V5_FEATURES[id],
        enabled: isV5Enabled(id),
    }));
}
/** True once the plugin has shown the v2.3.0 welcome prompt to this user. */
function hasSeenWelcome(version) {
    const state = readState();
    const marker = `welcome_${version}`;
    return Boolean(state[marker]);
}
function markWelcomeSeen(version) {
    const state = readState();
    state[`welcome_${version}`] = true;
    writeState(state);
}
//# sourceMappingURL=v5-features.js.map