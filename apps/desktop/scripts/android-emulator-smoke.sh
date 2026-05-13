#!/usr/bin/env sh
set -eu

apk_path="${1:?apk path is required}"
app_id="${2:?app id is required}"
launchable_activity="${3:-}"

adb wait-for-device

package_service_ready=false
attempt=1
while [ "${attempt}" -le 60 ]; do
  if adb shell service check package 2>/dev/null | grep -q "found"; then
    package_service_ready=true
    break
  fi
  sleep 2
  attempt=$((attempt + 1))
done

if [ "${package_service_ready}" != "true" ]; then
  echo "Android package service did not become ready" >&2
  adb shell service list 2>/dev/null || true
  exit 1
fi

install_attempt=1
while [ "${install_attempt}" -le 3 ]; do
  if adb install -r "${apk_path}"; then
    break
  fi
  if [ "${install_attempt}" -eq 3 ]; then
    exit 1
  fi
  sleep 5
  adb wait-for-device
  install_attempt=$((install_attempt + 1))
done

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
