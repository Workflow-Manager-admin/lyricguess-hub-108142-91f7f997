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

// PUBLIC_INTERFACE
/**
 * VirtualRecipeRoulette: Main app - lets users "spin" for a random recipe and displays details.
 */
function App() {
  // Apply cheerful theme on mount
  React.useEffect(() => {
    Object.entries(recipeTheme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState("");
  const [spinCount, setSpinCount] = useState(0);

  // PUBLIC_INTERFACE
  // Fetches a random recipe from TheMealDB API
  const spinRecipe = async () => {
    setLoading(true);
    setError("");
    setRecipe(null);
    try {
      const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
      if (!resp.ok) throw new Error("Could not fetch recipe. Try again later!");
      const data = await resp.json();
      if (!data.meals || !data.meals[0]) throw new Error("No recipe found.");
      setRecipe(data.meals[0]);
      setSpinCount((prev) => prev + 1);
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
  // Render recipe detail card
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
          {firstLanding && (
            <div style={{
              textAlign: "center", marginTop: 80
            }}>
              <div style={{
                fontSize: 50,
                marginBottom: 11,
                animation: "spinIcon 2.2s cubic-bezier(.25,1.8,.8,1.08) infinite"
              }}>🎲</div>
              <div style={{
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 13,
                color: recipeTheme["--primary"]
              }}>
                Ready for a tasty surprise?
              </div>
              <button
                className="btn"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  padding: "11px 32px",
                  borderRadius: 9,
                  background: recipeTheme["--primary"],
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 4px 17px #f28e222b"
                }}
                onClick={spinRecipe}
                disabled={loading}
              >
                {loading ? "Spinning..." : "🍀 Spin for a Recipe!"}
              </button>
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
