import React from "react";

// Cooking equipment SVGs, colored for theme
const equipmentSvgs = [
  // Frying pan
  ({ size = 42, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 42 42" style={style}>
      <ellipse cx="22" cy="22" rx="14" ry="8.8" fill="#392112" />
      <ellipse cx="22" cy="22" rx="11.3" ry="6.9" fill="#fff0c8" />
      <rect x="35" y="17.7" width="6.2" height="3.2" rx="1.7" fill="#aaaaaa" transform="rotate(32 35 17.7)"/>
      <rect x="38.5" y="14" width="4.0" height="5.2" rx="1.2" fill="#d6a675" transform="rotate(32 38.5 14)"/>
      <ellipse cx="22" cy="22" rx="8.2" ry="5.3" fill="#c19e59" opacity="0.38"/>
    </svg>
  ),
  // Spoon
  ({ size = 34, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 34 34" style={style}>
      <ellipse cx="11" cy="12" rx="9" ry="6.5" fill="#fbeedc"/>
      <rect x="15.4" y="18.2" width="11.6" height="4" rx="2.5" fill="#c8a165" transform="rotate(32 15.4 18.2)"/>
      <ellipse cx="26.9" cy="27.3" rx="2.4" ry="1.2" fill="#a77d45"/>
    </svg>
  ),
  // Knife
  ({ size = 40, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 38 38" style={style}>
      <rect x="17" y="5" width="3.7" height="23" rx="1.8" fill="#eaeaea"/>
      <rect x="17" y="25" width="3.7" height="8" rx="1.2" fill="#debe84"/>
      <ellipse cx="18.9" cy="8" rx="1.5" ry="0.7" fill="#8492aa"/>
    </svg>
  ),
  // Whisk
  ({ size = 37, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 37 37" style={style}>
      <ellipse cx="16" cy="14" rx="10" ry="4.6" fill="none" stroke="#e4bc74" strokeWidth="2"/>
      <ellipse cx="16" cy="14" rx="6" ry="2.6" fill="none" stroke="#e4bc74" strokeWidth="2"/>
      <rect x="12.5" y="20" width="7.6" height="12" rx="2.8" fill="#ddb683"/>
    </svg>
  ),
  // Pot (casserole)
  ({ size = 40, style = {} }) => (
    <svg width={size} height={size} viewBox="0 0 42 42" style={style}>
      <ellipse cx="21" cy="24" rx="13" ry="7.5" fill="#e9c995"/>
      <rect x="8" y="18" width="26" height="11" rx="4" fill="#f7ebe0"/>
      <rect x="10" y="23" width="22" height="9" rx="3.7" fill="#a79263" />
      <rect x="6" y="16" width="6" height="2.2" rx="0.9" fill="#b9c4be"/>
      <rect x="30" y="16" width="6" height="2.2" rx="0.9" fill="#b9c4be"/>
    </svg>
  ),
];

// Calculate random keyframes & parameters for lively animation
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * PUBLIC_INTERFACE
 * FloatingEquipment renders several animated SVG cooking icons gently drifting on the background.
 * - Uses random paths, delays, and speed for organic feel.
 * - No interaction, purely decorative.
 */
export default function FloatingEquipment({ count = 7, style = {} }) {
  // Generate parameters on mount only (so icons don't "jump" on re-render)
  const icons = React.useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
      const eq = equipmentSvgs[i % equipmentSvgs.length];
      // Random position, drift direction, size, speed, delay
      return {
        eq,
        id: `equip-float-${i}`,
        size: randomFloat(28, 48),
        x: randomFloat(3, 88), // vw
        y: randomFloat(1, 81),
        driftX: randomFloat(-16, 16),
        driftY: randomFloat(-15, 23),
        rotate: randomFloat(-18, 18),
        speed: randomFloat(18, 32), // seconds per cycle
        delay: -randomFloat(0, 22),
        flip: Math.random() > 0.49,
        opacity: randomFloat(0.59, 0.92),
        z: Math.floor(randomFloat(0, 2)),
      };
    }),[]
  );

  return (
    <div
      className="floating-equipment-set"
      style={{
        pointerEvents: "none",
        position: "fixed",
        left: 0, top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        ...style
      }}
      aria-hidden="true"
    >
      {icons.map(icon => (
        <span
          key={icon.id}
          style={{
            position: "absolute",
            left: `${icon.x}vw`,
            top: `${icon.y}vh`,
            opacity: icon.opacity,
            zIndex: icon.z,
            filter: "blur(0.4px) drop-shadow(0 1.5px 12px #ffdbb080)",
            animation: `floatware-${icon.id} ${icon.speed}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
            transform: [
              icon.flip ? "scaleX(-1)" : "",
              `rotate(${icon.rotate}deg)`
            ].join(" "),
          }}
        >
          <style>
            {`
            @keyframes floatware-${icon.id} {
              0% {
                transform: ${icon.flip ? "scaleX(-1)" : ""} rotate(${icon.rotate}deg) translate(0px,0px);
              }
              48% {
                transform: ${icon.flip ? "scaleX(-1)" : ""} rotate(${icon.rotate+randomFloat(2,8)}deg) translate(${icon.driftX}px,${icon.driftY/2}px);
              }
              100% {
                transform: ${icon.flip ? "scaleX(-1)" : ""} rotate(${icon.rotate+randomFloat(3,7)}deg) translate(${icon.driftX}px,${icon.driftY}px);
              }
            }
          `}
          </style>
          {icon.eq({ size: icon.size })}
        </span>
      ))}
    </div>
  );
}
