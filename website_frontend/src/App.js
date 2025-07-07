import React from "react";
import PrizeWheel from "./PrizeWheel";
import "./App.css";

// Simulate API fetch for a new random recipe
const RECIPES = [
  { name: "Guacamole", description: "Classic Mexican avocado dip." },
  { name: "Tzatziki", description: "Greek yogurt and cucumber sauce." },
  { name: "Salsa", description: "Fresh tomato and chili dip." },
  { name: "Aioli", description: "Garlic mayonnaise sauce." },
  { name: "Hummus", description: "Chickpea and tahini spread." },
  { name: "Tapenade", description: "Olive and caper paste." },
  { name: "Pesto", description: "Basil, pine nuts, and parmesan sauce." },
  { name: "Raita", description: "Indian yogurt condiment." }
];

/**
 * PUBLIC_INTERFACE
 * fetchRandomRecipe
 * Mimics an API call to get a random recipe (can be replaced with real API integration).
 */
async function fetchRandomRecipe() {
  // Simulate async
  await new Promise(res => setTimeout(res, 500));
  const idx = Math.floor(Math.random() * RECIPES.length);
  return RECIPES[idx];
}

function App() {
  return (
    <div className="App">
      <h1>Spin the Prize Wheel!</h1>
      <PrizeWheel fetchRandomRecipe={fetchRandomRecipe} />
      {/* Perhaps render more of the app here */}
    </div>
  );
}

export default App;
