import React, { useState } from "react";
import "./App.css";
import NutritionBreakdown from "./NutritionBreakdown";
import FavoriteAndShare from "./FavoriteAndShare";
import ShoppingList from "./ShoppingList";
import Tabs from "./Tabs";
import PrizeWheel from "./PrizeWheel";
import FloatingEquipment from "./FloatingEquipment";

// Colorful Recipe Roulette theme variables (cheerful & inviting)
const recipeTheme = {
  "--primary": "#fc7e2a",      // Vibrant orange
  "--accent": "#73f2a5",       // Bright mint green
  "--secondary": "#5118da",    // Deep cheerful purple
  "--background": "#fdf6e7",   // Soft warm background
  "--card-bg": "#fffbe3",
  "--border": "#ffd36c",
  "--win": "#2ddc6a",
  "--fail": "#fb5252"
};

/**
 * Helper: TheMealDB sometimes gives inconsistent YouTube URL format.
 * This function extracts the actual watch URL so clicking the button always opens the video.
 */
function fixYoutubeWatchUrl(rawUrl) {
  if (!rawUrl) return "";
  // If it's already a proper youtube watch link
  if (rawUrl.includes("youtube.com/watch")) return rawUrl;
  // If it's a shortened youtu.be link, just use it
  if (rawUrl.includes("youtu.be")) return rawUrl;
  // If it's an embed link, extract video code and make a watch URL
  const match = rawUrl.match(/(?:embed|v)\/([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  // Fallback: just return original
  return rawUrl;
}

// Helper function: format ingredients/measure array from TheMealDB raw
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
 * MAIN APP COMPONENT WITH CHEF WHEEL + FLOATING KITCHEN EQUIPMENT
 */
function App() {
  // Apply cheerful chef/kitchen-focused theme on mount
  React.useEffect(() => {
    Object.entries(recipeTheme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
    // Set body background to a chef/kitchen vibe
    document.body.style.background =
      "radial-gradient(ellipse at 68% 18%, #fffbe7 25%, #faeeef 56%, #fdf6e7 100%), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
  }, []);

  // --App state
  const [ingredientInput, setIngredientInput] = useState("");
  const [userIngredients, setUserIngredients] = useState([]);
  const [dietary, setDietary] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [spinCount, setSpinCount] = useState(0);

  // For drink pairing & side (same as before)
  const [drink, setDrink] = useState(null);
  const [drinkLoading, setDrinkLoading] = useState(false);
  const [drinkError, setDrinkError] = useState("");

  // Spin state managed by PrizeWheel
  const [wheelSpinning, setWheelSpinning] = useState(false);

  // Filter options (identical as before)
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

  // Helper: Map dietary to TheMealDB filter endpoints
  function getDietApiFragment(val) {
    switch (val) {
      case "Vegan": return "Vegan";
      case "Vegetarian": return "Vegetarian";
      case "Pescatarian": return "Pescatarian";
      case "Gluten-Free": return null; // No direct gluten-free endpoint
      case "Lacto-Vegetarian": return "Lacto-Vegetarian";
      case "Ovo-Vegetarian": return "Ovo-Vegetarian";
      default: return null;
    }
  }

  // Human-friendly name
  function prettyCategory(cat) {
    if (!cat) return null;
    return cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Render ingredient list
  function renderIngredients(recipe) {
    const list = extractIngredientsAndMeasures(recipe);
    return (
      <ul style={{
        padding: "0 0 0 18px",
        margin: "0 0 12px 0"
      }}>
        {list.map((itm, idx) =>
          <li
            style={{
              fontSize: 17,
              lineHeight: "1.4em",
              marginBottom: 2,
              color: "#fc7e2a",
              fontWeight: 500
            }}
            key={idx}>
            <span style={{ color: "#5118da", fontWeight: 700 }}>
              {itm.ingredient}
            </span>
            {itm.measure && " - "}
            <span style={{ color: "#6b590c", fontWeight: 400 }}>{itm.measure}</span>
          </li>
        )}
      </ul>
    );
  }

  // Drink pairing helper
  async function fetchDrinkPairing(recipe) {
    setDrink(null);
    setDrinkLoading(true);
    setDrinkError("");
    try {
      let q = recipe?.strCategory || recipe?.strArea || recipe?.strMeal;
      let resp = null;
      if (q) {
        resp = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail`
        );
        let cocktails = [];
        if (resp.ok) {
          const d = await resp.json();
          if (d.drinks) cocktails = d.drinks;
        }
        if (!cocktails.length && recipe?.strMeal) {
          const resIngr = await fetch(
            `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
              recipe.strMeal.split(" ")[0]
            )}`
          );
          const dt = await resIngr.json();
          if (dt.drinks) cocktails = dt.drinks;
        }
        if (!cocktails.length) {
          const rnd = await fetch(
            "https://www.thecocktaildb.com/api/json/v1/1/random.php"
          );
          const dRnd = await rnd.json();
          if (dRnd.drinks && dRnd.drinks[0]) {
            setDrink(dRnd.drinks[0]);
            return;
          }
        } else {
          setDrink(cocktails[Math.floor(Math.random() * cocktails.length)]);
          return;
        }
      } else {
        const rnd = await fetch(
          "https://www.thecocktaildb.com/api/json/v1/1/random.php"
        );
        const dRnd = await rnd.json();
        if (dRnd.drinks && dRnd.drinks[0]) {
          setDrink(dRnd.drinks[0]);
          return;
        }
      }
    } catch (err) {
      setDrinkError("Could not fetch drink pairing. 🍹");
    } finally {
      setDrinkLoading(false);
    }
  }

  // Side pairings for fallback
  const sidePairings = {
    "Beef": ["Roasted Potatoes", "Green Beans Almondine", "Garlic Bread"],
    "Chicken": ["Coleslaw", "Potato Wedges", "Grilled Corn"],
    "Vegetarian": ["Cucumber Salad", "Pita Bread", "Quinoa Pilaf"],
    "Vegan": ["Chickpea Salad", "Sauteed Greens", "Sweet Potato Fries"],
    "Pasta": ["Garlic Bread", "Caesar Salad"],
    "Seafood": ["Steamed Rice", "Lemon Asparagus", "Garden Salad"],
    "Mexican": ["Refried Beans", "Tortilla Chips", "Guacamole"],
    "American": ["Potato Salad", "Corn on the Cob"],
    "Indian": ["Raita", "Papadum", "Jeera Rice"],
    "Italian": ["Caprese Salad", "Bruschetta"],
    "French": ["Ratatouille", "Baguette"],
    "Chinese": ["Spring Rolls", "Fried Rice"],
    "Japanese": ["Edamame", "Miso Soup"],
  };

  // PairingSuggestion component
  function PairingSuggestion({ drink, drinkLoading, drinkError, recipe }) {
    if (drinkLoading) {
      return (
        <div className="card" style={{
          margin: "15px auto 0 auto",
          maxWidth: 415,
          background: "#efe6ff",
          color: "#6643ad",
          padding: "18px 16px 16px 16px",
          border: `2px dashed #5118da`,
          borderRadius: 12,
          fontWeight: "bold",
          textAlign: "center",
          letterSpacing: ".02em",
        }}>
          <span role="img" aria-label="drink" style={{ fontSize: 25 }}>🍹</span> Finding a perfect drink pairing...
        </div>
      );
    }
    if (drinkError) {
      return (
        <div className="card" style={{
          margin: "15px auto 0 auto",
          maxWidth: 415,
          background: "#fff4f8",
          color: "#871b41",
          border: `2px dashed #fb5252`,
          fontWeight: 700,
          padding: "13px 14px 12px 14px",
          borderRadius: 12,
          textAlign: "center"
        }}>
          {drinkError}
        </div>
      );
    }
    if (drink && drink.strDrink) {
      return (
        <div className="card" style={{
          margin: "19px auto 0 auto",
          maxWidth: 415,
          background: "#eaf6ff",
          padding: "16px 13px 19px 13px",
          border: `2.3px solid #9be3ef`,
          borderRadius: 17,
          textAlign: "center",
          boxShadow: "0 2.5px 14px #49a2d442"
        }}>
          <div style={{
            color: "#26536F", fontWeight: 700, fontSize: 18.5,
            marginBottom: 5, letterSpacing: ".01em"
          }}>
            <span role="img" aria-label="cocktail" style={{fontSize:22}}>🍸</span> Suggested Drink Pairing:
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            margin: "9px 0 11px 0"
          }}>
            <img
              src={drink.strDrinkThumb}
              alt={drink.strDrink}
              style={{
                width: 67, height: 67,
                borderRadius: 11,
                border: "2px solid #6bdff3",
                objectFit: "cover",
                boxShadow: "0 2px 14px #98d8ef18"
              }}
            />
            <div style={{textAlign:"left"}}>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#4c2f77", marginBottom: 2 }}>
                {drink.strDrink}
              </div>
              <div style={{
                fontWeight: 500, fontSize: 15.5, color: "#148a7c"
              }}>
                {drink.strCategory}
              </div>
              {drink.strAlcoholic && (
                <div style={{ fontWeight: 500, color: "#d28d75", fontSize: 14.9 }}>
                  {drink.strAlcoholic}
                </div>
              )}
              <div>
                <a href={`https://www.thecocktaildb.com/drink/${drink.idDrink}`} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: "#fec2f5",
                    color: "#731c8a",
                    fontWeight: 600,
                    fontSize: 15.5,
                    borderRadius: 7,
                    padding: "4.1px 12px",
                    textDecoration: "none",
                    marginTop: 5,
                    display: "inline-block"
                  }}>View Recipe</a>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // Fallback: side suggestion
    let side = null;
    const cat = recipe?.strCategory;
    if (cat) {
      for (const k in sidePairings) {
        if (cat.toLowerCase().includes(k.toLowerCase())) {
          side = sidePairings[k][Math.floor(Math.random() * sidePairings[k].length)];
          break;
        }
      }
    }
    if (!side && recipe?.strArea) {
      for (const k in sidePairings) {
        if (recipe.strArea.toLowerCase().includes(k.toLowerCase())) {
          side = sidePairings[k][Math.floor(Math.random() * sidePairings[k].length)];
          break;
        }
      }
    }
    if (!side) {
      side = sidePairings["Vegetarian"]
        ? sidePairings["Vegetarian"][Math.floor(Math.random() * sidePairings["Vegetarian"].length)]
        : "Gourmet Salad";
    }
    return (
      <div className="card" style={{
        margin: "15px auto 0 auto",
        maxWidth: 415,
        background: "#fbffe0",
        padding: "17px 11px 17px 11px",
        border: `2.2px solid #efc949`,
        borderRadius: 16,
        textAlign: "center",
        fontWeight: 700,
        fontSize: 17.5,
        color: "#bea12a"
      }}>
        <span role="img" aria-label="side"
           style={{fontSize: 22, marginRight: 7}}>🍽️</span>
        Classic Side Pairing: <span style={{
          color: "#8d6e09",
          fontWeight: 800,
          marginLeft: 7
        }}>{side}</span>
      </div>
    );
  }

  // Spin handler for PrizeWheel. When user spins, this triggers the fetch.
  async function onSpinWheel(selectedCategory) {
    // Accept selectedCategory (e.g. "Italian", etc) and set as region if non-empty
    setError("");
    setRecipe(null);
    setDrink(null);
    setDrinkLoading(false);
    setDrinkError("");
    setWheelSpinning(true);
    setLoading(true);

    const userRegion = selectedCategory && selectedCategory !== "Random" ? selectedCategory : region;
    const chosenRegion = userRegion || region; // Prefer wheel selection if valid

    // Internal filtering logic using selected category if selected
    const filterByFilters = async (ingredients, diet, regionSelected) => {
      if (!ingredients.length && !diet && !regionSelected) return null;
      let pools = [];
      if (ingredients.length) {
        const resp = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
            ingredients.join(",")
          )}`
        );
        if (!resp.ok) return null;
        const d = await resp.json();
        if (!d.meals) return null;
        pools.push(new Set(d.meals.map((m) => m.idMeal)));
      }
      if (diet && getDietApiFragment(diet)) {
        const resp = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
            getDietApiFragment(diet)
          )}`
        );
        if (!resp.ok) return null;
        const d = await resp.json();
        if (!d.meals) return null;
        pools.push(new Set(d.meals.map((m) => m.idMeal)));
      }
      if (regionSelected) {
        const resp = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(regionSelected)}`
        );
        if (!resp.ok) return null;
        const d = await resp.json();
        if (!d.meals) return null;
        pools.push(new Set(d.meals.map((m) => m.idMeal)));
      }
      if (!pools.length) return null;
      let resultIds = pools[0];
      if (pools.length > 1) {
        for (let i = 1; i < pools.length; ++i) {
          resultIds = new Set([...resultIds].filter((x) => pools[i].has(x)));
        }
      }
      if (!resultIds.size) return null;
      const allIds = Array.from(resultIds);
      const chosenId = allIds[Math.floor(Math.random() * allIds.length)];
      const recResp = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${chosenId}`
      );
      const recData = await recResp.json();
      if (!recData.meals || !recData.meals[0]) return null;
      return recData.meals[0];
    };

    try {
      let ingredientsArr = userIngredients.map((s) => s.trim()).filter(Boolean);
      let rec = null;
      if (ingredientsArr.length || dietary || chosenRegion) {
        rec = await filterByFilters(ingredientsArr, dietary, chosenRegion);
      }
      if (!rec) {
        const resp = await fetch(
          "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        if (!resp.ok) throw new Error("Could not fetch recipe. Try again later!");
        const data = await resp.json();
        if (!data.meals || !data.meals[0])
          throw new Error("No recipe found.");
        rec = data.meals[0];
      }
      setRecipe(rec);
      setSpinCount((prev) => prev + 1);
      setTimeout(() => fetchDrinkPairing(rec), 1);
    } catch (err) {
      setError(
        "😥 Oops! Failed to fetch a recipe. Please check your connection or try again later."
      );
    } finally {
      setLoading(false);
      setWheelSpinning(false);
    }
  }

  // First load: Show only wheel and invite spin
  const firstLanding = !loading && !recipe && !error;

  // PrizeWheel categories suited for theme
  const wheelOptions = [
    "Dessert", "Italian", "Vegan", "Asian", "Mexican", "Breakfast", "BBQ", "Random"
  ];

  // Render rest as before, but with PrizeWheel and FloatingEquipment overlays
  return (
    <div
      className="App"
      style={{
        minHeight: "100vh",
        background: "rgba(255, 254, 246, 0.87)",
        color: "#573e1a",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        position: "relative",
        overflow: "visible"
      }}
    >
      <FloatingEquipment count={8} style={{zIndex: 0}} />
      <header
        className="App-header"
        style={{
          minHeight: "100vh",
          background: "rgba(253,246,231,0.94)",
          paddingTop: 17,
          position: "relative",
        }}
      >
        <h1 className="large-gradient-header" style={{
          fontFamily: "'Fredoka',Cursive,sans-serif",
          marginBottom: 13,
          fontWeight: 900,
          letterSpacing: ".025em",
          zIndex: 1,
        }}>
          <span role="img" aria-label="chef-hat">👨‍🍳🥄</span>
          Recipe Wheel of Fortune
        </h1>
        <div className="subtitle"
          style={{
            color: "#805d0e",
            opacity: 0.98,
            fontSize: 22,
            marginBottom: 4,
            fontWeight: 600,
            letterSpacing: ".03em",
            zIndex: 1,
            textShadow: "0 1.5px 8px #fff5d8",
          }}
        >
          Spin the kitchen wheel for a chef's surprise! <span style={{fontSize:18}}>🍽️</span>
        </div>
        <div className="main-layout" style={{zIndex: 2, position:"relative"}}>
          {/* LEFT: Filtering Panel */}
          <div className="filter-panel card" style={{zIndex: 2}}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#98530e",
                letterSpacing: ".03em",
                lineHeight: 1.08,
                marginBottom: 3,
              }}
            >
              <span role="img" aria-label="filter">🧂</span> Wheel Filters
            </div>
            <div style={{ color: "#614177", fontWeight: 500, fontSize: 15.2, marginBottom: 11 }}>
              Add a dietary, region, or ingredient filter—then SPIN like a chef!
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label htmlFor="region" className="section-header" style={{ color: "#1db954" }}>
                  <span role="img" aria-label="globe" style={{ marginRight: 3 }}>🌍</span> Region
                </label>
                <select
                  id="region"
                  name="region"
                  value={region}
                  style={{
                    border: `1.6px solid #73f2a5`,
                    borderRadius: 7,
                    background: "#e2f4e9",
                    padding: "7px 10px",
                    width: "100%",
                    fontSize: 15.2,
                    color: "#134346",
                    fontWeight: 500,
                    marginTop: 2
                  }}
                  onChange={e => setRegion(e.target.value)}
                >
                  {regionOptions.map(opt => (
                    <option value={opt.value} key={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dietary" className="section-header" style={{ color: "#fc7e2a" }}>
                  <span role="img" aria-label="fork">🥗</span> Dietary
                </label>
                <select
                  id="dietary"
                  name="dietary"
                  value={dietary}
                  style={{
                    border: `1.6px solid #5118da`,
                    borderRadius: 7,
                    background: "#fae5d5",
                    padding: "7px 10px",
                    width: "100%",
                    fontSize: 15.2,
                    color: "#4f2a01",
                    marginTop: 2,
                    fontWeight: 500
                  }}
                  onChange={e => setDietary(e.target.value)}
                >
                  {dietaryOptions.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ingredient" className="section-header" style={{ color: "#ff9100" }}>
                  <span role="img" aria-label="ingredient">🥒</span> Ingredients
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                  <input
                    type="text"
                    placeholder="Add ingredient"
                    value={ingredientInput}
                    style={{
                      width: "65%",
                      minWidth: 116,
                      fontSize: 15.2,
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: `1.2px solid #fc7e2a`,
                      outline: "none"
                    }}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => {
                      if ((e.key === "Enter" || e.key === ",") && ingredientInput.trim()) {
                        setUserIngredients(arr => {
                          const newVal = ingredientInput.trim();
                          if (!arr.includes(newVal))
                            return [...arr, newVal];
                          return arr;
                        });
                        setIngredientInput("");
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn accent"
                    style={{
                      fontSize: 15,
                      padding: "7px 12px",
                      borderRadius: 9,
                      border: "none",
                      marginTop: 1,
                    }}
                    disabled={!ingredientInput.trim()}
                    onClick={() => {
                      if (ingredientInput.trim()) {
                        setUserIngredients(arr => {
                          const newVal = ingredientInput.trim();
                          if (!arr.includes(newVal))
                            return [...arr, newVal];
                          return arr;
                        });
                        setIngredientInput("");
                      }
                    }}
                  >Add</button>
                </div>
                {userIngredients.length > 0 && (
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: 3
                  }}>
                    {userIngredients.map((ing, idx) => (
                      <span key={idx}
                        style={{
                          background: "#ffe1c9",
                          color: "#fc7e2a",
                          fontWeight: 600,
                          borderRadius: 8,
                          fontSize: 14.4,
                          padding: "3.5px 11px 3.5px 11px",
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1.2px solid #ffd36c",
                          marginBottom: 2
                        }}>
                        {ing}
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fb5252",
                            fontWeight: 700,
                            marginLeft: 6,
                            cursor: "pointer",
                            fontSize: 14
                          }}
                          title="Remove"
                          aria-label={`Remove ${ing}`}
                          onClick={() => {
                            setUserIngredients(arr => arr.filter(_i => _i !== ing));
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Spin button removed; spinning is only through PrizeWheel */}
            </div>
            {error && (
              <div style={{
                color: recipeTheme["--fail"],
                background: "#fff6f7",
                borderRadius: 10,
                border: `1.5px solid ${recipeTheme["--fail"]}22`,
                fontWeight: 600,
                margin: "15px 0 12px 0",
                padding: "12px 10px"
              }}>{error}</div>
            )}
          </div>
          {/* RIGHT: PrizeWheel and Recipe Card */}
          <div style={{ width: "100%", minWidth: 0, position: "relative", zIndex:2 }}>
            {/* Always show PrizeWheel as main interaction */}
            <div style={{ marginBottom: 22 }}>
              <PrizeWheel
                options={wheelOptions}
                onSpinEnd={onSpinWheel}
                spinning={wheelSpinning}
                disabled={loading}
                size={335}
              />
            </div>
            {/* Visual wheel loading or result state */}
            {loading && (
              <div className="recipe-card-main" style={{
                minHeight: 180,
                background: "radial-gradient(ellipse at 40% 20%, #ffecc4 65%, #fffbe3 100%)",
                textAlign: "center",
                border: "2.5px dashed #ffd36c",
                borderRadius: 28,
                boxShadow: "0 9px 24px #ffca7731, 0 2.5px 11px #b094fd21",
                padding: "48px 18px"
              }}>
                <div style={{
                  fontWeight: 800,
                  fontSize: 27,
                  color: "#fc7e2a",
                  letterSpacing: ".048em",
                  marginBottom: 3,
                  textShadow: "0 2px 18px #fffbbb70"
                }}>
                  Spinning for a recipe...
                </div>
                <div className="subtitle" style={{
                  color: "#5118da",
                  fontWeight: 600,
                  fontSize: 18,
                  marginTop: 6
                }}>
                  The chef's wheel is turning! <span style={{animation: "spinIcon 1.2s infinite cubic-bezier(.14,1.5,.6,1.1)", fontSize: 33, display:"inline-block"}}>🍳</span>
                </div>
                <style>
                  {`@keyframes spinIcon {0%{transform: rotate(-10deg) scale(1);} 60%{transform: rotate(23deg) scale(1.11);} 100%{transform: rotate(-10deg) scale(1);}}`}
                </style>
              </div>
            )}
            {/* Show main recipe UI after spin result */}
            {!loading && recipe && (
              <div className="recipe-card-main"
                style={{
                  animation: "fadeInRecipe 0.7s cubic-bezier(.17,0,.33,1.08)",
                  boxShadow: "0 6.6px 34px #ffca773c, 0 2.6px 16px #985ff83b",
                  borderRadius: "28px",
                  overflow: "visible"
                }}>
                {/* Recipe Header Image/Meta */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fffbe3",
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderBottom: `1.5px solid #ffd36c`,
                  padding: "18px 26px 9px 22px",
                  gap: 21
                }}>
                  <img
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: "18px",
                      boxShadow: "0 7px 18px #fc7e2a18, 0 4px 10px #73f2a558",
                      objectFit: "cover",
                      marginRight: 7,
                      border: `2.7px solid #fc7e2a`,
                      background: "#fff"
                    }}
                  />
                  <div>
                    <div style={{
                      color: "#5118da",
                      fontWeight: 900,
                      fontSize: 26,
                      letterSpacing: ".045em",
                      marginBottom: 2,
                      lineHeight: 1.14,
                      marginTop: 3
                    }}>{recipe.strMeal}</div>
                    <div style={{
                      fontSize: 15.7,
                      color: "#fc7e2a",
                      fontWeight: 600,
                      marginBottom: 2,
                    }}>
                      {recipe.strCategory}
                      {recipe.strArea && <span style={{
                        color: "#5118da",
                        fontWeight: 400,
                        marginLeft: 8
                      }}>| {recipe.strArea}</span>}
                    </div>
                  </div>
                </div>
                {/* Tabs for info below */}
                <Tabs initialTab={0} tabs={[
                  {
                    label: "Ingredients",
                    content: (
                      <div style={{ paddingTop: 7 }}>
                        {extractIngredientsAndMeasures && renderIngredients(recipe)}
                        <div style={{ margin: "8px 0 0 0" }}>
                          <ShoppingList
                            ingredients={extractIngredientsAndMeasures(recipe)}
                            recipeName={recipe.strMeal}
                            defaultOpen={false}
                          />
                        </div>
                      </div>
                    )
                  },
                  {
                    label: "Nutrition",
                    content: (
                      <div>
                        <NutritionBreakdown ingredients={extractIngredientsAndMeasures(recipe)} />
                      </div>
                    )
                  },
                  {
                    label: "Pairing",
                    content: (
                      <div>
                        <PairingSuggestion drink={drink} drinkLoading={drinkLoading} drinkError={drinkError} recipe={recipe} />
                      </div>
                    )
                  },
                  {
                    label: "Favorite & Share",
                    content: (
                      <div style={{ paddingLeft: 13 }}>
                        <FavoriteAndShare
                          recipeId={recipe.idMeal}
                          recipeName={recipe.strMeal}
                          shareUrl={window.location.href}
                        />
                      </div>
                    )
                  },
                  {
                    label: "Video",
                    content: (
                      <div style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 3px 14px #e72c791b, 0 1.5px 7px #eadbff24",
                        minHeight: 80
                      }}>
                        {(() => {
                          function getYouTubeId(youtubeUrl) {
                            if (!youtubeUrl || typeof youtubeUrl !== "string") return null;
                            const watch = youtubeUrl.match(/v=([\w-]{11})/);
                            if (watch) return watch[1];
                            const short = youtubeUrl.match(/youtu\.be\/([\w-]{11})/);
                            if (short) return short[1];
                            const embed = youtubeUrl.match(/embed\/([\w-]{11})/);
                            if (embed) return embed[1];
                            const vpath = youtubeUrl.match(/\/v\/([\w-]{11})/);
                            if (vpath) return vpath[1];
                            return null;
                          }
                          const ytId = getYouTubeId(recipe.strYoutube);
                          if (ytId) {
                            return (
                              <div style={{ margin: "0 auto", maxWidth: 410 }}>
                                <iframe
                                  width="100%"
                                  height="216"
                                  src={`https://www.youtube.com/embed/${ytId}`}
                                  title="Recipe video"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ borderRadius: 12, width: "100%", background: "#000" }}
                                ></iframe>
                                <a
                                  href={`https://www.youtube.com/watch?v=${ytId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#e72c79",
                                    background: "#ffe6fa",
                                    borderRadius: 7,
                                    fontSize: 15,
                                    padding: "5.5px 14px",
                                    fontWeight: 600,
                                    display: "inline-block",
                                    marginTop: 8,
                                    marginBottom: 0,
                                    textDecoration: "none"
                                  }}>
                                  ▶️ View on YouTube
                                </a>
                              </div>
                            );
                          }
                          // No valid video
                          return (
                            <div style={{
                              color: "#b18ba8",
                              background: "#fcf3fa",
                              borderRadius: 7,
                              padding: "13px 10px",
                              fontWeight: 600,
                              fontSize: 16.5
                            }}>
                              📺 Video not available for this recipe.
                            </div>
                          );
                        })()}
                      </div>
                    )
                  }
                ]} />
              </div>
            )}
            {/* Animated "Spin to begin" wheel for first time */}
            {(firstLanding && !loading) && (
              <div className="recipe-card-main"
                style={{
                  minHeight: 180,
                  background: "linear-gradient(119deg, #fffbe7 55%, #fff6e7 100%)",
                  textAlign: "center",
                  border: "2.5px dashed #ffd36c",
                  borderRadius: 28,
                  boxShadow: "0 9px 22px #ffca7731, 0 2.5px 10px #b094fd1c",
                  padding: "44px 22px"
                }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#985f18",
                  letterSpacing: ".04em",
                  textShadow: "0 2px 13px #fff6e3",
                  marginBottom: 12
                }}>
                  Spin the chef's wheel!
                </div>
                <div className="subtitle" style={{
                  color: "#5118da",
                  fontWeight: 600,
                  fontSize: 19,
                  marginTop: 4
                }}>
                  Pick a category or filter—or just spin to discover a surprise dish!
                </div>
              </div>
            )}
            {/* Any error from fetch/spin */}
            {error && (
              <div style={{
                color: "#fb5252",
                background: "#fff6f7",
                borderRadius: 13,
                border: "2px solid #fb525288",
                fontWeight: 700,
                margin: "16px 0 8px 0",
                padding: "13px 12px",
                fontSize: 17,
                zIndex: 4,
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
        <footer style={{
          marginTop: 38,
          color: "#997d3a",
          fontSize: 15.5,
          textAlign: "center",
          fontWeight: 600,
          zIndex: 2,
        }}>
          Powered by <a href="https://www.themealdb.com/api.php" target="_blank" rel="noopener noreferrer" style={{
            color: "#fc7e2a",
            textDecoration: "none"
          }}>TheMealDB API</a>.<br />
          <span style={{
            fontSize: 12,
            color: "#b5adcf"
          }}>
            Chef theme with wheel, animated utensils and lively colors &copy; {new Date().getFullYear()}
          </span>
        </footer>
      </header>
    </div>
  );
}

export default App;
