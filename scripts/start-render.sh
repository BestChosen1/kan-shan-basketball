#!/usr/bin/env bash
set -euo pipefail

# Render Web Service start entrypoint.
# Never print DEEPSEEK_API_KEY / ZHIHU_ACCESS_SECRET values.

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PATH_FILE="${ROOT_DIR}/.zhihu-cli-path"

if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "DEEPSEEK_API_KEY is not configured" >&2
  exit 1
fi

if [ -z "${ZHIHU_ACCESS_SECRET:-}" ]; then
  echo "ZHIHU_ACCESS_SECRET is not configured" >&2
  exit 1
fi

if [ ! -f "${PATH_FILE}" ]; then
  echo ".zhihu-cli-path is missing; run scripts/setup-zhihu-cli.sh during build" >&2
  exit 1
fi

ZHIHU_CLI="$(tr -d '[:space:]' < "${PATH_FILE}")"
if [ -z "${ZHIHU_CLI}" ]; then
  echo ".zhihu-cli-path is empty" >&2
  exit 1
fi

export ZHIHU_CLI

if [ ! -x "${ZHIHU_CLI}" ]; then
  echo "ZHIHU_CLI is not an executable file" >&2
  exit 1
fi

cd "${ROOT_DIR}"
exec npm start
