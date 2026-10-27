#!/usr/bin/env bash
# Fail once, before any source runs, if the scraper venv no longer matches its Python.
set -euo pipefail
venv_python=${1:?usage: check-python-env.sh /path/to/venv/bin/python3}
venv_dir=$(dirname "$(dirname "$venv_python")")
cfg="$venv_dir/pyvenv.cfg"
if [ ! -r "$cfg" ] || [ ! -x "$venv_python" ]; then
  echo "Scraper Python environment missing: $venv_dir" >&2
  exit 1
fi
expected=$(sed -n 's/^version = \([0-9]*\.[0-9]*\).*/\1/p' "$cfg" | head -1)
if [ -z "$expected" ]; then
  echo "Scraper Python version missing from $cfg" >&2
  exit 1
fi
if ! "$venv_python" -c 'import sys, requests, bs4; assert f"{sys.version_info.major}.{sys.version_info.minor}" == sys.argv[1]' "$expected"; then
  echo "Scraper Python environment is broken: expected Python $expected with requests and bs4. Repoint the venv Python to the matching interpreter or rebuild the venv from scraper requirements." >&2
  exit 1
fi
