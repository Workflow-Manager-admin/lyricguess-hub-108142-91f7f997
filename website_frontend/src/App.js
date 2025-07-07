import React, { useState, useEffect, useCallback } from 'react';
import PrizeWheel from './PrizeWheel';
import Tabs from './Tabs';
import FloatingEquipment from './FloatingEquipment';
import NutritionBreakdown from './NutritionBreakdown';
import ShoppingList from './ShoppingList';
import FavoriteAndShare from './FavoriteAndShare';
import './App.css';

// PUBLIC_INTERFACE
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false); // Reset error when children change
  }, [children]);

  // Fallback rendering logic, could be improved with error logging
  if (hasError) return <div className="error-fallback">Oops! Something went wrong.</div>;

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { onError: () => setHasError(true) })
      )}
    </React.Suspense>
  );
}

// Helper to fetch a truly random recipe
const fetchRandomRecipe = async (excludeId = null) => {
  // Dummy API endpoint - replace with your own or an open API
  const endpoint = '/api/recipes/random';
  let recipe = null;
  let tries = 0;

  while (!recipe || (excludeId && recipe.id === excludeId)) {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Failed to fetch recipe');
    recipe = await res.json();
    tries++;
    if (tries > 10) break; // Prevent infinite loops
  }
  return recipe;
};

function App() {
  // All main states for feature rendering
  const [recipe, setRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState('');
  const [showEquipment, setShowEquipment] = useState(true);
  const [lastRecipeId, setLastRecipeId] = useState(null);

  const spinWheel = useCallback(async () => {
    setIsSpinning(true);
    setError('');
    try {
      const newRecipe = await fetchRandomRecipe(recipe ? recipe.id : null);
      setRecipe(newRecipe);
      setLastRecipeId(newRecipe.id);
      setActiveTab('instructions'); // Reset tabs on new recipe
    } catch (err) {
      setError('Could not load a new recipe. Please try again.');
    } finally {
      setIsSpinning(false);
    }
  }, [recipe]);

  useEffect(() => {
    // On mount, fetch a random recipe
    (async () => {
      try {
        const initialRecipe = await fetchRandomRecipe();
        setRecipe(initialRecipe);
        setLastRecipeId(initialRecipe.id);
      } catch {
        setError('Failed to load a recipe.');
      }
    })();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <span role="img" aria-label="utensils">🍽️</span>
          Recipe Prize Wheel
          <span role="img" aria-label="utensils">🍴</span>
        </h1>
      </header>

      <main>
        <ErrorBoundary>
          <section className="wheel-section">
            <PrizeWheel onSpin={spinWheel} spinning={isSpinning} />
            <button
              className="spin-btn"
              onClick={spinWheel}
              disabled={isSpinning}
              aria-label="Spin for a random recipe"
            >
              {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
            </button>
          </section>

          <section className="recipe-section">
            {error && <div className="error-message">{error}</div>}
            {recipe ? (
              <div className="card main-card animate-fadein">
                <h2>{recipe.name}</h2>
                <div className="meta-info">
                  <span className="category">{recipe.category}</span>
                  <span className="servings">{recipe.servings} servings</span>
                </div>
                <Tabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  tabList={['instructions', 'ingredients', 'drink', 'video']}
                >
                  {activeTab === 'instructions' && (
                    <div className="tab-content fadein">
                      <ol>
                        {recipe.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {activeTab === 'ingredients' && (
                    <div className="tab-content fadein">
                      <ul>
                        {recipe.ingredients.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeTab === 'drink' && recipe.drinkPairing && (
                    <div className="tab-content fadein">
                      <strong>Drink Pairing:</strong>
                      <div>{recipe.drinkPairing}</div>
                    </div>
                  )}
                  {activeTab === 'video' && recipe.video && (
                    <div className="tab-content fadein">
                      <iframe
                        width="315"
                        height="190"
                        src={recipe.video}
                        title="Recipe Video"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </Tabs>
                <FavoriteAndShare recipe={recipe} />
              </div>
            ) : (
              <div className="loading-card">Loading recipe...</div>
            )}
          </section>

          <section className="extras-section">
            <div className="extras-grouped">
              <div className="animation-group">
                <FloatingEquipment visible={showEquipment} />
              </div>
              {recipe && <NutritionBreakdown nutrition={recipe.nutrition} />}
              {recipe && <ShoppingList ingredients={recipe.ingredients} />}
            </div>
          </section>
        </ErrorBoundary>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} Recipe Prize Wheel. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default App;
