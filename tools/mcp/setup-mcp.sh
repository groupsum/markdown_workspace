#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CODEX_CONFIG_DIR="${ROOT_DIR}/.codex"
CODEX_CONFIG_FILE="${CODEX_CONFIG_DIR}/config.toml"

mkdir -p "${CODEX_CONFIG_DIR}"

cat > "${CODEX_CONFIG_FILE}" <<'CONFIG'
# Project-scoped Codex MCP configuration
# This file is shared by Codex CLI and IDE extension for this trusted project.

[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
startup_timeout_sec = 20
tool_timeout_sec = 90
enabled = true

[mcp_servers.chrome_devtools]
command = "npx"
args = ["-y", "chrome-devtools-mcp@latest"]
startup_timeout_sec = 20
tool_timeout_sec = 90
enabled = true
CONFIG

printf 'Wrote MCP config to %s\n' "${CODEX_CONFIG_FILE}"

printf 'Checking MCP server entrypoints...\n'
npx -y @playwright/mcp@latest --help >/dev/null
npx -y chrome-devtools-mcp@latest --help >/dev/null

printf 'Entrypoints respond to --help.\n'
printf 'Next: run npm run mcp:proof to generate proof screenshots.\n'
