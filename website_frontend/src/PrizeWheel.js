import React, { useState } from "react";

/**
 * PUBLIC_INTERFACE
 * PrizeWheel component
 * An animated spinning wheel that, when spun, fetches a new (random) recipe via prop callback,
 * updates the display with that recipe's details, and displays just colored segments (no labels or text) for the slices.
 * 
 * Props:
 * - fetchRandomRecipe: function that returns a Promise that resolves to a new recipe object { name, description, ... }
 *   (instead of passing a list of recipes up front)
 * - (Optional) colorPalette: array of color HEX strings to use for wheel segments (default palette supplied)
 *
 * Usage:
 *   <PrizeWheel fetchRandomRecipe={fetchRandomRecipeFromAPI} />
 */
function PrizeWheel({ fetchRandomRecipe, colorPalette }) {
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

  // Number of segments (arbitrarily chosen for animation, independent of recipes count)
  const SEGMENTS = colors.length;

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = async () => {
    if (spinning) return;
    setSpinning(true);

    // Pick new random segment for animation
    const newIndex = Math.floor(Math.random() * SEGMENTS);

    // Fetch new recipe from API/prop
    let recipe = null;
    try {
      recipe = await fetchRandomRecipe();
    } catch (err) {
      recipe = { name: "Error", description: "Failed to fetch recipe!" };
    }

    // Animate: rotate to the target segment
    const spins = 4;
    const newRotation = 360 * spins + (360 / SEGMENTS) * newIndex;

    setTimeout(() => {
      setSelectedSegment(newIndex);
      setSelectedRecipe(recipe);
      setRotation(newRotation);
      setSpinning(false);
    }, 1500);

    // Start animation immediately for responsive UI
    setRotation(newRotation);
  };

  /**
   * Generates SVG path for an individual segment.
   */
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

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ margin: "0 auto", width: "260px", height: "260px", position: "relative" }}>
        <svg
          width="260"
          height="260"
          viewBox="0 0 260 260"
          style={{
            transition: spinning ? "transform 1.5s cubic-bezier(0.13,0.81,0.43,1.02)" : "none",
            transform: `rotate(${rotation}deg)`,
            willChange: "transform"
          }}
        >
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <path
              key={i}
              d={segmentPath(i, SEGMENTS)}
              fill={colors[i % colors.length]}
              opacity={selectedSegment === i ? 1 : 0.72}
              stroke="#333"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div style={{
          position: "absolute",
          top: 120, left: 120, width: 20, height: 20,
          background: "#fff", borderRadius: "50%",
          border: "3px solid #1DB954",
          transform: "translate(-50%, -50%)"
        }} />
      </div>
      <button
        onClick={spinWheel}
        disabled={spinning}
        style={{
          marginTop: 18,
          background: "#1DB954",
          color: "#fff",
          border: "none",
          borderRadius: 30,
          padding: "12px 44px",
          fontSize: 18,
          cursor: spinning ? "not-allowed" : "pointer",
          fontWeight: 600
        }}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {selectedRecipe && (
        <div style={{ marginTop: 25 }}>
          <h3>{selectedRecipe.name}</h3>
          <p>{selectedRecipe.description}</p>
        </div>
      )}
    </div>
  );
}

export default PrizeWheel;
