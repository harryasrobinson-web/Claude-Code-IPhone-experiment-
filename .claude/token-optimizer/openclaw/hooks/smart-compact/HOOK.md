---
name: smart-compact
description: Protect session state across OpenClaw compaction events
metadata:
  openclaw:
    emoji: "\U0001F4BE"
    events:
      - session:compact:before
      - session:compact:after
    requires:
      bins:
        - node
---

# Smart Compaction Hook

Automatically captures session state before OpenClaw compacts context, and restores it after.

## Events

- **session:compact:before**: Captures session state via intelligent extraction (decisions, errors, instructions, active tasks, modified files). Falls back to raw last-20-messages if extraction fails.
- **session:compact:after**: Restores the checkpoint into context with injection mitigation framing.

## Storage

Checkpoints saved to `~/.openclaw/token-optimizer/checkpoints/{sessionId}/`

Progressive checkpoints fire at context fill bands (20%, 35%, 50%, 65%, 80%) and quality thresholds (80, 70, 50, 40). Old checkpoints (>7 days) are cleaned up on gateway startup.
