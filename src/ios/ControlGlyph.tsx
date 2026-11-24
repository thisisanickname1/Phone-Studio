const glyphs = {
  airplane: (
    <path
      fill="currentColor"
      stroke="none"
      transform="rotate(38 12 12)"
      d="M12 2.2c1.05 0 1.9.94 1.9 2.1v4.8l7.2 4.5v2.3l-7.2-2.5v4.5l2.6 2.2v1.7L12 20.4l-4.5 1.4v-1.7l2.6-2.2v-4.5l-7.2 2.5v-2.3l7.2-4.5V4.3c0-1.16.85-2.1 1.9-2.1Z"
    />
  ),
  cellular: (
    <>
      <circle cx="12" cy="8.5" r="2.5" fill="currentColor" stroke="none" />
      <path d="M12 11v10M7.4 5.2a5.6 5.6 0 0 0 0 6.6m9.2-6.6a5.6 5.6 0 0 1 0 6.6M4.3 3.4a8.5 8.5 0 0 0 0 10.2M19.7 3.4a8.5 8.5 0 0 1 0 10.2" />
    </>
  ),
  wifi: (
    <>
      <path d="M3 7.6a14.4 14.4 0 0 1 18 0M6.1 11.1a9.5 9.5 0 0 1 11.8 0M9.1 14.6a4.7 4.7 0 0 1 5.8 0" />
      <circle cx="12" cy="18.7" r="1.8" fill="currentColor" stroke="none" />
    </>
  ),
  bluetooth: <path d="m6.5 6.8 11.2 10.3-5.2 4.2V2.7l5.2 4.2L6.5 17.2" />,
  signal: (
    <g fill="currentColor" stroke="none">
      <rect x="2.8" y="15.3" width="3.4" height="4.7" rx="1.1" />
      <rect x="7.8" y="11.8" width="3.4" height="8.2" rx="1.1" />
      <rect x="12.8" y="8.2" width="3.4" height="11.8" rx="1.1" />
      <rect x="17.8" y="4.6" width="3.4" height="15.4" rx="1.1" />
    </g>
  ),
  play: (
    <path
      fill="currentColor"
      stroke="none"
      d="M6.1 4.8a1.5 1.5 0 0 1 2.3-1.3l11 7.2a1.55 1.55 0 0 1 0 2.6l-11 7.2a1.5 1.5 0 0 1-2.3-1.3Z"
    />
  ),
  pause: (
    <g fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4.3" height="16" rx="1.35" />
      <rect x="13.7" y="4" width="4.3" height="16" rx="1.35" />
    </g>
  ),
  output: (
    <>
      <path d="M5.7 15.4a8 8 0 1 1 12.6 0M8.5 13.5a4.5 4.5 0 1 1 7 0" />
      <path
        d="m11.3 12.7-5.1 6.6a.85.85 0 0 0 .7 1.35h10.2a.85.85 0 0 0 .7-1.35l-5.1-6.6a.88.88 0 0 0-1.4 0Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  rotation: (
    <>
      <path
        d="M6.95 18.55A8.2 8.2 0 1 1 20.2 12.1v1.6m-2.7-2.6 2.7 2.7 2.3-3"
        strokeWidth="2.25"
      />
      <path d="M10.1 11.6v-1.5a1.9 1.9 0 0 1 3.8 0v1.5" strokeWidth="1.7" />
      <rect
        x="8.7"
        y="11.2"
        width="6.6"
        height="5.3"
        rx="1.05"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  mirror: (
    <>
      <path d="M8 15.5H4.4A1.7 1.7 0 0 1 2.7 13.8V6.3a1.7 1.7 0 0 1 1.7-1.7h10.4a1.7 1.7 0 0 1 1.7 1.7v2.9" />
      <rect x="8.5" y="9.2" width="12.9" height="10.2" rx="2" />
    </>
  ),
  focus: (
    <path
      d="M12.1 2.9c.8-.1 1.1.6.7 1.2a8.1 8.1 0 0 0 7.3 12.5c.8-.1 1.05.55.65 1.12A9.65 9.65 0 1 1 12.1 2.9Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  brightness: (
    <>
      <circle cx="12" cy="12" r="4.65" fill="currentColor" stroke="none" />
      <path
        d="M12 2.4v2.1m0 15v2.1M2.4 12h2.1m15 0h2.1M5.2 5.2l1.5 1.5m10.6 10.6 1.5 1.5m0-13.6-1.5 1.5M6.7 17.3l-1.5 1.5"
        strokeWidth="1.9"
      />
    </>
  ),
  volume: (
    <>
      <path
        d="M3.5 8.6h3l4.2-3.4a1 1 0 0 1 1.6.8v12a1 1 0 0 1-1.6.8l-4.2-3.4h-3A1.5 1.5 0 0 1 2 13.9v-3.8a1.5 1.5 0 0 1 1.5-1.5Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M15.6 8a6.1 6.1 0 0 1 0 8m3-10.6a10 10 0 0 1 0 13.2" />
    </>
  ),
  mute: (
    <>
      <path
        d="M4 8.6h3l4.2-3.4a1 1 0 0 1 1.6.8v12a1 1 0 0 1-1.6.8l-4.2-3.4H4a1.5 1.5 0 0 1-1.5-1.5v-3.8A1.5 1.5 0 0 1 4 8.6Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="m16.2 9.8 4.4 4.4m0-4.4-4.4 4.4" />
    </>
  ),
  flashlight: (
    <path
      fill="currentColor"
      fillRule="evenodd"
      stroke="none"
      d="M6.5 3.9a1.6 1.6 0 0 1 1.6-1.6h7.8a1.6 1.6 0 0 1 1.6 1.6v1.25h-11V3.9Zm0 2.8h11v.68c0 1.3-.43 2.05-1.2 2.85l-1.65 1.65v7.8a1.9 1.9 0 0 1-1.9 1.9h-1.5a1.9 1.9 0 0 1-1.9-1.9v-7.8L7.7 10.23c-.78-.8-1.2-1.55-1.2-2.85V6.7Zm6.8 7.1a1.3 1.3 0 1 0-2.6 0 1.3 1.3 0 0 0 2.6 0Z"
    />
  ),
  timer: (
    <>
      <path d="M10 2.8h4m-2 3.9a7.7 7.7 0 1 1-5.4 2.2" />
      <path
        d="m8.6 9.9 4.5 2.8a1.65 1.65 0 1 1-2.3 2.28Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  camera: (
    <path
      fill="currentColor"
      fillRule="evenodd"
      stroke="none"
      d="M4.9 6.8h2.6l1.15-1.65a1.8 1.8 0 0 1 1.45-.75h3.8a1.8 1.8 0 0 1 1.45.75L16.5 6.8h2.6a2.6 2.6 0 0 1 2.6 2.6v8a2.6 2.6 0 0 1-2.6 2.6H4.9a2.6 2.6 0 0 1-2.6-2.6v-8a2.6 2.6 0 0 1 2.6-2.6Zm7.1 1.9a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm5.8.2a.95.95 0 1 0 0 1.9.95.95 0 0 0 0-1.9Z"
    />
  ),
  scan: (
    <>
      <path d="M3 7.5V5.1A2.1 2.1 0 0 1 5.1 3h2.4m9 0h2.4A2.1 2.1 0 0 1 21 5.1v2.4M21 16.5v2.4a2.1 2.1 0 0 1-2.1 2.1h-2.4m-9 0H5.1A2.1 2.1 0 0 1 3 18.9v-2.4" />
      <path
        d="M7.4 7.4h3.5v3.5H7.4Zm5.7 0h3.5v3.5h-3.5Zm-5.7 5.7h3.5v3.5H7.4Z"
        strokeWidth="1.45"
        strokeLinejoin="miter"
      />
      <path
        d="M13.3 13.2h1.6v1.6h-1.6Zm2 2h1.65v1.65H15.3Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  record: (
    <>
      <circle cx="12" cy="12" r="8.55" />
      <circle cx="12" cy="12" r="4.35" fill="currentColor" stroke="none" />
    </>
  ),
  recognition: <path d="M4 10v4m4-6v8m4-11v14m4-11v8m4-6v4" />,
};

export function ControlGlyph({
  name,
  size = 28,
  className,
}: {
  name: keyof typeof glyphs;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[name]}
    </svg>
  );
}
