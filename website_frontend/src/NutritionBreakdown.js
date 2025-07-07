import React from "react";

/**
 * PUBLIC_INTERFACE
 * NutritionBreakdown component: Displays a colorful, happy nutrition breakdown as a chart.
 * @param {Object} props - expects: { ingredients: [ {ingredient, measure} ], style? }
 * It estimates nutrition per recipe using ingredient list (mock logic).
 */
export default function NutritionBreakdown({ ingredients = [], style = {} }) {
  // Mock nutrition estimate: assign some numbers based on keywords in ingredient name.
  // In a real app, you would call Edamam/FatSecret/FoodDataCentral or similar.
  // Here, color and shape makes the UI lively!
  const NUTRIENTS = [
    { key: "calories", label: "Calories", icon: "🔥", color: "#fc7e2a" },
    { key: "protein", label: "Protein", icon: "🥚", color: "#4BCB4B" },
    { key: "carbs", label: "Carbs", icon: "🍞", color: "#FFD36C" },
    { key: "fat", label: "Fat", icon: "🥑", color: "#DD3484" },
    { key: "fiber", label: "Fiber", icon: "🥕", color: "#6DC940" },
    { key: "sugar", label: "Sugar", icon: "🍬", color: "#FC89C0" },
  ];

  // Basic estimation rules (very rough! For demo only)
  const nutrientBase = {
    calories: 150,
    protein: 3,
    carbs: 20,
    fat: 5,
    fiber: 1,
    sugar: 3,
  };
  const keywords = {
    protein: ["chicken", "beef", "egg", "fish", "tofu", "turkey", "pork", "beans", "lentil", "cheese", "yogurt", "milk", "shrimp", "salmon"],
    carbs: ["rice", "bread", "potato", "flour", "noodle", "pasta", "sugar", "tortilla", "corn", "bun", "cracker", "barley"],
    fat: ["oil", "butter", "avocado", "cheese", "bacon", "coconut", "cream", "mayonnaise", "nut", "olive"],
    fiber: ["bean", "lentil", "broccoli", "spinach", "lettuce", "carrot", "pea", "oat", "bran", "seed"],
    sugar: ["honey", "sugar", "syrup", "maple", "molasses", "jam", "jelly", "sweet"],
  };

  // Tally up mock nutrients
  const est = { ...nutrientBase };
  (ingredients || []).forEach(({ ingredient }) => {
    const ingr = (ingredient || "").toLowerCase();
    for (const nut of Object.keys(keywords)) {
      if (keywords[nut].some(k => ingr.includes(k))) {
        est[nut] += 5;
        if (nut === "protein") est.protein += 2;
        if (nut === "carbs") est.carbs += 7;
        if (nut === "fiber") est.fiber += 2;
        if (nut === "fat") est.fat += 2;
        if (nut === "sugar") est.sugar += 3;
      }
    }
    est.calories += 12; // Each ingredient +12 cal as rough average
  });

  // Pie chart segment generator (SVG, no external lib, fully inline)
  // Convert each value to angle proportional to total
  const values = NUTRIENTS.map(n => est[n.key]);
  const total = values.reduce((a, b) => a + b, 0);
  let angles = [];
  let csum = 0;
  for (let i = 0; i < values.length; ++i) {
    let frac = values[i] / total;
    let startAngle = csum * 360;
    let endAngle = (csum + frac) * 360;
    angles.push({ start: startAngle, end: endAngle });
    csum += frac;
  }

  // Function to create SVG arc for each segment
  function describeArc(cx, cy, r, start, end) {
    const rad = x => (x - 90) * Math.PI / 180.0;
    const x1 = cx + (r * Math.cos(rad(start)));
    const y1 = cy + (r * Math.sin(rad(start)));
    const x2 = cx + (r * Math.cos(rad(end)));
    const y2 = cy + (r * Math.sin(rad(end)));
    const large = end - start > 180 ? 1 : 0;
    return [
      "M", cx, cy,
      "L", x1, y1,
      "A", r, r, 0, large, 1, x2, y2,
      "Z"
    ].join(" ");
  }

  return (
    <div
      className="nutrition-chart"
      style={{
        background: "#fff2e3",
        border: "1.6px solid #FFD36C",
        borderRadius: 15,
        boxShadow: "0 2px 19px #ffe2c07b",
        marginTop: 16,
        marginBottom: 11,
        padding: "20px 15px 15px 15px",
        maxWidth: 420,
        textAlign: "center",
        ...style
      }}
    >
      <div style={{
        fontWeight: 800,
        fontSize: 21,
        letterSpacing: ".03em",
        color: "#fc7e2a",
        marginBottom: 2,
        textShadow: "0 1px 8px #ffe7a218"
      }}>
        Nutrition Breakdown
      </div>
      <div style={{ fontSize: 14, color: "#957e52", marginBottom: 10, fontWeight: 500 }}>
        (Estimated per serving)
      </div>
      {/* Pie chart */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 17 }}>
        <svg width={110} height={110} viewBox="0 0 110 110" style={{ marginBottom: 3 }}>
          {NUTRIENTS.map((nut, idx) => (
            <path
              key={nut.key}
              d={describeArc(55, 55, 46, angles[idx].start, angles[idx].end)}
              fill={nut.color}
              stroke="#fffbe3"
              strokeWidth="3"
              style={{ transition: "fill 0.4s" }}
            />
          ))}
          <circle cx="55" cy="55" r="29" fill="#fffbe3" />
          {/* Center icon */}
          <text x="55" y="62" textAnchor="middle" fontSize="31" style={{ opacity: .74 }}>
            🥗
          </text>
        </svg>
        {/* Major nutrients list */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
          marginBottom: 2
        }}>
          {NUTRIENTS.map((n, idx) => (
            <div
              key={n.key}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                fontWeight: 600,
                color: n.color,
                fontSize: 16.5
              }}>
              <span style={{ fontSize: 18, marginTop: 1 }}>{n.icon}</span>
              <span style={{ color: "#431d7a", fontWeight: 700, minWidth: 52 }}>{n.label}:</span>
              <span style={{ color: "#88590b", fontWeight: 700 }}>
                {est[n.key]}
                {n.key === "calories"
                  ? " kcal"
                  : n.key === "fat"
                    ? " g"
                    : n.key === "carbs"
                      ? " g"
                      : n.key === "protein"
                        ? " g"
                        : n.key === "fiber"
                          ? " g"
                          : n.key === "sugar"
                            ? " g"
                            : ""
                }
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "9px 12px", marginTop: 7, fontSize: 13.5,
        color: "#947726", justifyContent: "center"
      }}>
        {NUTRIENTS.map(n => (
          <span key={n.key} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{
              background: n.color,
              width: 13,
              height: 13,
              display: "inline-block",
              borderRadius: 6,
              marginRight: 3,
            }}></span>
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}
