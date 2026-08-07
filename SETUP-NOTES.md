# Starter-pack port — status

`claude-starter-pack.zip` was built on Windows for a Windows `~/.claude`.
This repo is cloned into an **ephemeral Linux container** on each cloud session.
Anything written to `~/.claude` here is destroyed when the container is reclaimed,
so the pack was ported **into the repo** — that's the only thing that persists.

## Working

| Component | Notes |
|---|---|
| `.claude/skills/` (69) | Copied verbatim. The 13 `superpowers*` skills are fully functional. |
| `.claude/commands/` (6) | Windows paths rewritten to `${CLAUDE_PROJECT_DIR:-.}/.claude/...`. |
| `.claude/settings.json` | Rewritten, JSON-validated. |
| `CLAUDE.md` | Adapted to what's actually present. |
| `.claude/vault/` | Created fresh (Stage 4 of the bootstrap prompt). |
| exec bits | Windows zip stripped them; restored on 54 scripts. |
| **gstack** | **Installs and runs.** See below. |

## gstack — verified working

A clean install was tested end to end in this environment: clone → `bun install` →
compile → 55 skills linked → `setup` exit 0. The browser launches and drives pages.

Two obstacles had to be solved, both handled by `.claude/bootstrap-gstack.sh`:

1. **Playwright browser download is blocked.** `setup` fetches Chromium from
   `cdn.playwright.dev`, which the network policy refuses. But the image already
   ships Chromium — build **1194**, where gstack's Playwright wants **1208**, with a
   different internal layout (`chrome-linux/` vs `chrome-linux64/`, and
   `headless_shell` vs `chrome-headless-shell`). The script maps the installed build
   into the expected layout, so `setup`'s launch probe succeeds and it skips the
   download entirely.
2. **Font install needs sudo.** Suppressed with `GSTACK_SKIP_FONTS=1`.

**It cannot be committed.** `setup` compiles ~300 MB of binaries, and
`make-pdf/dist/pdf` alone is ~101 MB — over GitHub's 100 MB per-file hard limit.
So each fresh session must rebuild it. Run:

```bash
bash .claude/bootstrap-gstack.sh      # ~3-4 min, idempotent, logs to /tmp/gstack-bootstrap.log
```

**Caveat:** browse-dependent skills (`qa`, `browse`, `scrape`, `design-review`) work
mechanically but can only reach allowlisted hosts. `example.com` is already blocked,
so general web QA is not available in cloud sessions.

## Two things I could not do

Both were refused by the harness's safety classifier, not by anything in the pack.
They're one-line edits you can make yourself in `.claude/settings.json`:

1. **`"defaultMode": "bypassPermissions"`** — you said you were happy with this, but
   the write was blocked. Add it inside the `permissions` block.
2. **A `SessionStart` hook to auto-run the gstack bootstrap.** Blocked because hooks
   execute automatically. Without it, run the script by hand each session (above).
   To wire it up, add to `settings.json`:

```json
"hooks": {
  "SessionStart": [{
    "matcher": "startup",
    "hooks": [{
      "type": "command",
      "command": "nohup bash \"${CLAUDE_PROJECT_DIR}/.claude/bootstrap-gstack.sh\" >/dev/null 2>&1 &",
      "timeout": 15
    }]
  }]
}
```

## graphify — earlier warning retracted

I previously flagged `graphifyy` (Stage 6b) as a possible typosquat. **I checked, and
I was wrong.** The evidence:

- `graphifyy` on PyPI: 204 releases, actively maintained, points at
  `github.com/Graphify-Labs/graphify` — a repo that exists.
- The plain name `graphify` returns **404 on PyPI** — it is unregistered. A typosquat
  imitates an existing popular package; there is nothing here to imitate.
- The wheel installs a module named `graphify`, with console scripts `graphify` and
  `graphify-mcp`. That is exactly why the guide notes the double-y: the desired PyPI
  name was unavailable, so the distribution is `graphifyy` while the import stays
  `graphify`. Entirely ordinary.
- Dependencies are mainstream AST tooling: `networkx`, `numpy`, `rapidfuzz`, and
  tree-sitter grammars. Nothing that phones home.

Stage 6b is safe to run.

## Not working

| Component | Why |
|---|---|
| **All original hooks** | Every path was `C:\Users\\YOUR_USERNAME\.claude\...` (note the doubled backslash — malformed even on Windows). On Linux all 30+ fail, on every prompt and tool call. Stripped rather than shipped broken. |
| **claude-council** | Needs API keys (placeholders only). Only `generativelanguage.googleapis.com` is reachable; OpenAI, Moonshot/Kimi, x.ai and Perplexity are all refused by the proxy. |
| **token-optimizer** | Files ported, but it is hook-driven — inert without the hooks above. |
| **claude-mem** | Never in the pack. Runs a node worker on `localhost:37777`; its memory would not survive a container anyway. |

## Offloading work to Kimi

**Not possible from cloud sessions.** Every Moonshot endpoint is refused at the proxy:
`api.moonshot.ai`, `api.moonshot.cn`, `platform.moonshot.ai`, `api.kimi.com` — all
return a failed CONNECT tunnel, before any API key is involved. This is the
environment's network allowlist, and no key or account change alters it.

Two things that *do* achieve the same goal:

- **On your PC:** claude-council already ships `scripts/providers/kimi.sh`. Set
  `KIMI_API_KEY` in `~/.claude/settings.json` and `/ask --providers=kimi` works there.
  Nothing further to build.
- **In cloud sessions:** use subagents with a cheaper model. The `Agent` tool takes a
  `model` parameter, so heavy fan-out work (searching, summarising, bulk file reading)
  can run on Haiku in its own context window and return only conclusions. That gets
  both wins you were after — cost, and keeping the main context clean — without
  needing a third-party API to be reachable.
