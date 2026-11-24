export function StatusGlyph({
  kind,
}: {
  kind: "cellular" | "wifi";
}) {
  if (kind === "cellular")
    return (
      <svg className="status-cellular" viewBox="0 0 21 15" aria-hidden="true">
        {[5, 7, 9, 11].map((height, index) => (
          <g key={height} fill="currentColor">
            <rect
              x={index * 5.5}
              y={11 - height}
              width="4"
              height={height}
              rx="1.4"
              opacity={index < 3 ? 1 : 0.27}
            />
            <rect
              x={index * 5.5}
              y="13"
              width="4"
              height="2"
              rx="1"
              opacity={index < 2 ? 0.85 : 0.27}
            />
          </g>
        ))}
      </svg>
    );
  return (
    <svg className="status-wifi" viewBox="0 0 18 15" aria-hidden="true">
      <path
        d="M1.5 4.8a11.3 11.3 0 0 1 15 0M4.5 8a6.9 6.9 0 0 1 9 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle cx="9" cy="12" r="1.9" fill="currentColor" />
    </svg>
  );
}
