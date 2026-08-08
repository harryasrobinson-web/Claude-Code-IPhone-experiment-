# One-time setup — about 15 minutes

Everything on the computer side is already built. These are the only steps that
have to be done by hand, because they involve your phone and your accounts.
Do them in order. Steps 1–2 are on any browser; steps 3–5 are on the iPhone.

---

## Step 1 — Give the workflow a Claude key (2 min)

1. Go to **console.anthropic.com** → sign in → **API keys** → **Create key**.
   Name it `iphone-voice`. Copy the key (starts `sk-ant-`).
2. Go to this repo on GitHub → **Settings** (the repo's own Settings tab) →
   **Secrets and variables** → **Actions** → **New repository secret**.
3. Name: `ANTHROPIC_API_KEY` — Value: paste the key — **Add secret**.

*(Prefer it to run off your Claude subscription instead of API credit? On a
computer with Claude Code installed, run `claude setup-token`, and save the
result as a secret named `CLAUDE_CODE_OAUTH_TOKEN` instead. Either works.)*

## Step 2 — Make the phone's "doorbell" token (3 min)

The Shortcut needs a token that can ring this one repo and nothing else.

1. On GitHub: click your **profile photo** → **Settings** → scroll to
   **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
   → **Generate new token**.
2. Name: `iphone-voice`. Expiration: 90 days is fine (you'll get an email to renew).
3. **Repository access** → *Only select repositories* → pick
   `Claude-Code-IPhone-experiment-`.
4. **Permissions** → *Repository permissions* → **Contents** → **Read and write**.
5. **Generate token** and copy it (starts `github_pat_`). Keep it on the clipboard
   or in Notes for Step 4 — it is only ever pasted into the Shortcut.

## Step 3 — Install ntfy, the app that speaks Claude's replies (3 min)

1. On the iPhone, install **ntfy** from the App Store (free, by Philipp Heckel).
2. Open it → **+** → subscribe to a topic. Make up a topic name that's long and
   random, like a password — e.g. `claude-harry-x7k2m9qp4w`. Write it down.
3. Back on GitHub (as in Step 1): add a second repository secret —
   Name: `NTFY_TOPIC`, Value: your topic name.
4. iPhone **Settings → Notifications → ntfy** → make sure notifications are allowed.
5. iPhone **Settings → Notifications → Announce Notifications** → turn it **on**,
   and under it turn on **ntfy**. This is the magic switch: with AirPods in (or
   compatible CarPlay), Siri reads Claude's replies aloud.

## Step 4 — Build the Shortcut (5 min)

1. Open the **Shortcuts** app → **+** (new shortcut).
2. Add action → search **"Dictate text"** → add it. Tap the little arrow on the
   action → set **Stop Listening** to **After Pause**.
3. Add action → search **"Get contents of URL"** → add it, then tap the arrow to
   expand it and fill in:
   - **URL:**
     `https://api.github.com/repos/harryasrobinson-web/Claude-Code-IPhone-experiment-/dispatches`
   - **Method:** `POST`
   - **Headers** — add two:
     - `Authorization` → `Bearer github_pat_…` (the word Bearer, a space, then
       your token from Step 2)
     - `Accept` → `application/vnd.github+json`
   - **Request Body:** JSON — add two fields:
     - a **Text** field: key `event_type`, value `voice`
     - a **Dictionary** field: key `client_payload` → tap into it → add a
       **Text** field: key `text`, value = the **Dictated Text** variable
       (tap the value box, choose "Select Variable", pick Dictated Text).
4. Add action → **"Show notification"** → text: `Sent to Claude`.
5. Tap the name at the top → rename the shortcut to **Claude**.

*(iPhone 15 Pro or newer: Settings → Action Button → Shortcut → Claude, and a
long press becomes your Claude button.)*

## Step 5 — Try it

Say: **"Hey Siri, Claude"** … it beeps … say:
*"Log a note: test the voice pipeline."*

Within a couple of minutes the phone should ding (or speak, with AirPods in)
with Claude's confirmation, and the note appears in `notes/inbox.md` on GitHub.

---

## If nothing happens

- The repo's **Actions** tab shows every run — if there's no run at all, the
  Shortcut's token or URL is wrong; if there's a red ✗, open it and the log says
  what failed (or just ask Claude to look at it).
- Remember: the workflow only listens once it's on the **main** branch.
