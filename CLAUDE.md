# Working rules

Ported from Harry's PC Claude Code setup. Lives in the repo so every cloud
session (phone/web) picks it up on clone — `~/.claude` does not travel.

## Skills

`.claude/skills/` holds 69 skills. They split into three groups:

- **superpowers\*** (13) — brainstorming, systematic-debugging, test-driven-development,
  writing-plans, executing-plans, verification-before-completion, subagent-driven-development,
  and friends. Pure methodology, no dependencies. **These work everywhere.**
- **gstack-dependent** (43) — qa, browse, ship, investigate, make-pdf, design-*, plan-*, etc.
  gstack builds cleanly here but **cannot be committed** (its binaries exceed GitHub's
  100MB file limit). Rebuild it in a fresh session with `bash .claude/bootstrap-gstack.sh`
  (~3-4 min, idempotent). Until that runs, these skills are inert.
  Browse-backed skills reach only allowlisted hosts — general web QA is unavailable.
- **mem\*** (7) — belong to the claude-mem plugin, which is not installed here.

## Vault

Persistent notes live at `.claude/vault/` (in-repo, so it survives session teardown).

- At the start of a multi-session or architectural task, read `.claude/vault/index.md`.
- Link new notes with `[[backlinks]]` and add an entry to `index.md`.
- Log decisions and outcomes to `.claude/vault/session-log.md`.
- Name files kebab-case: `decision-auth-strategy.md`.

## claude-council (`/ask`)

Queries other models for a second opinion on hard calls.

- Suggest `/ask` when facing competing approaches, or a bug that has survived 2+ attempts.
- Do not suggest it for straightforward implementation work.
- **In cloud sessions only Google's endpoint is reachable** — OpenAI, Kimi/Moonshot,
  x.ai and Perplexity are blocked by the environment's network policy, and no API key
  is configured. `/ask` will not work until a key is added. Run `/status` to check.

## Offloading work to Haiku

Fan-out work goes to subagents on Haiku, not to the main context. Pass
`model: "haiku"` to the `Agent` tool for:

- broad codebase searches ("where is X handled?", "find every caller of Y")
- reading or summarising many files when only the conclusion matters
- bulk mechanical passes — inventories, dependency sweeps, log triage
- any independent task that can run in parallel with others

Keep on the main model: architectural judgement, the final synthesis of what
subagents return, anything where being wrong is expensive. Subagents return
conclusions, not file dumps — that is the point, it keeps this context clean
and the cost down.

Kimi was the original intent here but is unreachable from cloud sessions (every
Moonshot endpoint is refused at the proxy). On the PC, use `/ask --providers=kimi`
instead. See SETUP-NOTES.md.

## Preferences

- Default to acting rather than asking. Don't seek approval for ordinary edits,
  reads, searches, or builds — just do the work and report.
- Do still confirm before destructive or externally-visible actions: force-pushes,
  history rewrites, deleting work, posting anything outside this repo.
