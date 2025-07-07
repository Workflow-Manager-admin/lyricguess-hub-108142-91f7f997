import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * PrizeWheel renders an interactive spinning wheel.
 * Props:
 *   - onSpin: callback to trigger when spin finishes
 *   - spinning: external control for disabled state
 */
const segments = [
  { color: '#FFD700', label: '🎁', arc: 60 },
  { color: '#01C49A', label: '🥕', arc: 60 },
  { color: '#FF6333', label: '🍅', arc: 60 },
  { color: '#6A4FB6', label: '🥦', arc: 60 },
  { color: '#54A0FF', label: '🍋', arc: 60 },
  { color: '#F5C518', label: '🍇', arc: 60 }, // 6 slices for variety
];

const segDeg = 360 / segments.length;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// PUBLIC_INTERFACE
function PrizeWheel({ onSpin, spinning }) {
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (!spinning && isSpinning) setIsSpinning(false);
  }, [spinning, isSpinning]);

  // Spin logic gives a full random turn, ensuring visible variety.
  const handleSpin = () => {
    if (isSpinning || spinning) return;
    const newTurn = 10 + getRandomInt(4);            // at least 10 full turns
    const finalSeg = getRandomInt(segments.length);   // select target segment
    const nextAngle = newTurn * 360 + segDeg * finalSeg + getRandomInt(segDeg);
    setIsSpinning(true);
    setAngle(prev => prev + nextAngle);

    setTimeout(() => {
      setIsSpinning(false);
      if (onSpin) onSpin();
    }, 2400);
  };

  return (
    <div className="prize-wheel-container">
      <div
        className={`prize-wheel ${isSpinning ? 'spinning' : ''}`}
        ref={wheelRef}
        onClick={handleSpin}
        style={{
          pointerEvents: (isSpinning || spinning) ? 'none' : 'auto',
          transform: `rotate(${angle}deg)`,
          transition: isSpinning ? 'transform 2.2s cubic-bezier(.18,.89,.32,1.28)' : 'none'
        }}
        role="button"
        tabIndex={0}
        aria-label="Spin recipe prize wheel"
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <g>
            {segments.map((seg, idx) => {
              const startAngle = (360 / segments.length) * idx;
              const endAngle = startAngle + seg.arc;
              // Convert angle to radians for SVG arc
              const largeArcFlag = seg.arc > 180 ? 1 : 0;
              const x1 = 100 + 100 * Math.cos((Math.PI/180) * startAngle);
              const y1 = 100 + 100 * Math.sin((Math.PI/180) * startAngle);
              const x2 = 100 + 100 * Math.cos((Math.PI/180) * endAngle);
              const y2 = 100 + 100 * Math.sin((Math.PI/180) * endAngle);
              return (
                <path
                  key={idx}
                  d={`
                    M100,100
                    L${x1},${y1}
                    A100,100 0 ${largeArcFlag} 1 ${x2},${y2}
                    Z
                  `}
                  fill={seg.color}
                  opacity="0.98"
                />
              );
            })}
            {/* Draw dividing lines */}
            {segments.map((_, idx) => {
              const angleDeg = (360 / segments.length) * idx;
              const x = 100 + 100 * Math.cos((Math.PI/180) * angleDeg);
              const y = 100 + 100 * Math.sin((Math.PI/180) * angleDeg);
              return (
                <line
                  key={`line-${idx}`}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="#fff"
                  strokeWidth="3"
                />
              );
            })}
          </g>
          {/* Labels */}
          {segments.map((seg, idx) => {
            const labelAngle = (360 / segments.length) * idx + seg.arc / 2;
            const x = 100 + 70 * Math.cos((Math.PI/180) * labelAngle);
            const y = 100 + 70 * Math.sin((Math.PI/180) * labelAngle);
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="26"
                aria-label={seg.label}
              >
                {seg.label}
              </text>
            );
          })}
        </svg>
        <div className="wheel-pointer">&#9660;</div>
      </div>
      <div className="subtitle">Tap or click wheel to spin</div>
    </div>
  );
}

export default PrizeWheel;
