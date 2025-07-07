import React, { useState } from "react";
import "./App.css";

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
 * VirtualRecipeRoulette: Main app - lets users "spin" for a random recipe and displays details,
 * now enhanced with ingredient and dietary/lifestyle filters.
 */
function App() {
  // Apply cheerful theme on mount
  React.useEffect(() => {
    Object.entries(recipeTheme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, []);

  // DRINK & SIDE PAIRING STATE
  const [drink, setDrink] = useState(null);
  const [drinkLoading, setDrinkLoading] = useState(false);
  const [drinkError, setDrinkError] = useState("");

  // Optional: default side dish pairings by category/region fallback (as static JS, minimal for demo)
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
    // ...add more as desired
  };

  // NEW: State for filter UI
  const [ingredientInput, setIngredientInput] = useState("");
  const [userIngredients, setUserIngredients] = useState([]);
  const [dietary, setDietary] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [spinCount, setSpinCount] = useState(0);

  // List of dietary options (can be expanded)
  const dietaryOptions = [
    { value: "", label: "Any" },
    { value: "Vegetarian", label: "Vegetarian" },
    { value: "Vegan", label: "Vegan" },
    { value: "Gluten-Free", label: "Gluten-Free" },
    { value: "Pescatarian", label: "Pescatarian" },
    { value: "Lacto-Vegetarian", label: "Lacto-Vegetarian" },
    { value: "Ovo-Vegetarian", label: "Ovo-Vegetarian" }
  ];

  // Cuisine/region options as per TheMealDB
  // See https://www.themealdb.com/api/json/v1/1/list.php?a=list
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

  const [region, setRegion] = useState(""); // NEW: region/cuisine

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

  // Helper: fetch a drink suggestion based on recipe name/area/category
  // PUBLIC_INTERFACE
  // Suggest a drink from TheCocktailDB to pair with a recipe. Returns a drink object or null on error.
  const fetchDrinkPairing = async (recipe) => {
    setDrink(null);
    setDrinkLoading(true);
    setDrinkError("");
    try {
      // Try by category (maps best! e.g. "Seafood")
      let q = recipe?.strCategory || recipe?.strArea || recipe?.strMeal;
      let resp = null;
      if (q) {
        // Try filter by main ingredient/category from recipe
        // For strCategory, map to best CocktaiDB category if sensible (e.g. "Seafood", "Beef" do not match, so fallback to random)
        // Try ingredient in name search
        resp = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail`
        );
        let cocktails = [];
        if (resp.ok) {
          const d = await resp.json();
          if (d.drinks) cocktails = d.drinks;
        }

        // Fallback to drinks containing the recipe's main ingredient
        if (!cocktails.length && recipe?.strMeal) {
          const resIngr = await fetch(
            `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
              recipe.strMeal.split(" ")[0]
            )}`
          );
          const dt = await resIngr.json();
          if (dt.drinks) cocktails = dt.drinks;
        }
        // Pick random, fallback if empty
        if (!cocktails.length) {
          // Final fallback: completely random cocktail
          const rnd = await fetch(
            "https://www.thecocktaildb.com/api/json/v1/1/random.php"
          );
          const dRnd = await rnd.json();
          if (dRnd.drinks && dRnd.drinks[0]) {
            setDrink(dRnd.drinks[0]);
            return;
          }
        } else {
          // Pick random drink from found pool
          setDrink(cocktails[Math.floor(Math.random() * cocktails.length)]);
          return;
        }
      } else {
        // If no query at all just get a random drink
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
  };

  // PUBLIC_INTERFACE
  // Fetches a recipe with filters (diet/ingredient/region) or random if no filter,
  // plus drink/side pairing
  const spinRecipe = async () => {
    setLoading(true);
    setError("");
    setRecipe(null);
    setDrink(null);
    setDrinkLoading(false);
    setDrinkError("");
    // Helper to get the intersected pool of IDs from different filter types (ingredient/area/category)
    const filterByFilters = async (ingredients, diet, region) => {
      // No filters: fallback to random
      if (!ingredients.length && !diet && !region) return null;
      // Helper for filtered search
      // TheMealDB APIs:
      // /filter.php?i=ingredient(s)
      // /filter.php?c=Category (for diet types)
      // /filter.php?a=Area (for region/country)
      let pools = [];
      // Ingredient filter result
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
      // Diet/Lifestyle (category)
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
      // Region/Area
      if (region) {
        const resp = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(region)}`
        );
        if (!resp.ok) return null;
        const d = await resp.json();
        if (!d.meals) return null;
        pools.push(new Set(d.meals.map((m) => m.idMeal)));
      }
      // If nothing matched (eg. invalid combo), fallback
      if (!pools.length) return null;
      // Intersect the ID pools
      let resultIds = pools[0];
      if (pools.length > 1) {
        for (let i = 1; i < pools.length; ++i) {
          resultIds = new Set([...resultIds].filter((x) => pools[i].has(x)));
        }
      }
      if (!resultIds.size) return null;
      // Pick a random id from intersection
      const allIds = Array.from(resultIds);
      const chosenId = allIds[Math.floor(Math.random() * allIds.length)];
      // Now look up the full recipe
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
      // Prefer the advanced filter logic if user chose region/diet/ingredient
      if (ingredientsArr.length || dietary || region) {
        rec = await filterByFilters(ingredientsArr, dietary, region);
      }
      // fallback: random
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
      // Trigger drink/side suggestion after main recipe is set
      setTimeout(() => fetchDrinkPairing(rec), 1); // defer so UI is instant
    } catch (err) {
      setError(
        "😥 Oops! Failed to fetch a recipe. Please check your connection or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // First load: Show "Spin!" prompt
  const firstLanding = !loading && !recipe && !error;

  // PUBLIC_INTERFACE
  // Render ingredient list
  const renderIngredients = (recipe) => {
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
              color: recipeTheme["--primary"],
              fontWeight: 500
            }}
            key={idx}>
            <span style={{ color: recipeTheme["--secondary"], fontWeight: 700 }}>
              {itm.ingredient}
            </span>
            {itm.measure && " - "}
            <span style={{ color: "#6b590c", fontWeight: 400 }}>{itm.measure}</span>
          </li>
        )}
      </ul>
    );
  };

  // PUBLIC_INTERFACE
  // Human-friendly name, e.g., Dinner / Vegan / etc
  const prettyCategory = (cat) => {
    if (!cat) return null;
    return cat.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // PUBLIC_INTERFACE
  // Render pairing suggestion visually as a card/section below the recipe
  const PairingSuggestion = ({ drink, drinkLoading, drinkError, recipe }) => {
    if (drinkLoading) {
      return (
        <div className="card" style={{
          margin: "15px auto 0 auto",
          maxWidth: 415,
          background: "#efe6ff",
          color: "#6643ad",
          padding: "18px 16px 16px 16px",
          border: `2px dashed ${recipeTheme["--secondary"]}`,
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
          border: `2px dashed ${recipeTheme["--fail"]}`,
          fontWeight: 700,
          padding: "13px 14px 12px 14px",
          borderRadius: 12,
          textAlign: "center"
        }}>
          {drinkError}
        </div>
      );
    }
    // If we got a drink pairing
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
    // If not drink, fallback to a fun side suggestion
    // Try category or region
    let side = null;
    const cat = recipe?.strCategory;
    // Try to match known category name (case-insensitive, partial ok)
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
    // If still none, try any
    if (!side) {
      // Pick from "Vegetarian" as generic, or pick random of all sides
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
  };

  // PUBLIC_INTERFACE
  // Render recipe detail card, with pairing suggestion
  const renderRecipeCard = (r) => (
    <div
      className="card"
      style={{
        background: recipeTheme["--card-bg"],
        border: `2.5px solid ${recipeTheme["--border"]}`,
        borderRadius: 16,
        margin: "0 auto",
        maxWidth: 450,
        padding: 0,
        boxShadow: "0px 5px 37px #f3cf75c0, 0px 1.8px 22px #985ff80a"
      }}
    >
      {/* Image & Title Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: recipeTheme["--background"],
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderBottom: `1.5px solid ${recipeTheme["--border"]}`,
        padding: "19px 19px 8px 19px"
      }}>
        <img
          src={r.strMealThumb}
          alt={r.strMeal}
          style={{
            width: 90,
            height: 90,
            borderRadius: "14px",
            boxShadow: "0 3px 9px #94731a35",
            objectFit: "cover",
            marginRight: 18,
            border: `2px solid ${recipeTheme["--primary"]}`,
            background: "#fff"
          }}
        />
        <div>
          <h2 style={{
            color: recipeTheme["--secondary"],
            fontWeight: 800,
            margin: 0,
            fontSize: 23,
            marginBottom: 3,
            letterSpacing: ".04em"
          }}>{r.strMeal}</h2>
          <div style={{
            fontSize: 15.5,
            color: recipeTheme["--primary"],
            fontWeight: 600,
            marginBottom: 2,
          }}>
            {prettyCategory(r.strCategory)}
            {r.strArea && <span style={{ color: recipeTheme["--secondary"], fontWeight: 400, marginLeft: 8 }}>| {r.strArea}</span>}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div style={{ padding: "7px 22px 12px 22px" }}>
        <div style={{
          color: "#a19a27", fontWeight: 600, marginBottom: 3, marginTop: 7, fontSize: 16.4
        }}>Ingredients</div>
        {renderIngredients(r)}
        <div style={{ margin: "10px 0", borderTop: `1px solid ${recipeTheme["--border"]}` }}></div>
        {/* Instructions */}
        <div style={{
          color: "#8040a2",
          fontSize: 16.5,
          fontWeight: 600,
          marginBottom: 4
        }}>Instructions</div>
        <div style={{
          color: "#62365b",
          fontSize: 15.2,
          marginBottom: 11
        }}>
          {r.strInstructions.split(". ").map((s, idx, arr) => {
            // Avoid trailing empty chunk if recipe ends with '.'
            if (!s.trim() || (arr.length - 1 === idx && !s.replace(".", "").trim())) return null;
            return (
              <span key={idx}>
                {s.trim()}
                {idx !== arr.length - 1 ? ". " : ""}
              </span>
            );
          })}
        </div>
        {/* Recipe video section */}
        <div style={{
          borderTop: `1px solid ${recipeTheme["--border"]}`,
          marginTop: 3,
          paddingTop: 12,
          textAlign: "center",
          minHeight: 86
        }}>
          {(() => {
            // Helper to robustly extract and validate a YouTube ID from various link forms
            function getYouTubeId(youtubeUrl) {
              if (!youtubeUrl || typeof youtubeUrl !== "string") return null;
              // Patterns for common TheMealDB outputs
              // e.g. https://www.youtube.com/watch?v=XXXXXXXXXXX
              const watch = youtubeUrl.match(/v=([\w-]{11})/);
              if (watch) return watch[1];
              // e.g. https://youtu.be/XXXXXXXXXXX
              const short = youtubeUrl.match(/youtu\.be\/([\w-]{11})/);
              if (short) return short[1];
              // e.g. https://www.youtube.com/embed/XXXXXXXXXXX
              const embed = youtubeUrl.match(/embed\/([\w-]{11})/);
              if (embed) return embed[1];
              // Some .com/v/XXXXXXXXXXX
              const vpath = youtubeUrl.match(/\/v\/([\w-]{11})/);
              if (vpath) return vpath[1];
              return null;
            }
            const ytId = getYouTubeId(r.strYoutube);
            if (ytId) {
              // There is a valid YouTube link
              return (
                <div style={{ margin: "0 auto", maxWidth: 410 }}>
                  <div style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 14px #e72c791b, 0 1.5px 8px #b0a1f320",
                    marginBottom: 8
                  }}>
                    <iframe
                      width="100%"
                      height="240"
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="Recipe video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 12, width: "100%", maxWidth: 410, background: "#000" }}
                    ></iframe>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${ytId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#e72c79", background: "#ffe6fa", borderRadius: 7,
                      fontSize: 15, padding: "4.5px 12px", fontWeight: 600, textDecoration: "none"
                    }}>
                    ▶️ Watch recipe video on YouTube
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
                padding: "9px 0",
                fontWeight: 600,
                fontSize: 16.5
              }}>
                📺 Video not available for this recipe.
              </div>
            );
          })()}
        </div>
      </div>
      {/* Drinks/side pairing suggestion */}
      <PairingSuggestion drink={drink} drinkLoading={drinkLoading} drinkError={drinkError} recipe={r} />
      {/* Bottom spin again button */}
      <div style={{
        textAlign: "center",
        padding: "12px 0 15px 0"
      }}>
        <button
          className="btn accent"
          style={{
            background: recipeTheme["--primary"],
            color: "#fff",
            fontWeight: 700,
            fontSize: 17,
            borderRadius: 8,
            border: "none",
            marginTop: 3,
            marginBottom: 0,
            boxShadow: "0 2px 12px #ff947132"
          }}
          onClick={spinRecipe}
          disabled={loading}
        >
          {loading ? "Spinning..." : "🍳 Spin Again"}
        </button>
      </div>
    </div>
  );

  // Render
  return (
    <div className="App" style={{
      minHeight: "100vh",
      background: recipeTheme["--background"],
      color: recipeTheme["--secondary"]
    }}>
      <header className="App-header" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        background: recipeTheme["--background"],
        paddingTop: 26
      }}>
        <h1 style={{
          color: recipeTheme["--primary"],
          fontWeight: 900,
          fontSize: 36,
          marginBottom: 8,
          letterSpacing: ".03em",
          textShadow: "1.2px 1.2px #fff7de, 0 2.5px 8px #ffecb550"
        }}>
          Virtual Recipe Roulette
        </h1>
        <div className="subtitle"
          style={{
            color: recipeTheme["--secondary"],
            opacity: 0.95,
            fontSize: 19,
            marginBottom: 24,
            fontWeight: 500,
            letterSpacing: ".02em"
          }}>
          Spin the wheel to discover a surprise recipe, with step-by-step instructions and ingredients!
        </div>
        <div style={{ width: "100%", maxWidth: 470, minHeight: 370 }}>
          {error && (
            <div style={{
              color: recipeTheme["--fail"],
              background: "#fff6f7",
              borderRadius: 10,
              border: `1.5px solid ${recipeTheme["--fail"]}22`,
              fontWeight: 600,
              margin: "0 0 18px 0",
              padding: "12px 15px"
            }}>{error}</div>
          )}
          {/* Filter UI: show *before* the spin/recipe UI */}
          {firstLanding && (
            <div
              style={{
                margin: "32px auto 0 auto",
                maxWidth: 440,
                padding: 0,
                textAlign: "center"
              }}
            >
              <div
                className="card"
                style={{
                  background: recipeTheme["--card-bg"],
                  boxShadow: "0px 3px 19px #f1ca40c7, 0 1.3px 7px #63aff220",
                  border: `2.5px solid ${recipeTheme["--border"]}`,
                  borderRadius: 14,
                  margin: "0 auto 0 auto",
                  maxWidth: 440,
                  padding: "19px 20px 23px 20px"
                }}
              >
                <div style={{
                  fontWeight: 700,
                  fontSize: 24,
                  color: recipeTheme["--secondary"],
                  marginBottom: 5,
                  letterSpacing: ".03em"
                }}>
                  <span role="img" aria-label="roulette">🥒</span> Ingredient & Dietary Filter
                </div>
                <div
                  style={{
                    fontWeight: 500,
                    color: "#5f3e07",
                    fontSize: 15.3,
                    marginBottom: 13
                  }}
                >
                  {"Choose dietary/lifestyle, add ingredients (optional), and spin for a recipe match!"}
                </div>
                {/* REGION/COUNTRY/CUISINE SELECTOR */}
                <div style={{ marginBottom: 17, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                      htmlFor="region"
                      style={{
                        fontWeight: 600,
                        color: "#1dbe7e",
                        marginRight: 8,
                        letterSpacing: ".01em",
                        fontSize: 16.2,
                        marginBottom: 3
                      }}
                    >
                      <span role="img" aria-label="globe" style={{ marginRight: 3 }}>🌍</span>
                      Region/Cuisine:
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={region}
                      style={{
                        border: `1.6px solid ${recipeTheme["--accent"]}`,
                        borderRadius: 7,
                        background: "#e2f4e9",
                        marginBottom: 0,
                        padding: "7px 10px",
                        fontSize: 15.5,
                        color: "#134346",
                        fontWeight: 500,
                        outline: "none",
                        minWidth: 139,
                        fontFamily: "inherit"
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

                  {/* DIETARY SELECTOR */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <label
                      htmlFor="dietary"
                      style={{
                        fontWeight: 600,
                        color: recipeTheme["--primary"],
                        marginRight: 9,
                        letterSpacing: ".01em",
                        fontSize: 16.2,
                        marginBottom: 3
                      }}
                    >
                      <span role="img" aria-label="fork">🥗</span> Dietary/Lifestyle:
                    </label>
                    <select
                      id="dietary"
                      name="dietary"
                      value={dietary}
                      style={{
                        border: `1.6px solid ${recipeTheme["--secondary"]}`,
                        borderRadius: 7,
                        background: "#fae5d5",
                        marginBottom: 0,
                        padding: "7px 10px",
                        fontSize: 15.6,
                        color: "#4f2a01",
                        fontWeight: 500,
                        outline: "none",
                        minWidth: 139,
                        fontFamily: "inherit"
                      }}
                      onChange={e => setDietary(e.target.value)}
                    >
                      {dietaryOptions.map(opt => (
                        <option value={opt.value} key={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 11
                }}>
                  <input
                    type="text"
                    placeholder="Enter an ingredient (e.g. tomato)"
                    value={ingredientInput}
                    style={{
                      width: 185,
                      fontSize: 15.2,
                      padding: "7px 10px",
                      borderRadius: 7,
                      border: `1.2px solid ${recipeTheme["--primary"]}`,
                      marginRight: 8,
                      marginBottom: 2,
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
                      background: recipeTheme["--accent"],
                      color: "#241410",
                      fontWeight: 700,
                      fontSize: 15.4,
                      padding: "7px 12px",
                      borderRadius: 7,
                      border: "none",
                      marginTop: 1
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
                {/* Show chosen tags */}
                <div style={{ minHeight: 27, marginBottom: 8 }}>
                  {userIngredients.length > 0 && (
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center"
                    }}>
                      {userIngredients.map((ing, idx) => (
                        <span key={idx}
                          style={{
                            background: "#ffe1c9",
                            color: recipeTheme["--primary"],
                            fontWeight: 500,
                            borderRadius: 8,
                            fontSize: 14.1,
                            padding: "3.5px 11px 3.5px 10px",
                            display: "inline-flex",
                            alignItems: "center",
                            marginBottom: 3,
                            border: `1.2px solid ${recipeTheme["--border"]}`,
                            boxShadow: "0 1.1px 3px #e6ba4e1b"
                          }}>
                          {ing}
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: recipeTheme["--fail"],
                              fontWeight: 700,
                              marginLeft: 5,
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
                <button
                  className="btn"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    padding: "12px 36px",
                    borderRadius: 9,
                    background: recipeTheme["--primary"],
                    color: "#fff",
                    border: "none",
                    marginTop: 5,
                    boxShadow: "0 4px 17px #fc7e2a24"
                  }}
                  onClick={spinRecipe}
                  disabled={loading}
                >
                  {loading ? "Spinning..." : "🍀 Spin for a Recipe!"}
                </button>
              </div>
            </div>
          )}
          {loading && !firstLanding && (
            <div style={{
              textAlign: "center", marginTop: 67
            }}>
              <div style={{
                fontSize: 36,
                letterSpacing: ".06em",
                color: recipeTheme["--accent"],
                marginBottom: 17,
                fontWeight: 600
              }}>
                Spinning the recipe wheel...
              </div>
              <div style={{
                fontSize: 23,
                margin: "17px 0 0 0",
                animation: "spinIcon 1.6s cubic-bezier(.25,1.8,.8,1.08) infinite"
              }}>🎰🍜</div>
            </div>
          )}
          {!loading && recipe && renderRecipeCard(recipe)}
        </div>
        <footer style={{
          marginTop: 50,
          color: "#8d7e99",
          fontSize: 14.5,
          textAlign: "center",
          fontWeight: 500
        }}>
          Powered by <a href="https://www.themealdb.com/api.php" target="_blank" rel="noopener noreferrer" style={{
            color: recipeTheme["--primary"],
            textDecoration: "none"
          }}>TheMealDB API</a>.<br />
          <span style={{
            fontSize: 12,
            color: "#b5adcf"
          }}>
            Bright colors: orange <span style={{color: recipeTheme["--primary"]}}>●</span>,
            mint <span style={{color: recipeTheme["--accent"]}}>●</span>,
            purple <span style={{color: recipeTheme["--secondary"]}}>●</span>
            . &copy; {new Date().getFullYear()}
          </span>
          <style>
            {`
            @keyframes spinIcon {
              0%   { transform: rotate(-10deg) scale(1); }
              60%  { transform: rotate(20deg) scale(1.15);}
              100% { transform: rotate(-10deg) scale(1);}
            }
            `}
          </style>
        </footer>
      </header>
    </div>
  );
}

export default App;
