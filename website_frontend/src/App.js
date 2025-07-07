import React, { useState } from "react";
import PrizeWheel from "./PrizeWheel";
import ShoppingList from "./ShoppingList";
import Tabs from "./Tabs";
import FloatingEquipment from "./FloatingEquipment";
import "./App.css";

// Mock recipes with richer info for demo & robust update
const RECIPES = [
  {
    name: "Guacamole",
    description: "Classic Mexican avocado dip.",
    ingredients: [
      { ingredient: "Avocado", measure: "2 large" },
      { ingredient: "Lime", measure: "1, juiced" },
      { ingredient: "Salt", measure: "1 tsp" },
      { ingredient: "Cilantro", measure: "2 tbsp, chopped" }
    ],
    nutrition: "150 cal/serving. Vegan. Rich in healthy fats.",
    video: { url: "https://www.youtube.com/embed/cHWZPthbNnk", title: "Guacamole Demo" },
    pairings: ["Tortilla chips", "Fresh salsa", "Quesadillas"],
    id: "guac1"
  },
  {
    name: "Tzatziki",
    description: "Greek yogurt and cucumber sauce.",
    ingredients: [
      { ingredient: "Greek yogurt", measure: "1 cup" },
      { ingredient: "Cucumber", measure: "1/2, grated" },
      { ingredient: "Garlic", measure: "1 clove" },
      { ingredient: "Dill", measure: "2 tsp" },
    ],
    nutrition: "80 cal/serving. High protein, refreshing.",
    video: { url: "https://www.youtube.com/embed/hkp3eOX-2wI", title: "Tzatziki Tutorial" },
    pairings: ["Pita bread", "Grilled lamb", "Falafel"],
    id: "tzatziki1"
  },
  {
    name: "Salsa",
    description: "Fresh tomato and chili dip.",
    ingredients: [
      { ingredient: "Tomato", measure: "3 medium" },
      { ingredient: "Onion", measure: "1/4 cup, chopped" },
      { ingredient: "Jalapeño", measure: "1 small" }
    ],
    nutrition: "40 cal/serving. Fat-free. Vitamin C rich.",
    video: { url: "https://www.youtube.com/embed/IbdgKQc3oyk", title: "Make Salsa Fresca" },
    pairings: ["Nachos", "Eggs", "Tacos"],
    id: "salsa1"
  },
  // Add additional recipes here if desired (keep demo sample short)
];

function getRandomRecipe() {
  // Return a random recipe object (deep clone to prevent mutation issues)
  const idx = Math.floor(Math.random() * RECIPES.length);
  return JSON.parse(JSON.stringify(RECIPES[idx]));
}

/**
 * PUBLIC_INTERFACE
 * App main - orchestrates UI, controls global state, and ensures all features refresh on spin.
 */
export default function App() {
  // Track current recipe (for tabs/shopping/etc.)
  const [currentRecipe, setCurrentRecipe] = useState(getRandomRecipe());
  const [spinKey, setSpinKey] = useState(0); // For forcing re-mounts if needed

  // Called by PrizeWheel upon complete, promotes chosen recipe to all features.
  async function handleSpinAndUpdate(cbFetchRecipe) {
    // cbFetchRecipe is passed by PrizeWheel, resolves to a new recipe obj
    const recipe = await cbFetchRecipe();
    setCurrentRecipe(recipe);
    setSpinKey(prev => prev + 1); // update key to force re-mount children if needed
  }

  // Panels for tabs (nutrition breakdown, video, pairings, etc.) - each receives current recipe
  const tabPanels = [
    {
      label: "Nutrition",
      content: <div style={{ padding: 12, fontSize: 17, color: "#191414" }}>
        {currentRecipe.nutrition || "Nutrition facts coming soon."}
      </div>,
    },
    {
      label: "Video",
      content: (
        currentRecipe.video ? (
          <div style={{ padding: 8, textAlign: "center" }}>
            <iframe
              title={currentRecipe.video.title}
              src={currentRecipe.video.url}
              width="320"
              height="180"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: 9, boxShadow: "0 2px 12px #8885" }}
            />
            <div style={{ fontSize: 16, marginTop: 4 }}>{currentRecipe.video.title}</div>
          </div>
        ) : <div>No video available.</div>
      )
    },
    {
      label: "Pairings",
      content: (
        <ul style={{ padding: 18, color: "#5118da", fontWeight: 500, fontSize: 16 }}>
          {(currentRecipe.pairings || []).map((p, idx) =>
            <li key={idx}>{p}</li>
          )}
        </ul>
      )
    },
  ];

  return (
    <div className="App" style={{ position: "relative", minHeight: "100vh", background: "#f8fff6" }}>
      {/* Floating decorative utensils/animations */}
      <FloatingEquipment count={8} style={{ zIndex: 0 }} />

      {/* App content stack */}
      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 0 38px 0"
      }}>
        <h1 style={{ textAlign: "center", letterSpacing: "0.03em" }}>
          Spin the Prize Wheel!
        </h1>

        {/* The PrizeWheel. Pass a custom fetch-and-update so App gets final recipe */}
        <PrizeWheel
          key={spinKey} // ensures fresh mount per spin if required
          onSpin={(cbFetchRecipe) => handleSpinAndUpdate(cbFetchRecipe)}
          recipe={currentRecipe}
          fetchRandomRecipe={getRandomRecipe}
        />

        {/* Recipe summary card */}
        <div
          className="recipe-card"
          style={{
            background: "#fff",
            borderRadius: 15,
            margin: "26px auto 0 auto",
            maxWidth: 410,
            boxShadow: "0 5px 32px #a5f99433, 0 1.2px 8px #2220111c",
            padding: "23px 21px 9px 22px",
            textAlign: "left",
          }}
        >
          <h2 style={{ color: "#1DB954", letterSpacing: "0.01em", margin: "6px 0 8px 0" }}>
            {currentRecipe.name}
          </h2>
          <div style={{ color: "#191414", fontSize: 18, marginBottom: 13 }}>
            {currentRecipe.description}
          </div>
        </div>

        {/* Tabs: nutrition, video, pairings */}
        <div style={{ margin: "33px 0 0 0", maxWidth: 520 }}>
          <Tabs tabs={tabPanels} />
        </div>

        {/* Shopping list - updates with recipe */}
        <div style={{ marginTop: 32 }}>
          <ShoppingList
            ingredients={currentRecipe.ingredients}
            recipeName={currentRecipe.name}
            defaultOpen={false}
          />
        </div>
      </div>
    </div>
  );
}
