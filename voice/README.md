# "Hey Claude" on the iPhone — what's possible, and what this repo builds

Harry's goal: say something like **"Hey Claude"** while driving or walking, speak a
request — log a note, ask a question, kick off a build — and have Claude Code
actually do it, hands-free.

## The honest feasibility picture

**A true "Hey Claude" wake word is not possible on an iPhone.** Apple does not let
any third-party app listen for its own wake phrase. The closest you can get is
**"Hey Siri, Claude"** — Siri hears the wake word, then hands off to a Shortcut
named "Claude". That works with the phone in your pocket, through AirPods, and in
the car. On an iPhone 15 Pro or newer you can also map the **Action Button** to it.

Given that, there are three realistic routes:

| Route | Hands-free? | Speed | Verdict |
|---|---|---|---|
| **1. Claude iPhone app + dictation** | No — needs taps | Real-time conversation | Best for when you can look at the phone. Nothing to build; it already exists. |
| **2. Siri Shortcut → this repo → Claude in the cloud** *(built here)* | **Yes** — voice in, spoken reply out | 1–3 minutes per round trip | Best for driving/walking. Not a conversation — one request, one reply. |
| **3. Email-based (dictate an email, Claude checks hourly)** | Yes | Up to an hour | Simplest to set up, but too slow to feel alive. Kept as a fallback idea. |

Route 2 is what's implemented in this repo.

## How route 2 works

```
"Hey Siri, Claude"
      │  you speak; Siri transcribes
      ▼
iPhone Shortcut ──── sends the text to GitHub ────► GitHub Actions starts a runner
                                                          │
                                                          ▼
                                              Claude Code runs in the cloud,
                                              inside a fresh copy of this repo
                                                          │
                       ┌──────────────────────────────────┤
                       ▼                                  ▼
              Notes → saved to                 Claude's short spoken-style reply
              notes/inbox.md on main;          → pushed to the ntfy app on the
              bigger tasks → their own         phone. With "Announce
              voice/run-… branch               Notifications" on, the iPhone
                                               READS IT ALOUD through AirPods
                                               or CarPlay.
```

The moving parts:

- **`.github/workflows/voice.yml`** — wakes on the Shortcut's signal, runs Claude
  Code headless, commits whatever Claude produced, and sends the reply to the phone.
- **`voice/PHONE-SETUP.md`** — the one-time phone and GitHub setup (about 15 minutes).
- **`notes/inbox.md`** — where dictated notes land, dated.

## What it handles well

- **"Log a note: …"** — cleaned up and committed to `notes/inbox.md` within a
  couple of minutes, reply confirms it.
- **Questions** — "what's on my project list", "remind me how the plugin installs" —
  answered aloud, nothing changed.
- **Small build tasks** — "add a page to the site that does X". Claude does the work
  on a fresh `voice/run-…` branch and tells you it's there to review later.

## What it deliberately does not do

- **No back-and-forth.** Each utterance is one complete request. If Claude needs a
  decision it will say so in the reply and you speak a follow-up.
- **No long jobs from the road.** The runner stops after 20 minutes. Big projects
  should start life as a voice note and get built in a proper session later.
- **Driving:** it's built to be capture-first — speak, forget, hear a confirmation.
  Don't review diffs at the wheel.

## Costs

- **GitHub Actions minutes:** free tier covers this comfortably (a note costs
  ~1–2 runner minutes).
- **Claude usage:** the workflow runs on the Anthropic API key you give it
  (a note costs pennies on Sonnet; a build task more). If you'd rather it draw on
  the Claude subscription instead, run `claude setup-token` on a computer and store
  the result as the `CLAUDE_CODE_OAUTH_TOKEN` secret — the workflow accepts either.

## Important: when this switches on

GitHub only listens for the Shortcut's signal with the **workflow on the `main`
branch**. This was built on the `claude/voice-claude-iphone-j6oxcp` branch, so
nothing runs until that branch is merged. That's the safety catch.
