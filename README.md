# Harry's Claude Code setup

This repo is a **Claude Code plugin marketplace**. It serves one plugin,
`harry-setup`, containing 69 skills, 6 commands, the working rules, and an
automatic gstack rebuild for cloud sessions.

## Using it in a new project

Ask Claude to "set up my usual tooling in this repo". It runs one script:

```bash
bash plugins/harry-setup/scripts/seed-project.sh /path/to/your/repo
```

That writes a ~1KB `.claude/settings.json` into the target repo naming this
marketplace. Nothing is copied — the plugin installs itself from GitHub at
session start. A repo needs only that one small file, not 13MB of skills.

To do it by hand instead:

```bash
claude plugin marketplace add harryasrobinson-web/Claude-Code-IPhone-experiment-
claude plugin install harry-setup@harry-marketplace
```

## What you get

| | |
|---|---|
| **13 superpowers skills** | brainstorming, systematic-debugging, TDD, writing/executing plans, verification-before-completion, subagent-driven-development. No dependencies — work everywhere. |
| **43 gstack skills** | `/qa`, `/investigate`, `/ship`, `/spec`, `/office-hours`, `/make-pdf`, design and plan reviews. Rebuilt automatically in the background at session start (~3-4 min on a fresh container). |
| **6 commands** | `/ask`, `/status`, token-optimizer tools. |
| **Working rules** | Injected each session — Haiku fan-out policy, when to reach for `/ask`, act-don't-ask preferences. |

Always-on context cost: **~9,400 tokens** per session. Individual skills load
only when invoked.

## Layout

```
.claude-plugin/marketplace.json     the marketplace manifest
plugins/harry-setup/                the plugin — single source of truth
  .claude-plugin/plugin.json
  RULES.md                          injected at session start
  skills/        (69)
  commands/      (6)
  hooks/                            SessionStart: rules + gstack rebuild
  scripts/
    bootstrap-gstack.sh             rebuilds gstack in ephemeral containers
    seed-project.sh                 points a new repo at this marketplace
.claude/settings.json               makes this repo use its own plugin
```

Edit the setup under `plugins/harry-setup/`. Bump the version in **both**
`plugin.json` and `marketplace.json` — `claude plugin validate .` checks they agree.

## Known limits in cloud sessions

- `/ask` needs a Gemini API key; OpenAI, Kimi, x.ai and Perplexity are network-blocked.
- Browse-backed skills reach only allowlisted hosts, so general web QA is unavailable.
- claude-mem is not included; its memory would not survive an ephemeral container.

See `SETUP-NOTES.md` for the full account.
