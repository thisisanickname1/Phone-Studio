import { SystemNotifications } from "./SystemNotifications";
import {
  ConnectivityModule,
  SliderModule,
} from "./vendor/ios-web/ControlModules";
import { UnlockHandle } from "./vendor/ios-web/UnlockHandle";
import { useState, useEffect, createContext, useContext } from "react";
import {
  LockKeyhole,
  Flashlight,
  Camera,
  Delete,
  ChevronDown,
  X,
  Globe,
  Mic,
  ArrowUp,
  Radio,
  Battery,
  Link,
  Check,
  LoaderCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { ControlGlyph } from "./ios/ControlGlyph";
import "./ios/control-center.css";
import type { Work } from "./schema";
import type { DeviceConnectivity } from "./deviceConnectivity";
export const KeyboardContext = createContext<(open: boolean) => void>(() => {});
export function NativeComposer({
  creator,
  onAdd,
}: {
  creator: boolean;
  onAdd: () => void;
}) {
  const open = useContext(KeyboardContext);
  return (
    <button
      className="native-compose-field"
      aria-label={creator ? "添加消息" : "输入消息"}
      onClick={() => (creator ? onAdd() : open(true))}
    >
      {creator ? "添加消息" : ""}
    </button>
  );
}
export function DeviceLock({
  work,
  time,
  notices,
  onDismiss,
  pinOpen,
  setPinOpen,
  error,
  onUnlock,
  onCamera,
  onLight,
}: {
  work: Work;
  time: string;
  notices: string[];
  onDismiss: (index: number) => void;
  pinOpen: boolean;
  setPinOpen: (v: boolean) => void;
  error: string;
  onUnlock: (v: string) => void;
  onCamera: () => void;
  onLight: () => void;
}) {
  const [code, setCode] = useState("");
  const [emergency, setEmergency] = useState(false);
  useEffect(() => {
    if (error) setCode("");
  }, [error]);
  useEffect(() => {
    if (!pinOpen) {
      setCode("");
      setEmergency(false);
    }
  }, [pinOpen]);
  const digit = (key: string) => {
    const value = key === "⌫" ? code.slice(0, -1) : (code + key).slice(0, 12);
    setCode(value);
    if (
      /^\d+$/.test(work.phone.passcode) &&
      value.length === work.phone.passcode.length
    ) {
      onUnlock(value);
      setCode("");
    }
  };
  const open = () => (work.phone.passcode ? setPinOpen(true) : onUnlock(""));
  return (
    <motion.div
      className={"lock-screen device-lock " + (pinOpen ? "pin-open" : "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: -852, opacity: 0 }}
      transition={{ duration: 0.48, ease: [0.32, 0.72, 0, 1] }}
    >
      {!pinOpen ? (
        <>
          <div className="lock-clock-block">
            <LockKeyhole size={18} />
            <p>
              {new Intl.DateTimeFormat("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "long",
                timeZone: "UTC",
              }).format(
                new Date((work.phone.date || "2026-09-01") + "T12:00:00Z"),
              )}
            </p>
            <h1>{time}</h1>
          </div>
          <div className="lock-notifications">
            {work.phone.notifications && (
              <SystemNotifications
                compact
                notices={notices}
                apps={work.apps}
                onOpen={open}
                onDismiss={onDismiss}
              />
            )}
          </div>
          <UnlockHandle onUnlock={open} />

          <div className="lock-tools">
            <button onClick={onLight} aria-label="手电筒">
              <Flashlight size={23} />
            </button>
            <button
              onClick={onCamera}
              disabled={
                !work.apps.some((a) => a.installed && a.id === "camera")
              }
              aria-label="相机"
            >
              <Camera size={25} />
            </button>
          </div>
        </>
      ) : (
        <div className="device-passcode">
          <LockKeyhole size={22} />
          <h2>输入密码</h2>
          <div
            className={"passcode-dots " + (error ? "pin-shake" : "")}
            aria-label={"已输入" + code.length + "位密码"}
          >
            {Array.from({ length: work.phone.passcode.length }, (_, i) => (
              <i key={i} className={i < code.length ? "filled" : ""} />
            ))}
          </div>
          <input
            className={
              /^\d+$/.test(work.phone.passcode)
                ? "accessible-pin"
                : "legacy-passcode"
            }
            aria-label="锁屏密码"
            autoComplete="off"
            inputMode="numeric"
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onUnlock(code)}
          />
          <div className="pin-keypad">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""].map(
              (n, i) =>
                n ? (
                  <button
                    key={i}
                    className="pin-digit"
                    data-zero={n === "0" || undefined}
                    aria-label={"密码键" + n}
                    onClick={() => digit(n)}
                  >
                    <b>{n}</b>
                    {Number(n) >= 2 && (
                      <small aria-hidden="true">
                        {
                          [
                            "ABC",
                            "DEF",
                            "GHI",
                            "JKL",
                            "MNO",
                            "PQRS",
                            "TUV",
                            "WXYZ",
                          ][Number(n) - 2]
                        }
                      </small>
                    )}
                  </button>
                ) : i === 11 && code ? (
                  <button
                    key={i}
                    className="pin-erase"
                    aria-label="删除一位密码"
                    onClick={() => digit("⌫")}
                  >
                    <Delete size={22} />
                  </button>
                ) : (
                  <span key={i} />
                ),
            )}
          </div>
          <span role="status" className="pin-error">
            {error}
          </span>
          {!/^[0-9]+$/.test(work.phone.passcode) && (
            <button onClick={() => onUnlock(code)}>解锁</button>
          )}
          <div className="pin-footer">
            <button onClick={() => setEmergency(true)}>紧急情况</button>
            <button onClick={() => setPinOpen(false)}>取消</button>
          </div>
          {emergency && (
            <section
              className="pin-emergency"
              role="dialog"
              aria-modal="true"
              aria-label="紧急情况"
            >
              <div>
                <h2>紧急情况</h2>
                <p>虚拟手机内的紧急界面</p>
                <button onClick={() => setEmergency(false)}>
                  返回密码键盘
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}
export function ControlCenter({
  battery = 94,
  network,
  carriers = ["中国移动", "中国电信"],
  connectivity,
  close,
}: {
  battery?: number;
  network: string;
  carriers?: NonNullable<Work["phone"]["carriers"]>;
  connectivity: DeviceConnectivity;
  close: () => void;
}) {
  const [rotation, setRotation] = useState(true),
    [focus, setFocus] = useState(false),
    [playing, setPlaying] = useState(false);
  const [brightness, setBrightness] = useState(50),
    [volume, setVolume] = useState(25);
  const [tool, setTool] = useState("");
  const [airdrop, setAirdrop] = useState(true);
  const [hotspot, setHotspot] = useState(false);
  return (
    <motion.div
      className="system-panel device-control"
      initial={{ y: -36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <header className="cc-header">
        <h2>控制中心</h2>
        <button className="cc-close" aria-label="关闭控制中心" onClick={close}>
          <X size={19} />
        </button>
      </header>
      <div className="cc-information">
        <div className="cc-status" aria-label="运营商">
          <span>
            <ControlGlyph name="signal" size={17} />
            <small>主号</small>
            {carriers[0]}
            {connectivity.wifiNetwork ? (
              <span role="img" aria-label="Wi-Fi 已连接">
                <ControlGlyph name="wifi" size={15} />
              </span>
            ) : connectivity.cellularEnabled && network ? (
              <small>{network}</small>
            ) : null}
          </span>
          <span>
            <ControlGlyph name="signal" size={17} />
            <small>副号</small>
            {carriers[1]}
          </span>
        </div>
        <div className="cc-info-side">
          <span className="cc-battery">
            {battery}%{" "}
            <Battery size={24} strokeWidth={2.45} aria-hidden="true" />
          </span>
          <button
            className="cc-connect-icon"
            aria-label="网络连接"
            onClick={() => setTool("Wi-Fi")}
          >
            <Globe size={15} strokeWidth={2.45} />
          </button>
        </div>
      </div>
      <div className="cc-grid">
        <ConnectivityModule connectivity={connectivity} />
        <section className="cc-music" aria-label="媒体">
          <button
            className="cc-output"
            aria-label="媒体输出"
            onClick={() => setTool("屏幕镜像")}
          >
            <ControlGlyph name="output" size={21} />
          </button>
          <strong>{playing ? "测试播放" : "未在播放"}</strong>
          <button
            className="cc-play"
            aria-label={playing ? "暂停" : "播放"}
            onClick={() => setPlaying(!playing)}
          >
            <ControlGlyph name={playing ? "pause" : "play"} size={28} />
          </button>
        </section>
        <div className="cc-quick">
          <button
            className="cc-square"
            aria-label="旋转锁定"
            aria-pressed={rotation}
            onClick={() => setRotation(!rotation)}
          >
            <ControlGlyph name="rotation" size={34} />
          </button>
          <button
            className="cc-square"
            aria-label="屏幕镜像"
            onClick={() => setTool("屏幕镜像")}
          >
            <ControlGlyph name="mirror" size={32} />
          </button>
          <button
            className="cc-focus"
            aria-pressed={focus}
            onClick={() => setFocus(!focus)}
          >
            <span className="cc-focus-icon">
              <ControlGlyph name="focus" size={24} />
            </span>
            <span>专注模式</span>
          </button>
        </div>
        <div className="cc-levels">
          <SliderModule
            type="brightness"
            value={brightness}
            onChange={setBrightness}
          />
          <SliderModule type="volume" value={volume} onChange={setVolume} />
        </div>
        {(
          [
            ["flashlight", "手电筒"],
            ["timer", "计时器"],
            ["camera", "相机"],
            ["scan", "扫码"],
            ["record", "屏幕录制"],
            ["recognition", "声音识别"],
          ] as const
        ).map(([icon, label], i) => (
          <button
            className={
              i > 3 ? "cc-square cc-shortcut cc-extra" : "cc-square cc-shortcut"
            }
            key={label}
            aria-label={label}
            onClick={() => setTool(label)}
          >
            <ControlGlyph name={icon} size={32} />
          </button>
        ))}
      </div>
      {tool && (
        <div className="cc-tool-shade">
          <div className="cc-tool" role="dialog" aria-label={tool}>
            <strong>{tool}</strong>
            {tool === "Wi-Fi" ? (
              <>
                <p>
                  {connectivity.wifiEnabled
                    ? connectivity.wifiNetwork || "未连接"
                    : "Wi-Fi 已关闭"}
                </p>
                <div className="cc-network-extra">
                  <button
                    aria-pressed={airdrop}
                    onClick={() => setAirdrop(!airdrop)}
                  >
                    <Radio size={16} /> 隔空投送
                  </button>
                  <button
                    aria-pressed={hotspot}
                    onClick={() => setHotspot(!hotspot)}
                  >
                    <Link size={16} /> 个人热点
                  </button>
                </div>
                {connectivity.wifiEnabled &&
                  connectivity.wifiNetworks.length > 0 && (
                    <div className="cc-wifi-list">
                      {connectivity.wifiNetworks.map((name) => (
                        <button
                          key={name}
                          aria-pressed={connectivity.wifiNetwork === name}
                          aria-label={name}
                          disabled={Boolean(connectivity.joiningWifi)}
                          onClick={() => connectivity.selectWifi(name)}
                        >
                          <ControlGlyph name="wifi" size={16} /> {name}
                          {connectivity.joiningWifi === name ? (
                            <small role="status">
                              <LoaderCircle
                                className="wifi-loading"
                                size={14}
                              />{" "}
                              正在加入…
                            </small>
                          ) : connectivity.wifiNetwork === name ? (
                            <Check size={15} aria-hidden="true" />
                          ) : (
                            connectivity.accessFor(name) && (
                              <LockKeyhole size={14} aria-hidden="true" />
                            )
                          )}
                        </button>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <p>
                {tool === "屏幕镜像"
                  ? "正在搜索作品中的设备…"
                  : "作品内快捷控制"}
              </p>
            )}
            <button className="cc-tool-done" onClick={() => setTool("")}>
              完成
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
export function DeviceKeyboard({ close }: { close: () => void }) {
  const [value, setValue] = useState(""),
    [shift, setShift] = useState(false),
    [numbers, setNumbers] = useState(false);
  return (
    <div className="device-keyboard" role="dialog" aria-label="屏幕键盘">
      <div className="keyboard-draft">
        <input
          autoFocus
          aria-label="消息草稿"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入消息"
        />
        <button aria-label="收起键盘" onClick={close}>
          <ChevronDown />
        </button>
      </div>
      <div className="keyboard-candidates">
        {(value ? [value, "好的", "知道了"] : ["我", "你", "好的"]).map(
          (v, i) => (
            <button key={i} onClick={() => setValue(value + v)}>
              {v}
            </button>
          ),
        )}
      </div>
      {(numbers
        ? ["1234567890", "-/:;()¥&@", ".,?!'"]
        : ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
      ).map((row, i) => (
        <div className="keyboard-row" key={i}>
          {i === 2 && (
            <button
              className="key-special"
              aria-label="切换大小写"
              onClick={() => setShift(!shift)}
            >
              <ArrowUp size={19} />
            </button>
          )}
          {[...row].map((k) => (
            <button
              key={k}
              onClick={() => setValue(value + (shift ? k.toUpperCase() : k))}
            >
              {shift ? k.toUpperCase() : k}
            </button>
          ))}
          {i === 2 && (
            <button
              className="key-special"
              aria-label="退格"
              onClick={() => setValue(value.slice(0, -1))}
            >
              <Delete size={20} />
            </button>
          )}
        </div>
      ))}
      <div className="keyboard-row keyboard-bottom">
        <button onClick={() => setNumbers(!numbers)}>
          {numbers ? "ABC" : "123"}
        </button>
        <button className="key-space" onClick={() => setValue(value + " ")}>
          空格
        </button>
        <button onClick={close}>完成</button>
      </div>
      <div className="keyboard-accessories">
        <Globe size={24} />
        <small>草稿</small>
        <Mic size={23} />
      </div>
    </div>
  );
}
export { NativeSettings } from "./ios/Settings";
