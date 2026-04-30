#!/usr/bin/env sh
set -eu

apk_path="${1:?apk path is required}"
app_id="${2:?app id is required}"
launchable_activity="${3:-}"

adb wait-for-device
adb install -r "${apk_path}"

if [ -n "${launchable_activity}" ]; then
  adb shell am start -W -n "${app_id}/${launchable_activity}"
else
  adb shell monkey -p "${app_id}" -c android.intent.category.LAUNCHER 1
fi

sleep 8
pid="$(adb shell pidof "${app_id}" | tr -d '\r' || true)"
if [ -z "${pid}" ]; then
  echo "App process did not remain running after launch" >&2
  adb logcat -d | tail -n 200
  exit 1
fi

adb shell am force-stop "${app_id}"
