#!/usr/bin/env bash
set -euo pipefail

NOTES_FILE="AGENT_NOTES.md"
MODE="run"

if [[ "${1:-}" == "--plan" ]]; then
  MODE="plan"
  shift
fi

NOTES_FILE="${1:-$NOTES_FILE}"
BURST_NOTE="${2:-Documented execution burst}"
DATE_STAMP="$(date +%Y-%m-%d)"
TIME_STAMP="$(date +%H:%M:%S)"

if [[ ! -f "$NOTES_FILE" ]]; then
  cat > "$NOTES_FILE" <<'MARKER'
# Agent Working Notes

## Prior notes review
- Initialized by automation.

## Active execution plan

## Run log

## Network/PCAP review notes

## Open issues

## Change requests

## Feature requests

## Bugs
MARKER
fi

SECTION_HEADER="## Run log"
if [[ "$MODE" == "plan" ]]; then
  SECTION_HEADER="## Active execution plan"
fi

if ! rg -n "^${SECTION_HEADER}$" "$NOTES_FILE" >/dev/null; then
  printf '\n%s\n' "$SECTION_HEADER" >> "$NOTES_FILE"
fi

python - <<'PY' "$NOTES_FILE" "$DATE_STAMP" "$TIME_STAMP" "$BURST_NOTE" "$MODE"
from pathlib import Path
import sys

notes_path = Path(sys.argv[1])
date_stamp = sys.argv[2]
time_stamp = sys.argv[3]
burst_note = sys.argv[4]
mode = sys.argv[5]

text = notes_path.read_text()
marker = "## Run log\n"
prefix = ""

if mode == "plan":
    marker = "## Active execution plan\n"
    prefix = "Plan: "

entry = f"- {date_stamp} {time_stamp}: {prefix}{burst_note}.\n"

if marker in text:
    head, tail = text.split(marker, 1)
    notes_path.write_text(head + marker + entry + tail)
else:
    notes_path.write_text(text.rstrip() + "\n\n" + marker + entry)
PY

echo "Added ${MODE} entry to $NOTES_FILE"
