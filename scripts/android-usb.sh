#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [ -z "${JAVA_HOME:-}" ]; then
  if [ -x "/opt/android-studio/jbr/bin/java" ]; then
    export JAVA_HOME="/opt/android-studio/jbr"
  fi
fi

if [ -z "${ANDROID_HOME:-}" ] && [ -d "$HOME/Android/Sdk" ]; then
  export ANDROID_HOME="$HOME/Android/Sdk"
fi

if [ -n "${ANDROID_HOME:-}" ]; then
  export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
fi

if ! command -v adb >/dev/null 2>&1; then
  echo "adb was not found."
  echo "Open Android Studio > More Actions > SDK Manager and install Android SDK Platform-Tools."
  echo "Expected default SDK path: \$HOME/Android/Sdk"
  exit 1
fi

echo "Connected devices:"
adb devices

echo "Starting Android USB build/install..."
npx expo run:android --device
