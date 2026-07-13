const outerHex = "250,40 432,145 432,355 250,460 68,355 68,145";
const innerHex = "250,68 410,160 410,340 250,432 90,340 90,160";

type AnimatedLogoProps = {
  size?: number;
  className?: string;
};
const vertices: [number, number][] = [
  [250, 40], [432, 145], [432, 355], [250, 460], [68, 355], [68, 145],
];

// 24 ticks at 15° intervals, major every 60°
const ticks = Array.from({ length: 24 }, (_, i) => {
  const a = (i * 15 * Math.PI) / 180;
  const major = i % 4 === 0;
  const r1 = major ? 219 : 227;
  const r2 = major ? 243 : 237;
  return {
    x1: 250 + r1 * Math.cos(a), y1: 250 + r1 * Math.sin(a),
    x2: 250 + r2 * Math.cos(a), y2: 250 + r2 * Math.sin(a),
    major,
  };
});

// 6 energy filaments — quadratic bezier from core to hex border
const filaments: { d: string; dur: string; rev: boolean }[] = [
  { d: "M250,243 Q253,170 250,42",     dur: "2.0s", rev: false },
  { d: "M255,246 Q362,206 430,147",    dur: "2.6s", rev: false },
  { d: "M255,254 Q362,294 430,353",    dur: "2.3s", rev: true  },
  { d: "M250,257 Q247,332 250,458",    dur: "2.8s", rev: false },
  { d: "M245,254 Q138,294 70,353",     dur: "2.5s", rev: true  },
  { d: "M245,246 Q138,206 70,147",     dur: "3.0s", rev: false },
];

export default function AnimatedLogo({size=48,className,}:AnimatedLogoProps) {
  return (
    <div
  className={className}
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
      <style>{`
        @keyframes cw  { to { transform: rotate( 360deg); } }
        @keyframes ccw { to { transform: rotate(-360deg); } }
        @keyframes fil-fwd { from { stroke-dashoffset: 28; } to { stroke-dashoffset: 0; } }
        @keyframes fil-rev { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 28; } }
        @keyframes core-pulse {
          0%,100% { r: 16; opacity: 0.9; }
          50%      { r: 22; opacity: 0.5; }
        }
        @keyframes ring-pulse {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
        .r1 { animation: cw  26s linear infinite; transform-origin: 250px 250px; }
        .r2 { animation: ccw 17s linear infinite; transform-origin: 250px 250px; }
        .r3 { animation: cw  38s linear infinite; transform-origin: 250px 250px; }
        .r4 { animation: ccw 52s linear infinite; transform-origin: 250px 250px; }
        .fil-f { animation: fil-fwd var(--dur) linear infinite; }
        .fil-r { animation: fil-rev var(--dur) linear infinite; }
      `}</style>

      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <defs>
          {/* ── Filters ── */}
          <filter id="f-xs" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-md" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-lg" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="14" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-aura" x="-180%" y="-180%" width="460%" height="460%">
            <feGaussianBlur stdDeviation="24" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="f-chroma" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* ── Clip ── */}
          <clipPath id="hx"><polygon points={outerHex}/></clipPath>

          {/* ── Gradients ── */}
          <radialGradient id="g-page" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="#060c18"/>
            <stop offset="100%" stopColor="#010204"/>
          </radialGradient>
          <radialGradient id="g-hex" cx="50%" cy="40%" r="62%">
            <stop offset="0%"   stopColor="#112240"/>
            <stop offset="45%"  stopColor="#070e22"/>
            <stop offset="100%" stopColor="#030508"/>
          </radialGradient>
          <radialGradient id="g-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="25%"  stopColor="#00ffff"/>
            <stop offset="70%"  stopColor="#7b00ff" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="g-ring" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00ffff" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#00ffff" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="g-ab" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00ffff"/>
            <stop offset="44%"  stopColor="#ddf4ff"/>
            <stop offset="100%" stopColor="#ff0099"/>
          </linearGradient>
          <linearGradient id="g-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#00ffff"/>
            <stop offset="100%" stopColor="#ff0099"/>
          </linearGradient>
          <linearGradient id="g-border" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#00ffff"/>
            <stop offset="50%"  stopColor="#8800ff"/>
            <stop offset="100%" stopColor="#ff0099"/>
          </linearGradient>

          {/* ── Patterns ── */}
          <pattern id="p-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28,0 L0,0 0,28" fill="none" stroke="#0044aa" strokeWidth="0.18" opacity="0.09"/>
          </pattern>
          <pattern id="p-scan" x="0" y="0" width="500" height="5" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="500" y2="0" stroke="#00e5ff" strokeWidth="0.4" opacity="0.042"/>
          </pattern>
          <pattern id="p-hc" x="0" y="0" width="18" height="15.6" patternUnits="userSpaceOnUse">
            <polygon points="9,1 16,4.5 16,11.1 9,14.6 2,11.1 2,4.5"
              fill="none" stroke="#00e5ff" strokeWidth="0.28" opacity="0.24"/>
          </pattern>
        </defs>

        {/* ══ PAGE BG ══ */}
        {/* <rect x="0" y="0" width="500" height="500" fill="url(#g-page)"/>
        <rect x="0" y="0" width="500" height="500" fill="url(#p-grid)"/> */}

        {/* ══ DEEP AURA ══ */}
        <polygon points={outerHex} fill="none" stroke="#8800ff" strokeWidth="60"
          opacity="0.06" filter="url(#f-aura)">
          <animate attributeName="opacity" values="0.04;0.1;0.04" dur="4.5s" repeatCount="indefinite"/>
        </polygon>
        <polygon points={outerHex} fill="none" stroke="#00ffff" strokeWidth="30"
          opacity="0.05" filter="url(#f-aura)">
          <animate attributeName="opacity" values="0.05;0.13;0.05" dur="4.5s" begin="2s" repeatCount="indefinite"/>
        </polygon>

        {/* ══ RING SYSTEM (outside hex) ══ */}

        {/* Ring A — segmented CW arc, large segments */}
        <g className="r3">
          <circle cx="250" cy="250" r="247" fill="none" stroke="#00ffff"
            strokeWidth="1.6" strokeDasharray="194 68" opacity="0.38" filter="url(#f-xs)"/>
        </g>

        {/* Ring B — tiny segments CCW, magenta */}
        <g className="r2">
          <circle cx="250" cy="250" r="255" fill="none" stroke="#ff0099"
            strokeWidth="1" strokeDasharray="36 228" opacity="0.32" filter="url(#f-xs)"/>
        </g>

        {/* Ring C — tick ring, CW */}
        <g className="r1">
          <circle cx="250" cy="250" r="232" fill="none" stroke="#00ffff"
            strokeWidth="0.5" strokeDasharray="2 5" opacity="0.14"/>
          {ticks.map((t, i) => (
            <line key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#00ffff"
              strokeWidth={t.major ? 1.6 : 0.65}
              opacity={t.major ? 0.95 : 0.35}
              filter="url(#f-xs)"/>
          ))}
        </g>

        {/* Ring D — ghost slow CCW, purple */}
        <g className="r4">
          <circle cx="250" cy="250" r="241" fill="none" stroke="#8800ff"
            strokeWidth="0.6" strokeDasharray="55 13" opacity="0.22"/>
        </g>

        {/* ══ HEX BODY ══ */}
        <polygon points={outerHex} fill="url(#g-hex)"/>

        {/* ══ INTERIOR TEXTURE ══ */}
        <rect x="0" y="0" width="500" height="500" fill="url(#p-scan)" clipPath="url(#hx)"/>
        <rect x="68" y="288" width="364" height="172" fill="url(#p-hc)" clipPath="url(#hx)" opacity="0.7"/>

        {/* Sweep scan band */}
        <rect x="68" y="-35" width="364" height="35" fill="#00ffff" clipPath="url(#hx)" opacity="0.028">
          <animateTransform attributeName="transform" type="translate"
            values="0,0; 0,530" dur="11s" repeatCount="indefinite"/>
        </rect>

        {/* ══ DIAGONAL SLASH ACCENTS ══ */}
        <g clipPath="url(#hx)" filter="url(#f-sm)">
          <line x1="318" y1="40"  x2="432" y2="218" stroke="#ff0099" strokeWidth="1.6" opacity="0.88"/>
          <line x1="342" y1="40"  x2="432" y2="246" stroke="#ff0099" strokeWidth="0.75" opacity="0.45"/>
          <line x1="68"  y1="260" x2="180" y2="460" stroke="#ff0099" strokeWidth="1.6" opacity="0.6"/>
          <line x1="68"  y1="236" x2="160" y2="460" stroke="#ff0099" strokeWidth="0.75" opacity="0.32"/>
        </g>

        {/* ══ ENERGY FILAMENTS ══ */}
        {filaments.map((f, i) => (
          <path key={i} d={f.d}
            stroke="#00ffff" fill="none" strokeWidth="0.85"
            strokeDasharray="16 11" clipPath="url(#hx)" opacity="0.42"
            className={f.rev ? "fil-r" : "fil-f"}
            style={{ "--dur": f.dur } as React.CSSProperties}/>
        ))}
        {/* filament terminus dots */}
        <g fill="#00ffff" filter="url(#f-sm)" opacity="0.75">
          <circle cx="250" cy="43"  r="2.5"/>
          <circle cx="430" cy="148" r="2.5"/>
          <circle cx="430" cy="352" r="2.5"/>
          <circle cx="250" cy="457" r="2.5"/>
          <circle cx="70"  cy="352" r="2.5"/>
          <circle cx="70"  cy="148" r="2.5"/>
        </g>

        {/* ══ HEX BORDER LAYERS ══ */}
        <polygon points={innerHex} fill="none" stroke="#00ffff" strokeWidth="0.6" opacity="0.18"/>
        {/* purple wide glow */}
        <polygon points={outerHex} fill="none" stroke="#8800ff" strokeWidth="5" filter="url(#f-sm)">
          <animate attributeName="opacity" values="0.4;0.72;0.4" dur="4.5s" repeatCount="indefinite"/>
        </polygon>
        {/* cyan crisp edge */}
        <polygon points={outerHex} fill="none" stroke="#00ffff" strokeWidth="1.8" filter="url(#f-xs)">
          <animate attributeName="opacity" values="0.65;1;0.65" dur="4.5s" repeatCount="indefinite"/>
        </polygon>

        {/* ══ VERTEX CROSSHAIR BURSTS ══ */}
        {vertices.map(([vx, vy], i) => (
          <g key={i} filter="url(#f-md)">
            <circle cx={vx} cy={vy} r="11" fill="none" stroke="#00ffff" strokeWidth="0.6" opacity="0.35"/>
            <circle cx={vx} cy={vy} r="5"  fill="#00ffff" opacity="0.95"/>
            <line x1={vx - 10} y1={vy} x2={vx + 10} y2={vy} stroke="#00ffff" strokeWidth="0.9" opacity="0.65"/>
            <line x1={vx} y1={vy - 10} x2={vx} y2={vy + 10} stroke="#00ffff" strokeWidth="0.9" opacity="0.65"/>
          </g>
        ))}

        {/* ══ CORNER BRACKETS ══ */}
        <g stroke="#00ffff" strokeWidth="1.7" fill="none" filter="url(#f-sm)">
          <path d="M148,186 L148,159 L175,159"/>
          <path d="M352,186 L352,159 L325,159"/>
          <path d="M148,314 L148,341 L175,341"/>
          <path d="M352,314 L352,341 L325,341"/>
        </g>
        <g fill="#00ffff" filter="url(#f-sm)">
          <rect x="145" y="156" width="5.5" height="5.5"/>
          <rect x="349.5" y="156" width="5.5" height="5.5"/>
          <rect x="145" y="338.5" width="5.5" height="5.5"/>
          <rect x="349.5" y="338.5" width="5.5" height="5.5"/>
        </g>
        {/* magenta corner accent squares */}
        <g fill="#ff0099" filter="url(#f-xs)" opacity="0.7">
          <rect x="146.5" y="157.5" width="2.5" height="2.5"/>
          <rect x="351" y="157.5" width="2.5" height="2.5"/>
          <rect x="146.5" y="340" width="2.5" height="2.5"/>
          <rect x="351" y="340" width="2.5" height="2.5"/>
        </g>

        {/* ══ SEPARATOR LINES + TICKS ══ */}
        <line x1="148" y1="197" x2="352" y2="197" stroke="#00ffff" strokeWidth="0.7" opacity="0.3"/>
        <line x1="148" y1="318" x2="352" y2="318" stroke="#00ffff" strokeWidth="0.7" opacity="0.3"/>
        <g stroke="#00ffff" strokeWidth="1.5" filter="url(#f-xs)">
          <line x1="161" y1="192" x2="161" y2="202"/>
          <line x1="181" y1="194" x2="181" y2="200"/>
          <line x1="339" y1="192" x2="339" y2="202"/>
          <line x1="319" y1="194" x2="319" y2="200"/>
          <line x1="161" y1="313" x2="161" y2="323"/>
          <line x1="181" y1="315" x2="181" y2="321"/>
          <line x1="339" y1="313" x2="339" y2="323"/>
          <line x1="319" y1="315" x2="319" y2="321"/>
        </g>

        {/* ══ DATA READOUTS ══ */}
        <text x="157" y="190" fontFamily="'Orbitron',monospace" fontSize="7"
          fill="#00ffff" opacity="0.42" letterSpacing="1">SYS.OK</text>
        <text x="343" y="190" fontFamily="'Orbitron',monospace" fontSize="7"
          fill="#ff0099" opacity="0.42" letterSpacing="1" textAnchor="end">v2.4.1</text>
        <text x="157" y="333" fontFamily="'Orbitron',monospace" fontSize="7"
          fill="#00ffff" opacity="0.42" letterSpacing="1">NET::OK</text>
        <text x="343" y="333" fontFamily="'Orbitron',monospace" fontSize="7"
          fill="#ff0099" opacity="0.42" letterSpacing="1" textAnchor="end">0xFF42</text>

        {/* ══ CENTRAL ENERGY CORE ══ */}
        {/* expanding pulse ring */}
        <circle cx="250" cy="250" r="28" fill="none" stroke="#00ffff"
          strokeWidth="1" opacity="0.25" filter="url(#f-md)">
          <animate attributeName="r" values="24;38;24" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.18;0.55;0.18" dur="3s" repeatCount="indefinite"/>
        </circle>
        {/* second inner ring */}
        <circle cx="250" cy="250" r="14" fill="none" stroke="#00ffff"
          strokeWidth="0.8" opacity="0.5" filter="url(#f-sm)">
          <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
        </circle>
        {/* radial glow fill */}
        <circle cx="250" cy="250" r="20" fill="url(#g-core)" filter="url(#f-lg)">
          <animate attributeName="r" values="16;24;16" dur="3s" repeatCount="indefinite"/>
        </circle>
        {/* bright center pinpoint */}
        <circle cx="250" cy="250" r="4.5" fill="#ffffff" filter="url(#f-sm)">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite"/>
        </circle>

        {/* ══ A|B SPLIT LINE ══ */}
        <line x1="250" y1="204" x2="250" y2="298"
          stroke="#ff0099" strokeWidth="1.4" opacity="0.55" filter="url(#f-sm)">
          <animate attributeName="opacity" values="0.45;0.75;0.45" dur="4s" repeatCount="indefinite"/>
        </line>

        {/* ══ "AB" — 5-LAYER CHROMATIC TREATMENT ══ */}

        {/* 1. Shadow */}
        <text x="254" y="302" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="136"
          textAnchor="middle" fill="#000000" opacity="0.55">AB</text>

        {/* 2. Cyan chroma (offset left) */}
        <text x="244" y="298" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="136"
          textAnchor="middle" fill="#00ffff" opacity="0.48" filter="url(#f-chroma)">
          AB
          <animateTransform attributeName="transform" type="translate" additive="sum"
            values="0 0;0 0;-11 1;0 0;0 0" dur="8s"
            keyTimes="0;0.81;0.855;0.89;1" repeatCount="indefinite"/>
          <animate attributeName="opacity"
            values="0.48;0.48;0.95;0.48;0.48" dur="8s"
            keyTimes="0;0.81;0.855;0.89;1" repeatCount="indefinite"/>
        </text>

        {/* 3. Magenta chroma (offset right) */}
        <text x="256" y="298" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="136"
          textAnchor="middle" fill="#ff0099" opacity="0.38" filter="url(#f-chroma)">
          AB
          <animateTransform attributeName="transform" type="translate" additive="sum"
            values="0 0;0 0;11 -1;0 0;0 0" dur="8s"
            keyTimes="0;0.81;0.855;0.89;1" repeatCount="indefinite"/>
          <animate attributeName="opacity"
            values="0.38;0.38;0.82;0.38;0.38" dur="8s"
            keyTimes="0;0.81;0.855;0.89;1" repeatCount="indefinite"/>
        </text>

        {/* 4. Bloom glow */}
        <text x="250" y="298" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="136"
          textAnchor="middle" fill="url(#g-glow)" filter="url(#f-bloom)">
          AB
          <animate attributeName="opacity" values="0.22;0.42;0.22" dur="4.5s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" additive="sum"
            values="0 0;0 0;-12 0;12 0;0 0;0 0" dur="8s"
            keyTimes="0;0.81;0.84;0.87;0.89;1" repeatCount="indefinite"/>
        </text>

        {/* 5. Main gradient text */}
        <text x="250" y="298" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="136"
          textAnchor="middle" fill="url(#g-ab)">
          AB
          <animateTransform attributeName="transform" type="translate" additive="sum"
            values="0 0;0 0;-12 0;12 0;0 0;0 0" dur="8s"
            keyTimes="0;0.81;0.84;0.87;0.89;1" repeatCount="indefinite"/>
          <animate attributeName="opacity"
            values="1;1;0.78;1;1;0.86;1" dur="8s"
            keyTimes="0;0.79;0.82;0.855;0.88;0.91;1" repeatCount="indefinite"/>
        </text>

        {/* ══ "PORTFOLIO" ══ */}
        <g filter="url(#f-xs)">
          <rect x="150" y="329.5" width="20" height="1.4" fill="#ff0099" opacity="0.55"/>
          <rect x="330" y="329.5" width="20" height="1.4" fill="#ff0099" opacity="0.55"/>
        </g>
        <text x="250" y="337" fontFamily="'Orbitron',monospace" fontWeight="400" fontSize="10"
          textAnchor="middle" fill="#00ffff" opacity="0.62" letterSpacing="6">PORTFOLIO</text>

        {/* ══ GLITCH STRIPS ══ */}
        <g clipPath="url(#hx)">
          <rect x="148" y="241" width="204" height="9" fill="#00ffff" opacity="0">
            <animate attributeName="opacity"
              values="0;0;0;0.42;0;0" dur="8s"
              keyTimes="0;0.79;0.82;0.855;0.89;1" repeatCount="indefinite"/>
          </rect>
          <rect x="148" y="272" width="128" height="5" fill="#ff0099" opacity="0">
            <animate attributeName="opacity"
              values="0;0;0;0;0.34;0" dur="8s"
              keyTimes="0;0.79;0.82;0.855;0.89;1" repeatCount="indefinite"/>
          </rect>
          <rect x="196" y="259" width="72" height="3" fill="#ffffff" opacity="0">
            <animate attributeName="opacity"
              values="0;0;0.24;0;0;0" dur="8s"
              keyTimes="0;0.82;0.845;0.87;0.89;1" repeatCount="indefinite"/>
          </rect>
        </g>

        {/* ══ POWER SURGE FLASH ══ */}
        <polygon points={outerHex} fill="#00ffff" clipPath="url(#hx)" opacity="0">
          <animate attributeName="opacity"
            values="0;0;0;0;0.08;0.04;0" dur="9s"
            keyTimes="0;0.87;0.89;0.9;0.91;0.93;0.96" repeatCount="indefinite"/>
        </polygon>
        {/* surge ring flare */}
        <circle cx="250" cy="250" r="140" fill="none" stroke="#00ffff"
          strokeWidth="60" clipPath="url(#hx)" opacity="0" filter="url(#f-lg)">
          <animate attributeName="opacity"
            values="0;0;0;0;0.18;0;0" dur="9s"
            keyTimes="0;0.87;0.89;0.9;0.91;0.93;0.96" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}
