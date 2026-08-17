#!/usr/bin/env bash
set -euo pipefail

# Production Web Service start entrypoint (Railway / Render / etc.).
# Never print DEEPSEEK_API_KEY / ZHIHU_ACCESS_SECRET values.

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

if [ -z "${DEEPSEEK_API_KEY:-}" ]; then
  echo "DEEPSEEK_API_KEY is not configured" >&2
  exit 1
fi

if [ -z "${ZHIHU_ACCESS_SECRET:-}" ]; then
  echo "ZHIHU_ACCESS_SECRET is not configured" >&2
  exit 1
fi

cd "${ROOT_DIR}"
ZHIHU_CLI="$(pwd)/.railway/bin/zhihu-cli"

if [ ! -f "${ZHIHU_CLI}" ]; then
  echo "ZHIHU_CLI binary is missing; run scripts/setup-zhihu-cli.sh during build" >&2
  exit 1
fi

if [ ! -x "${ZHIHU_CLI}" ]; then
  echo "ZHIHU_CLI is not an executable file" >&2
  exit 1
fi

export ZHIHU_CLI

exec npm start
