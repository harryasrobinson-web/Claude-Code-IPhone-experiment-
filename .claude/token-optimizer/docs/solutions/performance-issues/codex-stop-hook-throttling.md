---
title: Codex Stop Hook Refresh Throttling
category: performance-issues
component: token-optimizer-codex
runtime: codex
severity: high
verified: true
---

# Codex Stop Hook Refresh Throttling

## Problem

The balanced Codex hook profile needs hooks on by default, but Codex Desktop can fire `Stop` often. Running full session collection, dashboard generation, and checkpoint capture on every `Stop` can produce visible CPU spikes even when the hook itself returns quickly.

## Root Cause

`session-end-flush --defer` correctly detached heavy work from the visible hook row, but the worker still did all expensive work every time:

- `collect_sessions(days=90)`
- `generate_standalone_dashboard(days=30)`
- `compact_capture(trigger=...)`

This avoided hook timeouts but not background CPU churn.

## Fix

The Codex worker now has two safeguards:

- A single-worker lock at `~/.codex/_backups/token-optimizer/.session-end-flush.lock` prevents overlapping workers.
- A 120-second refresh throttle skips full collect/dashboard/checkpoint work when a recent worker already refreshed local data.
- A 20-second wall-clock budget prevents pathological filesystem or parsing cases from running indefinitely.

## Verification

Run the actual installed hook commands from `.codex/hooks.json` with a representative hook payload:

```bash
python3 - <<'PY'
import json, subprocess, time
from pathlib import Path

hooks = json.loads(Path(".codex/hooks.json").read_text())["hooks"]
payload = json.dumps({"session_id": "qa_actual_hook_probe", "source": "startup", "transcript_path": ""}) + "\n"

for event, groups in hooks.items():
    for gi, group in enumerate(groups):
        for hi, hook in enumerate(group.get("hooks", [])):
            start = time.perf_counter()
            proc = subprocess.run(hook["command"], input=payload, text=True, capture_output=True, shell=True, timeout=6)
            elapsed = time.perf_counter() - start
            print(f"{event}[{gi}].hooks[{hi}] rc={proc.returncode} elapsed={elapsed:.3f}s stdout={len(proc.stdout)} stderr={len(proc.stderr)}")
            assert proc.returncode == 0
            assert not proc.stderr.strip()
PY
```

Expected result:

- `SessionStart` completes in under 1 second.
- `UserPromptSubmit` completes in about 1 second or less.
- `Stop` returns in under 1 second.
- No lingering `session-end-flush-worker` process remains after the throttle path.

## Prevention

Default Codex hooks should stay balanced, not aggressive:

- Enable `SessionStart`, `UserPromptSubmit`, and `Stop` by default.
- Keep `PreToolUse` and `PostToolUse` profiles opt-in because Codex Desktop shows those hook rows and current Codex tool-level payload support is incomplete.
- Any hook that can parse session history or rebuild dashboard files needs both a lock and a wall-clock budget.
