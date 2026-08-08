# Codex quality-aware continuity

## Problem

Codex balanced hooks avoid noisy per-tool hook rows, but that left a parity gap with the Claude version:

- Checkpoints could preserve task state, but not enough context-quality metadata to explain why a checkpoint mattered.
- Important tool results were archived by Claude `PostToolUse`, while Codex balanced mode did not archive them.
- New Codex sessions could know that a checkpoint existed, but they did not inject a topic-relevant hint before the user resumed a specific thread of work.
- The fill-quality curve was Anthropic-shaped even when Codex logs showed GPT-5.5 model metadata.

## Solution

- Add OpenAI/GPT-5-family long-context calibration to the context-fill signal while leaving the six behavioral quality signals intact.
- Enrich `compact_capture` checkpoints with context quality, weakest signals, model/window metadata, topic, and archived tool-result pointers.
- Backfill large or high-signal Codex tool outputs from JSONL during the throttled Stop worker into the same archive and SQLite `SessionStore` used by Claude hooks.
- Add `codex_prompt_hints()` so `UserPromptSubmit` can inject a short, relevance-scored prior-session hint when the prompt matches a checkpoint topic.
- Make `codex-doctor` recognize standalone installed Codex skills so chat-first dogfood flows do not report false plugin-repo failures.

## Guardrails

- Backfill is bounded by Codex JSONL parser limits, output count, output size cap, Stop worker lock, and the existing 20s wall-clock budget.
- Topic hints are short, explicitly marked as recovered data, and gated by relevance scoring.
- Same-session compact recovery remains separate from cross-session topic hints.
- Tool hooks stay opt-in for telemetry/aggressive profiles; balanced mode gets durable pointers without per-tool hook noise.

## Verification

- `python3 -m py_compile` for changed scripts.
- `TOKEN_OPTIMIZER_RUNTIME=codex python3 skills/token-optimizer/scripts/measure.py quality current --json`
- `TOKEN_OPTIMIZER_RUNTIME=codex python3 skills/token-optimizer/scripts/measure.py codex-doctor --project . --json`
- Installed skill dogfood check with `~/.codex/skills/token-optimizer/scripts/measure.py codex-doctor --project . --json`.
