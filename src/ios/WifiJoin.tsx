import { useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import type { DeviceConnectivity } from "../deviceConnectivity";
import { ControlGlyph } from "./ControlGlyph";
import "./wifi-join.css";

function WifiAlert({
  title,
  children,
  role = "dialog",
}: {
  title: string;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
}) {
  return (
    <motion.section
      className="wifi-alert"
      role={role}
      aria-modal="true"
      aria-label={title}
      initial={{ scale: 0.96 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.96 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.section>
  );
}

function PasswordPrompt({
  name,
  connectivity,
}: {
  name: string;
  connectivity: DeviceConnectivity;
}) {
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || connectivity.submitWifiPassword(password)) return;
    setPassword("");
    setInvalid(true);
    input.current?.focus();
    if (!reduceMotion) {
      const alert = form.current?.parentElement;
      alert?.getAnimations().forEach((animation) => animation.cancel());
      alert?.animate(
        [0, -8, 7, -5, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 330, easing: "ease-out" },
      );
    }
  }

  return (
    <div className="wifi-alert-shade">
      <WifiAlert title={name + " · Wi-Fi 密码"}>
        <form ref={form} onSubmit={submit}>
          <div className="wifi-alert-content">
            <ControlGlyph name="wifi" size={29} />
            <h2>{name}</h2>
            <input
              ref={input}
              aria-label="Wi-Fi 密码"
              placeholder="请输入 Wi-Fi 密码"
              type="password"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={invalid}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setInvalid(false);
              }}
            />
            {invalid && (
              <p className="wifi-error" role="alert">
                密码不正确
              </p>
            )}
          </div>
          <div className="wifi-alert-actions">
            <button type="button" onClick={connectivity.dismissWifiPrompt}>
              取消
            </button>
            <button type="submit" disabled={!password}>
              加入
            </button>
          </div>
        </form>
      </WifiAlert>
    </div>
  );
}

function TeacherPortal({
  name,
  connectivity,
}: {
  name: string;
  connectivity: DeviceConnectivity;
}) {
  const [workerId, setWorkerId] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);
  const remaining = connectivity.teacherAttempts;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workerId.trim() || !password || failed || !remaining) return;
    if (connectivity.failTeacherAuth()) {
      setPassword("");
      setFailed(true);
    }
  }

  return (
    <div className="wifi-portal-frame">
      <section
        className="wifi-portal"
        role="dialog"
        aria-modal="true"
        aria-label="请认证教师身份"
        inert={failed}
      >
        <header>
          <strong>Wi-Fi</strong>
          <button onClick={connectivity.dismissWifiPrompt}>取消</button>
        </header>
        <div className="wifi-portal-body">
          <ControlGlyph name="wifi" size={48} />
          <h2>请认证教师身份</h2>
          <p>{name} · 教师专用网络</p>
          <form onSubmit={submit} autoComplete="off">
            <input
              aria-label="工号"
              placeholder="请输入工号"
              autoCapitalize="none"
              value={workerId}
              onChange={(event) => setWorkerId(event.target.value)}
            />
            <input
              aria-label="密码"
              placeholder="请输入密码"
              type="password"
              autoComplete="off"
              autoCapitalize="none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="submit"
              disabled={!workerId.trim() || !password || !remaining || failed}
            >
              登录
            </button>
            <small className="wifi-error" aria-live="polite">
              最多输入3次，还剩{remaining}次机会
            </small>
          </form>
        </div>
        <footer>Private · Secure</footer>
      </section>
      <AnimatePresence>
        {failed && (
          <motion.div
            className="wifi-alert-shade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setFailed(false);
              }
            }}
          >
            <WifiAlert title="工号不存在或密码错误" role="alertdialog">
              <div className="wifi-alert-content">
                <h2>工号不存在或密码错误</h2>
              </div>
              <div className="wifi-alert-actions">
                <button autoFocus onClick={() => setFailed(false)}>
                  知道了
                </button>
              </div>
            </WifiAlert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WifiPromptLayer({
  prompt,
  connectivity,
}: {
  prompt: NonNullable<DeviceConnectivity["wifiPrompt"]>;
  connectivity: DeviceConnectivity;
}) {
  const reduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const teacherOnly = connectivity.accessFor(prompt.name)?.teacherOnly;
  return (
    <motion.div
      className="wifi-join-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18 }}
      style={{ pointerEvents: isPresent ? "auto" : "none" }}
      inert={!isPresent}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") connectivity.dismissWifiPrompt();
      }}
    >
      {prompt.kind === "password" ? (
        <PasswordPrompt name={prompt.name} connectivity={connectivity} />
      ) : prompt.kind === "teacher" ? (
        <TeacherPortal name={prompt.name} connectivity={connectivity} />
      ) : (
        <div className="wifi-alert-shade">
          <WifiAlert title={prompt.name + " · 网络详情"}>
            <div className="wifi-alert-content">
              <ControlGlyph name="wifi" size={29} />
              <h2>{prompt.name}</h2>
              <p>
                {connectivity.wifiNetwork === prompt.name
                  ? "已加入"
                  : teacherOnly &&
                      !connectivity.hasVerifiedWifiPassword(prompt.name)
                    ? "需要密码"
                    : "未加入"}
              </p>
              {teacherOnly && <p>教师专用网络</p>}
            </div>
            <div className="wifi-alert-actions">
              <button onClick={connectivity.dismissWifiPrompt}>完成</button>
            </div>
          </WifiAlert>
        </div>
      )}
    </motion.div>
  );
}

export function WifiJoin({
  connectivity,
}: {
  connectivity: DeviceConnectivity;
}) {
  const prompt = connectivity.wifiPrompt;
  return (
    <AnimatePresence>
      {prompt && (
        <WifiPromptLayer
          key={prompt.kind + ":" + prompt.name}
          prompt={prompt}
          connectivity={connectivity}
        />
      )}
    </AnimatePresence>
  );
}
