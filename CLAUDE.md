# Working rules

Ported from Harry's PC Claude Code setup. Lives in the repo so every cloud
session (phone/web) picks it up on clone — `~/.claude` does not travel.

## Skills

`.claude/skills/` holds 69 skills. They split into three groups:

- **superpowers\*** (13) — brainstorming, systematic-debugging, test-driven-development,
  writing-plans, executing-plans, verification-before-completion, subagent-driven-development,
  and friends. Pure methodology, no dependencies. **These work everywhere.**
- **gstack-dependent** (43) — qa, browse, ship, investigate, make-pdf, design-*, plan-*, etc.
  They shell out to `~/.claude/skills/gstack/bin/*`, which is **not installed**.
  Run `/gstack-upgrade` or see SETUP-NOTES.md before relying on them.
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

## Preferences

- Default to acting rather than asking. Don't seek approval for ordinary edits,
  reads, searches, or builds — just do the work and report.
- Do still confirm before destructive or externally-visible actions: force-pushes,
  history rewrites, deleting work, posting anything outside this repo.
