# Starter-pack port — what landed, what didn't

`claude-starter-pack.zip` was built on Windows for a Windows `~/.claude`.
This repo is cloned into an **ephemeral Linux container** on each cloud session.
Anything written to `~/.claude` here is destroyed when the container is reclaimed,
so the pack was ported **into the repo** instead — that's the only thing that persists.

## Working

| Component | Notes |
|---|---|
| `.claude/skills/` (69) | Copied verbatim. The 13 `superpowers*` skills are fully functional. |
| `.claude/commands/` (6) | Windows paths rewritten to `${CLAUDE_PROJECT_DIR:-.}/.claude/...`. |
| `.claude/settings.json` | Rewritten — see below. Validated as JSON. |
| `CLAUDE.md` | Adapted to what's actually present. |
| `.claude/vault/` | Created fresh (Stage 4 of the bootstrap prompt). Moved into the repo so it survives. |
| exec bits | The Windows zip stripped them; restored on 54 scripts. |

## Not working / not installed

| Component | Why |
|---|---|
| **All hooks** | Every hook path was `C:\Users\\YOUR_USERNAME\.claude\...`. On Linux all 30+ fail — on every prompt and every tool call. Stripped rather than shipped broken. |
| **gstack** | Excluded from the pack by design; 43 skills depend on it. Repo *is* reachable (`github.com/garrytan/gstack`) so it can be installed, but its binaries are large and machine-specific — and would not survive session teardown unless committed. |
| **claude-council** | Needs API keys (placeholders only). Of its five providers, only `generativelanguage.googleapis.com` is reachable; OpenAI, Moonshot/Kimi, x.ai, Perplexity are blocked by the network policy. |
| **token-optimizer** | Files ported, but it is hook-driven — inert without the hooks above. |
| **claude-mem** | Never in the pack (installed via marketplace at Stage 3). Runs a node worker on `localhost:37777`; its memory would not persist across containers anyway. |
| **graphify** | **Not installed deliberately** — see below. |

## Two things worth your attention

**1. `graphifyy` (Stage 6b).** The bootstrap prompt says to `pip install graphifyy`
and flags "note the package name has a double y", while `CLAUDE.md` and the hooks call
plain `graphify`. A package whose name is a near-miss of the tool it claims to be, with
the discrepancy called out as a quirk, is the shape of a typosquat. PyPI *is* reachable
from here, and the old hooks ran `python -m graphify update .` automatically after every
file edit — so a bad package would execute unattended. I did not install it. Worth
verifying against the real project before anyone runs that line.

**2. Permission settings not carried over.** The original set
`"defaultMode": "bypassPermissions"`, `"skipDangerousModePermissionPrompt": true`,
and allowed `PowerShell(*)`. On your own machine that's your call. In a *committed repo
file* it applies to every future session and every clone, which is a broader blast radius
than you chose it for — so I left it out rather than decide for you. The allow-list is
intact, so ordinary work still runs unprompted. To restore the original behaviour, add
`"defaultMode": "bypassPermissions"` to the `permissions` block in `.claude/settings.json`.
