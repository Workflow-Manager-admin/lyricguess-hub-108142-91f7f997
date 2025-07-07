import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * PrizeWheel component
 * Props:
 * - onSpin: function(cbFetchRecipe) => void; called when spin completes, must provide cbFetchRecipe that returns a new recipe object
 * - fetchRandomRecipe: () => recipe object; parent App's current recipe getter for PrizeWheel to call to fetch a random recipe
 * - recipe: current recipe object (used for preview/labeling, optional)
 */
export default function PrizeWheel({
  onSpin,
  fetchRandomRecipe,
  colorPalette,
  recipe,
}) {
  const defaultColors = [
    "#1DB954",
    "#191414",
    "#F5C518",
    "#E57373",
    "#64B5F6",
    "#81C784",
    "#FFD54F",
    "#BA68C8",
  ];
  const colors = colorPalette && colorPalette.length ? colorPalette : defaultColors;
  const SEGMENTS = colors.length;

  // Animation local state
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(() => Math.random() * 360);
  const [selectedSegment, setSelectedSegment] = useState(null);

  // MAIN: Spin button handler
  const spinWheel = async () => {
    if (spinning) return;
    setSpinning(true);

    // Pick a random segment for visual effect (not tightly coupled to recipe unless desired)
    const newIndex = Math.floor(Math.random() * SEGMENTS);

    // Animate: rotate (must look smooth, random, and fun)
    const spins = 4 + Math.floor(Math.random() * 3); // More than one full circle
    const newRotation = 360 * spins + (360 / SEGMENTS) * newIndex + Math.random() * 20;
    setRotation(newRotation);

    setTimeout(() => {
      setSelectedSegment(newIndex);
      setSpinning(false);
      // Call parent App to get a new recipe & update all panels after spin is "settled"
      if (typeof onSpin === "function") {
        // Provide a callback that App must call to get a fresh recipe (should return a Promise of recipe object)
        onSpin(fetchRandomRecipe);
      }
    }, 1550);
  };

  // SVG path for each segment
  function segmentPath(i, segments, radius = 120, cx = 130, cy = 130) {
    const angle = (2 * Math.PI) / segments;
    const x1 = cx + radius * Math.cos(angle * i - Math.PI / 2);
    const y1 = cy + radius * Math.sin(angle * i - Math.PI / 2);
    const x2 = cx + radius * Math.cos(angle * (i + 1) - Math.PI / 2);
    const y2 = cy + radius * Math.sin(angle * (i + 1) - Math.PI / 2);
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    return `
      M ${cx},${cy}
      L ${x1},${y1}
      A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}
      Z
    `;
  }

  // Optionally show current recipe name in the center (preview)
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ margin: "0 auto", width: 260, height: 260, position: "relative" }}>
        <svg
          width="260"
          height="260"
          viewBox="0 0 260 260"
          style={{
            transition: spinning ? "transform 1.55s cubic-bezier(0.13,0.81,0.43,1.02)" : "none",
            transform: `rotate(${rotation}deg)`,
            willChange: "transform",
          }}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <path
              key={i}
              d={segmentPath(i, SEGMENTS)}
              fill={colors[i % colors.length]}
              opacity={selectedSegment === i ? 1 : 0.75}
              stroke="#333"
              strokeWidth="2"
            />
          ))}
        </svg>
        {/* Center white circle */}
        <div style={{
          position: "absolute",
          top: 120, left: 120, width: 24, height: 24,
          background: "#fff", borderRadius: "50%",
          border: "3px solid #1DB954",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 1.4px 9px #272b384c"
        }} />
        {/* Optional: floating label of current recipe */}
        {recipe && (
          <div
            style={{
              position: "absolute",
              top: "57%",
              left: "50%",
              transform: "translate(-50%, -35%)",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 17.5,
              letterSpacing: ".02em",
              color: "#191414",
              opacity: 0.82,
              pointerEvents: "none"
            }}
          >
            {recipe.name}
          </div>
        )}
      </div>
      <button
        onClick={spinWheel}
        disabled={spinning}
        style={{
          marginTop: 22,
          background: "#1DB954",
          color: "#fff",
          border: "none",
          borderRadius: 30,
          padding: "13px 52px",
          fontSize: 20,
          cursor: spinning ? "not-allowed" : "pointer",
          fontWeight: 600,
          boxShadow: "0 2px 16px #1db9541a"
        }}
        aria-label="Spin the wheel"
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
    </div>
  );
}
