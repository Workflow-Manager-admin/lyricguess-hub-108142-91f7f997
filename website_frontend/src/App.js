import React, { useState, useEffect, Suspense, lazy } from "react";
import "./App.css";
import NutritionBreakdown from "./NutritionBreakdown";
import FavoriteAndShare from "./FavoriteAndShare";
import ShoppingList from "./ShoppingList";
import Tabs from "./Tabs";

// PUBLIC_INTERFACE
// ErrorBoundary: Catches errors from feature UIs and renders fallback content.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onCatch) this.props.onCatch(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ color: "#fb5252" }}>
          Feature failed: {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load main animated features for boundary/fallback control
const PrizeWheel = lazy(() => import("./PrizeWheel"));
const FloatingEquipment = lazy(() => import("./FloatingEquipment"));

/**
 * Helper theme for CSSVars (re-applies every mount or hot-reload)
 */
const recipeTheme = {
  "--primary": "#fc7e2a",
  "--accent": "#73f2a5",
  "--secondary": "#5118da",
  "--background": "#fdf6e7",
  "--card-bg": "#fffbe3",
  "--border": "#ffd36c",
  "--win": "#2ddc6a",
  "--fail": "#fb5252"
};

// Helper: turn /embed/... or /v/... Youtube links into /watch URLs
function fixYoutubeWatchUrl(rawUrl) {
  if (!rawUrl) return "";
  if (rawUrl.includes("youtube.com/watch")) return rawUrl;
  if (rawUrl.includes("youtu.be")) return rawUrl;
  const match = rawUrl.match(/(?:embed|v)\/([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return rawUrl;
}

// Helper: Extract ingredient {ingredient, measure} from recipe (up to 20 fields)
function extractIngredientsAndMeasures(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`];
    const meas = recipe[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ ingredient: ing.trim(), measure: meas ? meas.trim() : "" });
    }
  }
  return ingredients;
}

/**
 * PUBLIC_INTERFACE
 * Main App entrypoint. Renders all UI features with insulation for failure in loading/rendering
 * Ensures all visible areas always have sensible fallback and no blank states.
 */
function App() {
  // Apply visual theme and background on mount
  useEffect(() => {
    Object.entries(recipeTheme).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
    document.body.style.background =
      "radial-gradient(ellipse at 70% 12%, #fffae1 16%, #fff4ea 64%, #fdf6e7 100%), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
  }, []);

  // State: core user interactions for filtering and outputs
  const [ingredientInput, setIngredientInput] = useState("");
  const [userIngredients, setUserIngredients] = useState([]);
  const [dietary, setDietary] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [spinCount, setSpinCount] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);

  // Explicit lists for option selectors/wheel
  const dietaryOptions = [
    { value: "", label: "Any" },
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Gluten-Free", label: "Gluten-Free" },
    { value: "Pescatarian", label: "Pescatarian" },
    { value: "Lacto-Vegetarian", label: "Lacto-Vegetarian" },
    { value: "Ovo-Vegetarian", label: "Ovo-Vegetarian" }
  ];
  const regionOptions = [
    { value: "", label: "Any World Region" },
    { value: "American", label: "American" },
    { value: "British", label: "British" },
    { value: "Canadian", label: "Canadian" },
    { value: "Chinese", label: "Chinese" },
    { value: "Dutch", label: "Dutch" },
    { value: "Egyptian", label: "Egyptian" },
    { value: "French", label: "French" },
    { value: "Greek", label: "Greek" },
    { value: "Indian", label: "Indian" },
    { value: "Irish", label: "Irish" },
    { value: "Italian", label: "Italian" },
    { value: "Jamaican", label: "Jamaican" },
    { value: "Japanese", label: "Japanese" },
    { value: "Kenyan", label: "Kenyan" },
    { value: "Malaysian", label: "Malaysian" },
    { value: "Mexican", label: "Mexican" },
    { value: "Moroccan", label: "Moroccan" },
    { value: "Polish", label: "Polish" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
    { value: "Spanish", label: "Spanish" },
    { value: "Thai", label: "Thai" },
    { value: "Tunisian", label: "Tunisian" },
    { value: "Turkish", label: "Turkish" },
    { value: "Vietnamese", label: "Vietnamese" },
  ];
  const wheelOptions = [
    "Dessert", "Italian", "Vegan", "Asian", "Mexican", "Breakfast", "BBQ", "Random"
  ];

  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "rgba(255, 254, 246, 0.92)",
        color: "#573e1a",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        position: "relative",
        overflow: "visible"
      }}
      data-testid="main-app"
    >
      {/* Error boundary for FloatingEquipment */}
      <ErrorBoundary
        fallback={
          <div
            aria-live="polite"
            data-testid="floating-equipment-fallback"
            style={{
              position: "fixed",
              left: 0, top: 0, width: "100vw", height: "30px",
              background: "#fb5252", color: "#fff", zIndex: 100,
              textAlign: "center", fontWeight: 900, fontSize: 15, padding: 3,
              boxShadow: "0 2px 12px #e7bb6740"
            }}
          >
            Unable to load animated utensils!
          </div>
        }
      >
        <Suspense fallback={null}>
          <FloatingEquipment count={8} style={{ zIndex: 0, pointerEvents: "none" }} />
        </Suspense>
      </ErrorBoundary>

      <header
        className="App-header"
        style={{
          minHeight: "100vh",
          background: "rgba(253,246,231,0.94)",
          paddingTop: 18,
          position: "relative",
        }}
      >
        <h1 className="large-gradient-header" style={{
          fontFamily: "'Fredoka', Cursive, sans-serif",
          marginBottom: 12,
          fontWeight: 900,
          letterSpacing: ".025em",
          zIndex: 1,
        }}>
          <span role="img" aria-label="chef-hat">👨‍🍳🥄</span>
          Recipe Wheel of Fortune
        </h1>
        <div className="subtitle"
          style={{
            color: "#653e11",
            opacity: 0.97,
            fontSize: 22,
            marginBottom: 6,
            fontWeight: 600,
            letterSpacing: ".025em",
            zIndex: 1,
            textShadow: "0 1.5px 8px #fff5d8",
          }}
        >
          Spin the kitchen wheel for a chef's surprise! <span style={{ fontSize: 18 }}>🍽️</span>
        </div>
        <div className="main-layout" style={{ zIndex: 2, position: "relative" }}>
          {/* Filter/options panel - with its own error boundary */}
          <ErrorBoundary
            fallback={
              <div className="filter-panel card" style={{ color: "#bf363a" }} data-testid="filter-fallback">
                Unable to render filter panel.
              </div>
            }
          >
            <div className="filter-panel card" data-testid="filter-panel">
              <label htmlFor="ingredient-input" style={{ fontWeight: 700, color: "#5118da", fontSize: "1.13em" }}>
                Ingredients you want to use:
              </label>
              <input
                id="ingredient-input"
                type="text"
                className="guess-input"
                placeholder="e.g., chicken, broccoli"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && ingredientInput.trim()) {
                    setUserIngredients([...userIngredients, ingredientInput.trim()]);
                    setIngredientInput("");
                  }
                }}
                disabled={loading}
                style={{ marginBottom: 4, width: "100%" }}
                autoFocus
                data-testid="ingredients-input"
              />
              <button
                className="btn accent"
                type="button"
                style={{ marginBottom: 12, marginTop: 6 }}
                onClick={() => {
                  if (ingredientInput.trim()) {
                    setUserIngredients([...userIngredients, ingredientInput.trim()]);
                    setIngredientInput("");
                  }
                }}
                disabled={loading || !ingredientInput.trim()}
                data-testid="add-ingredient-btn"
              >
                Add Ingredient
              </button>
              <div style={{ margin: "8px 0" }}>
                {userIngredients.length > 0 && (
                  <div style={{ fontSize: 15, color: "#573e1a" }}>
                    <b>Your ingredients:</b>
                    <ul style={{ margin: 0, marginLeft: 10 }}>
                      {userIngredients.map((ing, i) => (
                        <li key={i} style={{ display: "inline-block", marginRight: 8 }}>
                          <span style={{ color: "#5118da" }}>{ing}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setUserIngredients(userIngredients.filter((_, idx) => idx !== i))
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "#fb5252",
                              marginLeft: 4,
                              fontSize: 16,
                              cursor: "pointer",
                            }}
                            aria-label="Remove ingredient"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <label style={{ fontWeight: 700, color: "#5118da", marginTop: 9 }}>
                Dietary Preference:
              </label>
              <select
                value={dietary}
                style={{ marginBottom: 9, width: "100%", fontSize: 16 }}
                onChange={e => setDietary(e.target.value)}
                disabled={loading}
                data-testid="dietary-select"
              >
                {dietaryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <label style={{ fontWeight: 700, color: "#5118da", marginTop: 9 }}>
                Region:
              </label>
              <select
                value={region}
                style={{ marginBottom: 19, width: "100%", fontSize: 16 }}
                onChange={e => setRegion(e.target.value)}
                disabled={loading}
                data-testid="region-select"
              >
                {regionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 13.6, color: "#8c5c1e", marginTop: 7 }}>
                <b>Tip:</b> Pick ingredients, region, and dietary needs. Then spin the wheel!
              </div>
            </div>
          </ErrorBoundary>

          {/* Column 2: PrizeWheel and Recipe Card */}
          <div>
            {/* PrizeWheel area and fallback */}
            <ErrorBoundary
              fallback={
                <div
                  role="alert"
                  aria-live="polite"
                  data-testid="prizewheel-fallback"
                  style={{
                    minHeight: 180,
                    background: "#ffdbe1",
                    borderRadius: 20,
                    color: "#bf363a",
                    fontWeight: 800,
                    fontSize: 18,
                    marginBottom: 32,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  Sorry! The wheel animation is temporarily unavailable.
                </div>
              }
            >
              <Suspense
                fallback={
                  <div
                    style={{
                      minHeight: 180,
                      background: "#ffdbe1",
                      borderRadius: 20,
                      color: "#bf363a",
                      fontWeight: 800,
                      fontSize: 18,
                      marginBottom: 32,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    Loading Prize Wheel...
                  </div>
                }
              >
                <PrizeWheel
                  options={wheelOptions}
                  spinning={wheelSpinning}
                  disabled={loading}
                  style={{ marginBottom: 32 }}
                  onSpinEnd={selected => {
                    setWheelSpinning(false);
                    setSpinCount(c => c + 1);
                    setLoading(true);
                    // Simulate recipe retrieval (API stub)
                    setTimeout(() => {
                      setRecipe({
                        id: "sample-recipe-id",
                        name: "Hearty Chicken Stir-Fry",
                        strInstructions:
                          "Cook the chicken, add veggies, stir-fry together. Enjoy!",
                        strYoutube: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        ...extractIngredientsAndMeasures({
                          strIngredient1: "Chicken",
                          strMeasure1: "2 cups",
                          strIngredient2: "Broccoli",
                          strMeasure2: "1 cup"
                        }),
                      });
                      setLoading(false);
                      setError("");
                    }, 1600);
                  }}
                  data-testid="prizewheel"
                />
              </Suspense>
            </ErrorBoundary>

            {/* Recipe card and associated features with error isolation */}
            <ErrorBoundary
              fallback={
                <div className="recipe-card-main card" style={{ marginTop: 0, color: "#bf363a", minHeight: 110 }} data-testid="recipecard-fallback">
                  Failed to display recipe details.
                </div>
              }
            >
              {recipe && (
                <div className="recipe-card-main card" style={{ marginTop: 0 }} data-testid="recipecard">
                  <h2 className="title" style={{ fontSize: 24, color: "#fc7e2a", marginBottom: 6 }}>
                    {recipe.name}
                  </h2>
                  <div className="meta" style={{ fontSize: 15.5, color: "#653e11" }}>
                    Demo |{" "}
                    <a
                      href={fixYoutubeWatchUrl(recipe.strYoutube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#5118da" }}
                      data-testid="youtube-link"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                  <div style={{ marginTop: 11, fontSize: 16.2 }}>
                    <b>Instructions:</b> {recipe.strInstructions}
                  </div>
                  <Tabs
                    tabs={[
                      {
                        label: "Nutrition",
                        content: (
                          <NutritionBreakdown ingredients={extractIngredientsAndMeasures(recipe)} />
                        ),
                      },
                      {
                        label: "Shopping List",
                        content: (
                          <ShoppingList
                            ingredients={extractIngredientsAndMeasures(recipe)}
                            recipeName={recipe.name}
                          />
                        ),
                      },
                      {
                        label: "Favorite & Share",
                        content: (
                          <FavoriteAndShare recipeId={recipe.id} recipeName={recipe.name} />
                        ),
                      },
                    ]}
                    initialTab={0}
                  />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
        <footer
          style={{
            marginTop: 38,
            color: "#997d3a",
            fontSize: 15.5,
            textAlign: "center",
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          Powered by{" "}
          <a
            href="https://www.themealdb.com/api.php"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#fc7e2a",
              textDecoration: "none"
            }}
          >
            TheMealDB API
          </a>
          .<br />
          <span
            style={{
              fontSize: 12,
              color: "#b5adcf"
            }}
          >
            Chef theme with animated utensils and lively spinning wheel &copy;{" "}
            {new Date().getFullYear()}
          </span>
        </footer>
      </header>
    </div>
  );
}

export default App;
