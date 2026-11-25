import { useEffect, useRef, useState } from "react";
import type { Work } from "./schema";

type WifiPrompt = { kind: "password" | "teacher" | "info"; name: string };
type WifiSave = {
  verified: Record<string, string>;
  attempts: Record<string, { day: string; remaining: number }>;
};

const schoolDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const defaultWifiSave: WifiSave = { verified: {}, attempts: {} };
function loadWifiSave(key: string): WifiSave | undefined {
  try {
    const save = JSON.parse(localStorage.getItem(key) ?? "null");
    if (save?.verified && save?.attempts) return save;
  } catch {
    // The current session can still join networks when storage is unavailable.
  }
}
function attemptsLeft(save: WifiSave, name: string, day: string) {
  const entry = save.attempts[name];
  return entry?.day === day && Number.isInteger(entry.remaining)
    ? Math.max(0, Math.min(3, entry.remaining))
    : 3;
}

export function useDeviceConnectivity(phone: Work["phone"], workId: string) {
  const saveKey = "foundphone-wifi-v1:" + workId;
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [cellularData, setCellularEnabled] = useState(
    phone.cellularData ?? false,
  );
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [selectedWifi, setSelectedWifi] = useState(
    phone.wifiNetworks ? "" : phone.network,
  );
  const [wifiPrompt, setWifiPrompt] = useState<WifiPrompt | null>(null);
  const [joiningWifi, setJoiningWifi] = useState("");
  const [wifiSave, setWifiSave] = useState(
    () => loadWifiSave(saveKey) ?? defaultWifiSave,
  );
  const joinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const wifiNetworks = [...new Set(phone.wifiNetworks)];
  const wifiAccess = phone.wifiAccess ?? {};
  const accessFor = (name: string) =>
    Object.hasOwn(wifiAccess, name) ? wifiAccess[name] : undefined;
  const dismissWifiPrompt = () => setWifiPrompt(null);

  useEffect(() => () => clearTimeout(joinTimer.current), []);

  function hasVerifiedWifiPassword(name: string, save = wifiSave) {
    const access = accessFor(name);
    return Boolean(access && save.verified[name] === access.password);
  }

  function saveWifi(next: WifiSave) {
    setWifiSave(next);
    try {
      localStorage.setItem(saveKey, JSON.stringify(next));
    } catch {
      // Keep the result in memory when storage is unavailable.
    }
  }

  function finishPassword(name: string) {
    if (accessFor(name)?.teacherOnly) {
      setWifiPrompt({ kind: "teacher", name });
      return;
    }

    dismissWifiPrompt();
    clearTimeout(joinTimer.current);
    setJoiningWifi(name);
    joinTimer.current = setTimeout(() => {
      setSelectedWifi(name);
      setJoiningWifi("");
    }, 750);
  }

  function selectWifi(name: string) {
    if (!wifiEnabled || joiningWifi || !wifiNetworks.includes(name)) return;
    const access = accessFor(name);
    if (!access) {
      setSelectedWifi(name);
      return;
    }
    if (name === selectedWifi) return;
    const save = loadWifiSave(saveKey) ?? wifiSave;
    if (hasVerifiedWifiPassword(name, save)) finishPassword(name);
    else setWifiPrompt({ kind: "password", name });
  }

  function submitWifiPassword(value: string) {
    if (wifiPrompt?.kind !== "password" || !wifiEnabled) return false;
    const { name } = wifiPrompt;
    const access = accessFor(name);
    if (!access || value !== access.password) return false;
    const save = loadWifiSave(saveKey) ?? wifiSave;
    saveWifi({
      ...save,
      verified: { ...save.verified, [name]: access.password },
    });
    finishPassword(name);
    return true;
  }

  function failTeacherAuth() {
    if (wifiPrompt?.kind !== "teacher") return false;
    const { name } = wifiPrompt;
    const day = schoolDay.format(new Date());
    const save = loadWifiSave(saveKey) ?? wifiSave;
    const remaining = attemptsLeft(save, name, day);
    if (!remaining) {
      setWifiSave(save);
      return false;
    }
    saveWifi({
      ...save,
      attempts: { ...save.attempts, [name]: { day, remaining: remaining - 1 } },
    });
    return true;
  }

  return {
    airplaneMode,
    setAirplaneMode,
    cellularEnabled: cellularData && !airplaneMode,
    setCellularEnabled,
    wifiEnabled,
    setWifiEnabled(enabled: boolean) {
      setWifiEnabled(enabled);
      if (!enabled) {
        clearTimeout(joinTimer.current);
        setJoiningWifi("");
        dismissWifiPrompt();
      }
    },
    wifiNetwork: wifiEnabled ? selectedWifi : "",
    wifiNetworks,
    joiningWifi,
    wifiPrompt,
    dismissWifiPrompt,
    selectWifi,
    accessFor,
    hasVerifiedWifiPassword,
    submitWifiPassword,
    failTeacherAuth,
    teacherAttempts:
      wifiPrompt?.kind === "teacher"
        ? attemptsLeft(wifiSave, wifiPrompt.name, schoolDay.format(new Date()))
        : 3,
    showWifiInfo: (name: string) => setWifiPrompt({ kind: "info", name }),
  };
}

export type DeviceConnectivity = ReturnType<typeof useDeviceConnectivity>;
