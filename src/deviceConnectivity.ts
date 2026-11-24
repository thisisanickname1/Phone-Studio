import { useState } from "react";
import type { Work } from "./schema";

export function useDeviceConnectivity(phone: Work["phone"]) {
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [cellularData, setCellularEnabled] = useState(
    phone.cellularData ?? false,
  );
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [selectedWifi, setWifiNetwork] = useState(
    phone.wifiNetworks ? "" : phone.network,
  );

  return {
    airplaneMode,
    setAirplaneMode,
    cellularEnabled: cellularData && !airplaneMode,
    setCellularEnabled,
    wifiEnabled,
    setWifiEnabled,
    wifiNetwork: wifiEnabled ? selectedWifi : "",
    wifiNetworks: [...new Set(phone.wifiNetworks)],
    setWifiNetwork,
  };
}

export type DeviceConnectivity = ReturnType<typeof useDeviceConnectivity>;
