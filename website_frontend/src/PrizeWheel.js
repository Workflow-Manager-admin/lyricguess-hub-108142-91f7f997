import React, { useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * PrizeWheel component (recipe demo edition):
 * - Renders an animated spinning wheel with colored segments (NO TEXT, no icon or label per wedge)
 * - Emits onSpinEnd(selectedIdx) — selected wedge index — when spin ends.
 * - Lively SVG/CSS animation, styled with a chef/cooking palette.
 *
 * @param {Object} props
 *   - options: Array<any> (for number of segments ONLY; contents are ignored for text)
 *   - onSpinEnd: function(idx) — called with the index of the selected wedge.
 *   - spinning: bool (trigger visual animation externally; optional)
 *   - disabled: bool (blocks user initiation)
 *   - size: (wheel diameter, default 325)
 *   - style: (extra overrides)
 */
const PALETTE = [
  "#ffad5a", // orange
  "#fdc370", // lighter orange
  "#ffe8b2", // pale yellow
  "#d8d9ec", // violet
  "#d9ecb9", // green
  "#f6b5c0", // pink
  "#f5cd72", // yellow
  "#c4e7e3", // mint
];

export default function PrizeWheel({
  options = new Array(8).fill(0),
  onSpinEnd = () => {},
  spinning = false,
  disabled = false,
  size = 325,
  style = {},
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastIdx, setLastIdx] = useState(null);
  const canvasRef = useRef();
  const segments = options.length;
  const anglePer = 360 / segments;

  // PUBLIC_INTERFACE
  function spinWheel() {
    if (isSpinning || disabled) return;
    setIsSpinning(true);

    // Select wedge index randomly
    const idx = Math.floor(Math.random() * segments);
    setLastIdx(idx);

    // 3-6 full spins + landing on chosen index (+ slight wobble)
    const fullSpins = Math.floor(Math.random() * 3) + 3;
    const finalAngle =
      360 * fullSpins +
      (360 - idx * anglePer - anglePer / 2) +
      Math.random() * (anglePer * 0.25);

    setRotation(finalAngle);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(idx);
    }, 1850);
  }

  // SVG wedge generator (no text!!)
  function getWedgePath(cx, cy, radius, fromAngle, toAngle) {
    const start = polarToCartesian(cx, cy, radius, fromAngle);
    const end = polarToCartesian(cx, cy, radius, toAngle);

    const largeArc = toAngle - fromAngle > 180 ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const a = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  }

  // Center "whisk" SVG for flair
  function renderWhisk(size = 40) {
    return (
      <svg width={size} height={size} viewBox="0 0 50 50">
        <ellipse cx="18" cy="22" rx="11" ry="15" fill="#f3f2eb" stroke="#c39c65" strokeWidth="2"/>
        <ellipse cx="24" cy="22" rx="4.5" ry="14" fill="none" stroke="#d49f47" strokeWidth="2"/>
        <ellipse cx="14" cy="22" rx="3.3" ry="12" fill="none" stroke="#dfbc77" strokeWidth="2"/>
        <rect x="16.7" y="37" width="2.7" height="9" fill="#e9ad77" stroke="#a37742" strokeWidth="1"/>
        <rect x="15.5" y="45.5" width="5.6" height="3.2" rx="1.4" fill="#c8a96b"/>
      </svg>
    );
  }

  function renderPointer() {
    return (
      <svg width="36" height="32" viewBox="0 0 36 32">
        <polygon points="18,0 36,31 0,31" fill="#f3b845" stroke="#c18e08" strokeWidth="2"/>
        <ellipse cx="18" cy="12" rx="5.8" ry="4.2" fill="#fff6e1" opacity="0.45"/>
      </svg>
    );
  }

  // Main render: color-only segments, no wedge label text at all!
  return (
    <div
      style={{
        position: "relative",
        width: size,
        margin: "0 auto",
        userSelect: "none",
        ...style,
      }}
    >
      {/* Wheel body */}
      <div
        className="wheel-spin-box"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 49% 51%, #fffbe7 72%, #ffeab1 100%)",
          boxShadow: "0 10px 34px #ffdfa4aa,0 3px 15px #cca36a40",
          transform: `rotate(${isSpinning || spinning ? rotation : 0}deg)`,
          transition: isSpinning || spinning
            ? "transform 1.77s cubic-bezier(.15,1.1,.29,1.02)"
            : "transform 0.16s",
        }}
        ref={canvasRef}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Colored wedges, no text */}
          {options.map((_, i) => {
            const aStart = i * anglePer;
            const aEnd = (i + 1) * anglePer;
            return (
              <path
                key={i}
                d={getWedgePath(size/2, size/2, size/2-14, aStart, aEnd)}
                fill={PALETTE[i % PALETTE.length]}
                stroke="#fffbe3"
                strokeWidth="3"
                style={{ filter: "drop-shadow(0 3.5px 12px #ecd24e44)" }}
              />
            );
          })}
          {/* No label text */}
          {/* Rim */}
          <circle
            cx={size/2}
            cy={size/2}
            r={size/2-10}
            fill="none"
            stroke="#cf9d31"
            strokeWidth="5.5"
            style={{ filter: "blur(.7px)" }}
          />
          {/* Center whisk equipment */}
          <g>
            <g transform={`translate(${size/2 - 20},${size/2 - 18})`}>
              {renderWhisk(40)}
            </g>
            <circle
              cx={size/2}
              cy={size/2}
              r={19}
              fill="#fffbe3"
              stroke="#d4b179"
              strokeWidth="3.5"
              style={{ opacity: 0.92 }}
            />
          </g>
        </svg>
      </div>
      {/* Spin Pointer */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: -38,
          zIndex: 2,
          transform: "translateX(-50%)",
          width: 36,
          height: 34,
          pointerEvents: "none",
        }}
      >
        {renderPointer()}
      </div>
      {/* Spin Button */}
      <button
        className="btn accent"
        style={{
          margin: "10px auto 0 auto",
          display: "block",
          width: "72%",
          fontWeight: 800,
          fontSize: 22,
          borderRadius: 14,
          background: "#fc7e2a linear-gradient(99deg, #ffad5a 60%, #f3e2b4 100%)",
          color: "#fff",
          boxShadow: "0 4px 19px #b09769",
          letterSpacing: ".03em",
          outline: isSpinning ? "2.5px solid #fc7e2add" : "",
          cursor: isSpinning || disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          pointerEvents: isSpinning || disabled ? "none" : "auto"
        }}
        disabled={isSpinning || disabled}
        onClick={spinWheel}
        aria-label="Spin the recipe wheel"
      >
        {isSpinning ? "Spinning..." : "Spin the Recipe Wheel"}
      </button>
    </div>
  );
}
