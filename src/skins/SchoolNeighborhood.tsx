const mainRoads =
  "M-12 176 H412 M-12 310 L67 296 Q111 283 154 295 L213 302 H412 M304 -12 L290 78 V144 L302 175 V260 L287 330 V472";

const river =
  "M79 -15 C76 81 97 113 128 151 S164 217 146 259 C134 299 108 323 108 374 S107 432 99 477";

const localStreets = [
  "M-12 65 L54 58 61 62 M135 69 L165 75 H412",
  "M-12 130 H70 L102 147 M153 147 H412",
  "M-12 243 L78 229 119 223 M180 205 H352",
  "M-12 331 H91 M145 330 H412",
  "M-12 400 H86 M127 405 H412",
  "M48 -12 V60 L34 130 V239 L67 273 V330 L38 398 V472",
  "M177 -12 V142 L192 176 V205 M164 302 V335 L181 380 V472",
  "M251 -12 L241 76 V146 L261 176 V229 L252 258 V301 M247 330 V402 L232 472",
  "M342 -12 V145 L355 176 V267 L333 330 V405 L360 472",
].join(" ");

const buildings = [
  [13, 21, 24, 15],
  [111, 19, 21, 22],
  [15, 90, 26, 17],
  [51, 84, 20, 14],
  [14, 148, 26, 15],
  [49, 148, 39, 16],
  [52, 190, 21, 22],
  [82, 196, 21, 15],
  [149, 22, 19, 30],
  [189, 26, 45, 16],
  [257, 22, 32, 23],
  [193, 91, 37, 17],
  [196, 115, 25, 19],
  [255, 91, 23, 39],
  [313, 24, 17, 26],
  [354, 30, 32, 19],
  [307, 91, 22, 37],
  [355, 86, 26, 19],
  [353, 116, 33, 16],
  [316, 153, 24, 12],
  [316, 197, 25, 24],
  [366, 188, 27, 20],
  [369, 218, 17, 26],
  [314, 237, 27, 32],
  [351, 266, 25, 19],
  [367, 312, 21, 10],
  [314, 342, 23, 24],
  [348, 350, 36, 17],
  [352, 381, 20, 14],
  [196, 349, 32, 17],
  [194, 375, 38, 15],
  [259, 355, 15, 22],
  [149, 350, 13, 22],
  [200, 419, 24, 23],
  [250, 420, 22, 26],
  [289, 423, 26, 17],
  [60, 419, 27, 16],
  [16, 425, 25, 23],
];

const mapLabels = [
  { name: "清水河", x: 24, y: 25, tone: "water" },
  { name: "学府路", x: 48, y: 38.25 },
  { name: "东门街", x: 76, y: 53 },
  { name: "文苑路", x: 84, y: 65.5 },
  { name: "人民公园", x: 19, y: 77, tone: "park" },
];

export function SchoolNeighborhood() {
  return (
    <>
      <svg viewBox="0 0 400 460" preserveAspectRatio="none" aria-hidden="true">
        <rect width="400" height="460" fill="#f1eee6" />
        <path
          d="M0 68 87 61 119 150 110 220 0 249Z M143 72 241 79 242 145 159 144Z M274 180 351 180 351 282 301 294 259 283Z M154 336 285 338 271 404 134 402Z M306 0 H400 V146 H304Z"
          fill="#eae6db"
        />
        <path
          d="M0 250 111 229 126 280 96 322 90 393 0 393Z M130 414 175 418 178 460 H107Z M361 180 H400 V271 L379 266 360 241Z"
          fill="#dce9d2"
        />
        <path
          d="M187 211 H249 L250 254 245 289 H168 L170 252Z"
          fill="#dce8d8"
          stroke="#c6d7c2"
        />
        <path d={river} stroke="#d3e5e0" strokeWidth="35" fill="none" />
        <path d={river} stroke="#b5d9e4" strokeWidth="27" fill="none" />
        <path
          d="M7 283 60 257 96 245 M65 330 L83 359 54 391 M8 368 36 352 83 359"
          fill="none"
          stroke="#f8f9f0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g fill="#ded9ce" stroke="#d6d1c5" strokeWidth=".6">
          {buildings.map(([x, y, width, height]) => (
            <rect key={x + ":" + y} {...{ x, y, width, height }} rx="2" />
          ))}
        </g>
        <g fill="#cbd8cb" stroke="#bfcec1">
          <rect x="187" y="219" width="39" height="11" rx="2" />
          <rect x="177" y="234" width="13" height="40" rx="2" />
          <rect x="226" y="234" width="14" height="15" rx="2" />
        </g>
        <rect x="195" y="255" width="44" height="24" rx="11" fill="#d3a89a" />
        <rect x="199" y="259" width="36" height="16" rx="7" fill="#aac9a4" />
        <path d="M217 260 V274" stroke="#eaf1e6" />
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path d={localStreets} stroke="#ddd9cf" strokeWidth="7" />
          <path d={localStreets} stroke="#fffdf9" strokeWidth="5" />
          <path d={mainRoads} stroke="#d7c9aa" strokeWidth="12" />
          <path d={mainRoads} stroke="#fff8e8" strokeWidth="9" />
        </g>
        <g fill="#accba7">
          <circle cx="18" cy="315" r="5" />
          <circle cx="32" cy="303" r="4" />
          <circle cx="53" cy="321" r="4" />
          <circle cx="70" cy="344" r="5" />
          <circle cx="48" cy="367" r="4" />
          <circle cx="67" cy="380" r="5" />
          <circle cx="86" cy="371" r="4" />
        </g>
      </svg>
      {mapLabels.map(({ name, x, y, tone }) => (
        <span
          key={name}
          className="map-street-label"
          data-tone={tone}
          style={{ left: `${x}%`, top: `${y}%` }}
          aria-hidden="true"
        >
          {name}
        </span>
      ))}
    </>
  );
}
