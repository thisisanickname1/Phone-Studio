/* Adapted from chukjosh/IOS-and-Android-on-the-Web, MIT.
 * Copyright (c) 2025 Joshua Chukwurah. See licenses/ios-web/chukjosh-MIT.txt.
 * Upstream 914f7ef8f902821964b14b85a2b410b0606f2d0e:
 * components/control-center/modules/{connectivity,slider}-module.tsx.
 * Changes: semantic labels, controlled values, vertical sliders, isolated CSS.
 */
import { useState } from "react";
import type { DeviceConnectivity } from "../../deviceConnectivity";
import { ControlGlyph } from "../../ios/ControlGlyph";
export function ConnectivityModule({
  connectivity,
}: {
  connectivity: DeviceConnectivity;
}) {
  const {
    airplaneMode,
    setAirplaneMode,
    wifiEnabled,
    setWifiEnabled,
    cellularEnabled,
    setCellularEnabled,
  } = connectivity;
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  return (
    <section className="cc-connect" aria-label="连接">
      <div className="cc-connect-switches">
        <button
          aria-label="飞行模式"
          aria-pressed={airplaneMode}
          className={airplaneMode ? "orange" : ""}
          onClick={() => setAirplaneMode(!airplaneMode)}
        >
          <ControlGlyph name="airplane" size={34} />
        </button>
        <button
          aria-label="蜂窝数据"
          disabled={airplaneMode}
          aria-pressed={cellularEnabled}
          className={cellularEnabled ? "green" : ""}
          onClick={() => setCellularEnabled(!cellularEnabled)}
        >
          <ControlGlyph name="cellular" size={32} />
        </button>
        <button
          aria-label="Wi-Fi"
          aria-pressed={wifiEnabled}
          className={wifiEnabled ? "blue" : ""}
          onClick={() => setWifiEnabled(!wifiEnabled)}
        >
          <ControlGlyph name="wifi" size={32} />
        </button>
        <button
          aria-label="蓝牙"
          aria-pressed={bluetoothEnabled}
          className={bluetoothEnabled ? "blue" : ""}
          onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
        >
          <ControlGlyph name="bluetooth" size={32} />
        </button>
      </div>
    </section>
  );
}
export function SliderModule({
  type,
  value,
  onChange,
}: {
  type: "brightness" | "volume";
  value: number;
  onChange: (value: number) => void;
}) {
  const glyph = type === "volume" && value === 0 ? "mute" : type;
  return (
    <label className="cc-slider" data-low={value < 20 || undefined}>
      <input
        aria-label={type === "brightness" ? "屏幕亮度" : "音量"}
        type="range"
        min={type === "brightness" ? 20 : 0}
        max="100"
        value={value}
        onChange={(e) => {
          const value = Number.parseInt(e.target.value);
          onChange(value);
          if (type === "brightness")
            (
              e.currentTarget.closest(".phone-screen") as HTMLElement
            )?.style.setProperty("--screen-dim", String((100 - value) / 180));
        }}
      />
      <span className="cc-slider-fill" style={{ height: value + "%" }} />
      <ControlGlyph name={glyph} size={29} className="cc-slider-icon" />
    </label>
  );
}
