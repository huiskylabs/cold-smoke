#!/bin/sh
# Build the local UI/game bundle using only tools supplied with macOS/Xcode.
set -eu
export LC_ALL=C
cd "$(dirname "$0")/.."
# Homebrew's node is not on the default Xcode PATH. The icons have to exist before the asset catalog compiles.
export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-/usr/bin:/bin}"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18 or newer must be on PATH so tools/generate-icons.js can draw the app icons." >&2
  exit 1
fi
node tools/generate-icons.js
out=${1:?destination resource directory required}
mkdir -p "$out/fonts"
cp xhs/fonts/* "$out/fonts/"
platform=${2:-ios}
if [ "$platform" = visionos ]; then
  cp visionos/App/window.css "$out/window.css"
else
  cp ios/Runtime/window.css "$out/window.css"
fi
{
  cat <<'HTML'
<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' blob: data:; connect-src 'none'">
<link rel="stylesheet" href="fonts/fonts.css">
</head><body>
HTML
  sed '/^<script>/,$d' template.html
  cat <<'HTML'
<link rel="stylesheet" href="window.css">
<script src="game.js"></script></body></html>
HTML
} > "$out/index.html"
{
  echo '(() => { "use strict";'
  if [ "$platform" = visionos ]; then
    echo 'self.COLD_SMOKE = { spatial: true, noTilt: true };'
  fi
  cat ios/Runtime/platform.js
  for src in src/*.js; do
    case "$src" in
      src/01_gfx.js) cat "$src" ios/Runtime/metal-shaders.js ios/Runtime/metal-gfx.js ;;
      src/19b_rank.js|src/19c_xhs.js|src/20_director.js) continue ;;
      *) cat "$src" ;;
    esac
    echo
  done
  cat ios/Runtime/pause-settings.js
  if [ "$platform" = visionos ]; then cat visionos/App/spatial.js visionos/App/interface.js; else cat ios/Runtime/game-controls.js; fi
  echo '})();'
} > "$out/game.js"
