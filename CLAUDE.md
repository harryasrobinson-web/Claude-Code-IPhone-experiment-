# Repo notes

The working rules are **not** here — they live in `plugins/harry-setup/RULES.md`
and are injected at session start by the plugin's SessionStart hook. That way they
apply in every repo the plugin is installed in, not just this one. Keeping a copy
here too would pay the token cost twice.

This repo is the **marketplace** that serves that plugin. If you are editing the
setup, edit it under `plugins/harry-setup/` — that is the single source of truth.

See `README.md` for how installation works and `SETUP-NOTES.md` for what does and
does not function in cloud sessions.
