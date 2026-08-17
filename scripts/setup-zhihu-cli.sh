#!/usr/bin/env bash
set -euo pipefail

# Install official Zhihu CLI via Skill setup.
# Does NOT configure Access Secret. Does NOT print secrets.

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PATH_FILE="${ROOT_DIR}/.zhihu-cli-path"
SKILL_URL="https://developer-cdn.zhihu.com/zhihu-cli/releases/stable/skill/zhihu-cli-skill.zip"

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/kanshan-zhihu-cli-setup.XXXXXX")"
cleanup() {
  rm -rf -- "${TMP_DIR}"
}
trap cleanup EXIT INT TERM

echo "Downloading official zhihu-cli skill..." >&2
curl --fail --silent --show-error --location \
  --output "${TMP_DIR}/zhihu-cli-skill.zip" \
  "${SKILL_URL}"

echo "Extracting skill package..." >&2
unzip -q "${TMP_DIR}/zhihu-cli-skill.zip" -d "${TMP_DIR}"

if [ ! -f "${TMP_DIR}/zhihu/scripts/setup.sh" ]; then
  echo "Official setup.sh not found in skill package" >&2
  exit 1
fi

echo "Running official zhihu/scripts/setup.sh (no auth)..." >&2
# Progress goes to stderr; final JSON is on stdout.
SETUP_JSON="$(
  cd "${TMP_DIR}"
  sh zhihu/scripts/setup.sh
)"

LAST_JSON="$(printf '%s\n' "${SETUP_JSON}" | awk 'NF{line=$0} END{print line}')"
if [ -z "${LAST_JSON}" ]; then
  echo "setup.sh produced empty stdout JSON" >&2
  exit 1
fi

BINARY_PATH="$(
  printf '%s' "${LAST_JSON}" | node -e '
const fs = require("node:fs");
const raw = fs.readFileSync(0, "utf8").trim();
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error("setup.sh stdout is not valid JSON");
  process.exit(1);
}
if (!data || typeof data.binary_path !== "string" || !data.binary_path.trim()) {
  console.error("binary_path missing in setup.sh JSON");
  process.exit(1);
}
process.stdout.write(data.binary_path.trim());
'
)"

if [ ! -x "${BINARY_PATH}" ]; then
  echo "binary_path is not an executable file" >&2
  exit 1
fi

# Persist absolute CLI path for Render start script. Never write secrets.
printf '%s\n' "${BINARY_PATH}" > "${PATH_FILE}"

echo "Zhihu CLI ready." >&2
echo "Wrote ${PATH_FILE}" >&2
