#!/usr/bin/env bash
# Rebuild gstack in a fresh cloud container.
#
# gstack cannot be committed: `setup` compiles ~300MB of binaries and one of
# them (make-pdf/dist/pdf, ~101MB) exceeds GitHub's 100MB per-file hard limit.
# So each ephemeral session rebuilds it from source instead. Idempotent.
set -uo pipefail

GSTACK_DIR="${GSTACK_DIR:-$HOME/.gstack-src}"
LOG="${TMPDIR:-/tmp}/gstack-bootstrap.log"
exec >>"$LOG" 2>&1
echo "=== bootstrap $(date -u +%FT%TZ) ==="

# Already built? nothing to do.
if [ -x "$GSTACK_DIR/browse/dist/browse" ] && [ -e "$HOME/.claude/skills/gstack" ]; then
  echo "gstack already present"; exit 0
fi

command -v bun >/dev/null || { echo "FATAL: bun missing"; exit 1; }

# Playwright bridge: this image ships Chromium build 1194, gstack's playwright
# wants 1208. Map the older build into the expected layout so setup's launch
# probe succeeds and it skips the (blocked) cdn.playwright.dev download.
bridge_chromium() {
  local base="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
  local src want
  src=$(ls -d "$base"/chromium-[0-9]* 2>/dev/null | grep -v -- '-1208$' | head -1) || return 0
  [ -n "$src" ] || return 0
  want="$base/chromium-1208"
  if [ ! -e "$want/chrome-linux64/chrome" ]; then
    mkdir -p "$want"
    ln -sfn "$src/chrome-linux" "$want/chrome-linux64"
    touch "$want/INSTALLATION_COMPLETE" "$want/DEPENDENCIES_VALIDATED"
  fi
  local hsrc="$base/chromium_headless_shell-1194/chrome-linux"
  local hwant="$base/chromium_headless_shell-1208/chrome-headless-shell-linux64"
  if [ -d "$hsrc" ] && [ ! -e "$hwant/chrome-headless-shell" ]; then
    mkdir -p "$hwant"
    for f in "$hsrc"/*; do ln -sfn "$f" "$hwant/$(basename "$f")"; done
    ln -sfn "$hsrc/headless_shell" "$hwant/chrome-headless-shell"
    touch "$base/chromium_headless_shell-1208/INSTALLATION_COMPLETE" \
          "$base/chromium_headless_shell-1208/DEPENDENCIES_VALIDATED"
  fi
}
bridge_chromium

[ -d "$GSTACK_DIR/.git" ] || git clone --depth 1 https://github.com/garrytan/gstack.git "$GSTACK_DIR" || exit 1
cd "$GSTACK_DIR" || exit 1

# GSTACK_SKIP_FONTS: the emoji-font install needs apt/sudo and is not needed here.
GSTACK_SKIP_FONTS=1 ./setup --host claude
echo "=== setup exit: $? ==="
