#!/usr/bin/env bash
# Point a new project repo at the harry-setup plugin.
#
# Writes a small .claude/settings.json declaring the marketplace and enabling
# the plugin. That is all a repo needs -- roughly 1KB, versus copying ~13MB of
# skills into every project. Claude Code installs the plugin from GitHub at
# session start.
#
# Usage:  bash seed-project.sh /path/to/new/repo
set -euo pipefail

TARGET="${1:-.}"
REPO="harryasrobinson-web/Claude-Code-IPhone-experiment-"
MARKET="harry-marketplace"
PLUGIN="harry-setup"

[ -d "$TARGET" ] || { echo "No such directory: $TARGET" >&2; exit 1; }
mkdir -p "$TARGET/.claude"
SETTINGS="$TARGET/.claude/settings.json"

python3 - "$SETTINGS" "$REPO" "$MARKET" "$PLUGIN" <<'PY'
import json, os, sys
path, repo, market, plugin = sys.argv[1:5]

# Merge into an existing settings.json rather than clobbering it.
data = {}
if os.path.exists(path):
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (ValueError, OSError):
        data = {}

data.setdefault("extraKnownMarketplaces", {})[market] = {
    "source": {"source": "github", "repo": repo}
}
data.setdefault("enabledPlugins", {})["%s@%s" % (plugin, market)] = True

with open(path, "w", encoding="utf-8") as fh:
    json.dump(data, fh, indent=2)
    fh.write("\n")
print("wrote " + path)
PY

echo "Done. Next session in $TARGET installs $PLUGIN automatically."
