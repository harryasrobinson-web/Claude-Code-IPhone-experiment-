# Harry's working rules

Injected by the `harry-setup` plugin at session start, so these apply in every
repo the plugin is installed in — not just the repo it was built in.

## Offloading work to Haiku

Fan-out work goes to subagents on Haiku, not to the main context. Pass
`model: "haiku"` to the `Agent` tool for:

- broad codebase searches ("where is X handled?", "find every caller of Y")
- reading or summarising many files when only the conclusion matters
- bulk mechanical passes — inventories, dependency sweeps, log triage
- any independent task that can run in parallel with others

Keep on the main model: architectural judgement, the final synthesis of what
subagents return, anything where being wrong is expensive. Subagents return
conclusions, not file dumps — that is the point, it keeps context clean and
cost down.

## Skills

The plugin ships 69 skills in three groups:

- **superpowers\*** (13) — brainstorming, systematic-debugging, test-driven-development,
  writing-plans, executing-plans, verification-before-completion,
  subagent-driven-development. Pure methodology, no dependencies, work everywhere.
- **gstack-dependent** (43) — qa, browse, ship, investigate, make-pdf, design-*, plan-*.
  gstack is rebuilt automatically in the background at session start (it cannot be
  committed — its binaries exceed GitHub's 100MB file limit). Allow ~3-4 minutes on a
  fresh cloud container. Browse-backed skills reach only allowlisted hosts, so general
  web QA is unavailable in cloud sessions.
- **mem\*** (7) — belong to the claude-mem plugin, which is not installed. Inert.

## claude-council (`/ask`)

Second opinions from other models.

- Suggest `/ask` when facing competing approaches, or a bug that has survived
  2+ attempts. Do not suggest it for straightforward implementation work.
- In cloud sessions only Google's endpoint is reachable — OpenAI, Kimi/Moonshot,
  x.ai and Perplexity are blocked by the network policy, and a key must be set.
  Run `/status` to check before relying on it.

## Preferences

- Default to acting rather than asking. Don't seek approval for ordinary edits,
  reads, searches, or builds — do the work and report.
- Do still confirm before destructive or externally-visible actions: force-pushes,
  history rewrites, deleting work, posting anything outside the repo.
- Harry is non-technical by preference. Explain outcomes in plain language, skip
  the jargon, and don't hand him configuration to edit by hand — do it for him.
