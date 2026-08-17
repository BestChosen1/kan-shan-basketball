#!/bin/sh
set -eu

# Absolute CLI path from official Linux user-data install layout.
# Override only if Render / ops explicitly sets ZHIHU_CLI.
export ZHIHU_CLI="${ZHIHU_CLI:-$HOME/.local/share/zhihu-cli/current/zhihu-cli}"

if [ ! -x "$ZHIHU_CLI" ]; then
  printf '%s\n' "ZHIHU_CLI binary is missing or not executable" >&2
  exit 1
fi

# Runtime auth only — never bake Access Secret into the image.
# Do not print the secret or Authorization material.
if [ -n "${ZHIHU_ACCESS_SECRET:-}" ]; then
  printf '%s' "$ZHIHU_ACCESS_SECRET" | "$ZHIHU_CLI" auth set --secret-stdin >/dev/null
fi

# Render injects PORT; Next must listen on all interfaces.
export PORT="${PORT:-10000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

if [ "$#" -eq 0 ]; then
  set -- npm start
fi

# If CMD is the default npm start, ensure hostname/port flags are applied.
if [ "$1" = "npm" ] && [ "${2:-}" = "start" ]; then
  shift 2
  exec npm start -- --hostname "$HOSTNAME" --port "$PORT" "$@"
fi

exec "$@"
