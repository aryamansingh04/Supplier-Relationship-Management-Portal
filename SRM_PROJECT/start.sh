#!/usr/bin/env bash
# Starts the PHP backend (port 8080) and the React frontend (port 5173).
cd "$(dirname "$0")"
command -v php >/dev/null || { echo "PHP not found. Install php-cli (and php-mysql)."; exit 1; }
[ -d node_modules ] || npm install
npm start
