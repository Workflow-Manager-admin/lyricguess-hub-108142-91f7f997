import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * Lyric Guessing Game v2: Playlist content and audio preview are now served
 * entirely by the backend, keeping Spotify API credentials server-side.
 * Frontend only communicates with backend endpoints for random game data.
 */

// Theme constants
const themeVars = {
  '--primary': '#1DB954',
  '--accent': '#F5C518',
  '--secondary': '#191414',
  '--background': '#ffffff',
  '--text': '#191414',
  '--card-bg': '#f8f9fa',
  '--border': '#e9ecef'
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

/**
 * PUBLIC_INTERFACE
 * Main App component: communicates with backend to fetch a random track,
 * preview, and choice set. All secret/Spotify API access is backend-only!
 */
function App() {
  // Apply theming
  useEffect(() => {
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  // Game state
  const [gameLoading, setGameLoading] = useState(true);
  const [track, setTrack] = useState(null); // Correct track
  const [choices, setChoices] = useState([]); // Multichoice array
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [selected, setSelected] = useState(null); // User choice
  const [feedback, setFeedback] = useState(null); // correct/incorrect/null
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [hintType, setHintType] = useState('artist'); // 'artist' or 'length'
  const [showHint, setShowHint] = useState(false);
  const guessInputRef = useRef();

  // Fetch new question/round from backend
  const fetchGameRound = async () => {
    setGameLoading(true);
    setTrack(null);
    setChoices([]);
    setAudioPreviewUrl(null);
    setSelected(null);
    setFeedback(null);
    setRevealed(false);
    setError('');
    setShowHint(false);
    setHintType(Math.random() < 0.5 ? 'artist' : 'length');

    try {
      // 1. Fetch random track+choices from backend
      const roundResp = await fetch(`${BACKEND_URL}/api/game/random-track`);
      if (!roundResp.ok) throw new Error('Could not fetch game data from backend.');
      const roundData = await roundResp.json();

      // Track = answer track (artist, title), choices = [{artist,title,correct},...]
      setTrack(roundData.track);
      setChoices(roundData.choices);

      // 2. Fetch audio preview via backend proxy endpoint (if available)
      // We'll search for correct track in Spotify with backend-proxy
      // (In demo: we assume preview GET /api/spotify/preview?trackId=... is possible if we had the trackId)
      // But we don't have a trackId, so this is a stub.
      // Instead, we simulate preview by using a known public search URL for now.
      // (Backend expansion: could support including preview_url or trackId in random-track response)
      // Here: display generic search link as fallback
      setAudioPreviewUrl(`https://open.spotify.com/search/${encodeURIComponent(roundData.track.artist + " " + roundData.track.title)}`);
    } catch (e) {
      setError(
        "Could not start a new round. Make sure the backend service is running and reachable. " +
        "Error: " + (e.message || e.toString())
      );
    } finally {
      setGameLoading(false);
    }
  };

  // On mount: fetch first round
  useEffect(() => {
    fetchGameRound();
    // eslint-disable-next-line
  }, []);

  // Handle user's multiple choice selection
  const handleSelect = (choiceIdx) => {
    if (revealed) return;
    setSelected(choiceIdx);
    const c = choices[choiceIdx];
    if (c?.correct) {
      setFeedback('correct');
      setRevealed(true);
    } else {
      setFeedback('incorrect');
    }
  };

  // Go to next round
  const handleNext = () => {
    fetchGameRound();
    if (guessInputRef.current) guessInputRef.current.blur();
  };

  // Reveal a hint (artist initial or title length)
  const handleHint = () => {
    setShowHint(true);
  };

  // Hint rendering
  const renderHint = () => {
    if (!showHint || !track) return null;
    if (hintType === 'artist') {
      return (
        <span className="hint">
          <span style={{ color: themeVars['--accent'], fontWeight: 600 }}>Hint:</span> Artist's name starts with "<b>{track.artist.charAt(0)}</b>" ({track.artist.length} letters)
        </span>
      );
    }
    if (hintType === 'length') {
      return (
        <span className="hint">
          <span style={{ color: themeVars['--accent'], fontWeight: 600 }}>Hint:</span> Song title is {track.title.length} letters long
        </span>
      );
    }
    return null;
  };

  // Main app render
  return (
    <div className="App" style={{
      background: themeVars['--background'],
      color: themeVars['--text'],
      minHeight: '100vh'
    }}>
      <header className="App-header" style={{
        background: themeVars['--background'],
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'start',
        minHeight: '100vh',
        paddingTop: 26
      }}>
        <h1 style={{
          color: themeVars['--primary'],
          fontWeight: 900,
          letterSpacing: '.04em',
          fontSize: 33,
          marginBottom: 8
        }}>Song Guessing Game</h1>
        <div className="subtitle"
          style={{ color: themeVars['--secondary'], opacity: 0.95, fontSize: 18, marginBottom: 30 }}>
          Listen to the audio preview and choose the correct song from the options.
        </div>
        <div className="card" style={{
          width: '100%',
          maxWidth: 460,
          background: themeVars['--card-bg'],
          borderRadius: 15,
          boxShadow: '0 3px 24px rgba(20,40,20,0.07)',
          padding: 28,
          border: `1.5px solid ${themeVars['--border']}`,
          marginBottom: 38
        }}>
          {error && (
            <div style={{
              color: '#b70b0b',
              marginBottom: 20,
              background: '#fff3f3',
              borderRadius: 9,
              padding: '9px 0'
            }}>{error}</div>
          )}
          {gameLoading ? (
            <div>
              <span style={{
                color: themeVars['--secondary'],
                fontSize: 21,
                fontWeight: 600
              }}>🎼 Loading...</span>
            </div>
          ) : (!track || choices.length === 0) ? (
            <div style={{ color: '#b70b0b' }}>Backend didn't return a track or choices.</div>
          ) : (
            <>
              {/* Audio Preview (via backend proxy/Spotify search fallback) */}
              <div className="preview" style={{ marginBottom: 22 }}>
                <a
                  href={audioPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="spotify-preview-link"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    textDecoration: 'none', color: themeVars['--primary'],
                    fontWeight: 600, fontSize: 17
                  }}>
                  ▶️ Listen to preview on Spotify
                </a>
              </div>
              {/* Multiple-choice options for guessing */}
              <form
                onSubmit={(e) => e.preventDefault()}
                style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%' }}>
                  {choices.map((c, idx) => (
                    <button
                      ref={idx === 0 ? guessInputRef : null}
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      className="btn"
                      style={{
                        background: selected === idx
                          ? (c.correct
                              ? themeVars['--primary']
                              : '#b70b0b')
                          : themeVars['--primary'],
                        color: '#fff',
                        border: 'none',
                        borderRadius: 7,
                        fontSize: 16,
                        marginBottom: 12,
                        width: '90%',
                        fontWeight: 600,
                        opacity: revealed && !c.correct ? 0.67 : 1,
                        cursor: revealed ? 'not-allowed' : 'pointer',
                        outline: selected === idx ? `2.7px solid ${themeVars['--accent']}` : 'none'
                      }}
                      disabled={revealed}
                      aria-label={`choice-${idx}`}
                    >
                      {c.title} <span style={{ color: themeVars['--secondary'], fontWeight: 400 }}>by</span> {c.artist}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {!showHint && (
                    <button
                      type="button"
                      className="btn accent"
                      onClick={handleHint}
                      style={{
                        marginLeft: 0,
                        background: themeVars['--accent'],
                        border: 'none',
                        color: '#191414',
                        borderRadius: 7,
                        fontSize: 15,
                        padding: '7.5px 16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                      Need a hint?
                    </button>
                  )}
                  {revealed && (
                    <button
                      type="button"
                      className="btn"
                      onClick={handleNext}
                      style={{
                        marginLeft: 0,
                        background: themeVars['--primary'],
                        border: 'none',
                        color: '#fff',
                        borderRadius: 7,
                        fontWeight: 600,
                        fontSize: 15,
                        padding: '7.5px 18px',
                        cursor: 'pointer'
                      }}>
                      Next
                    </button>
                  )}
                </div>
              </form>
              <div style={{ minHeight: 33, marginTop: 8 }}>
                {feedback === 'correct' && (
                  <span style={{
                    color: themeVars['--primary'],
                    fontWeight: 700,
                    fontSize: 18
                  }}>🎉 Correct! Nice guess.</span>
                )}
                {feedback === 'incorrect' && (
                  <span style={{
                    color: '#b70b0b',
                    background: '#ffedf0',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontWeight: 600
                  }}>
                    ❌ Not quite. Try again or reveal the answer!
                  </span>
                )}
              </div>
              <div style={{ marginTop: 9 }}>{renderHint()}</div>
              <div style={{ marginTop: 23 }}>
                {/* Reveal correct answer */}
                {revealed && (
                  <div className="reveal-section">
                    <div className="answer-main">
                      <span className="label" style={{ color: themeVars['--primary'], fontWeight: 600 }}>🎵 The song: </span>
                      <span className="song">{track.title}</span> by <span className="artist">{track.artist}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 15 }}>
          Powered by <b>LyricGuess backend proxy</b>, Spotify, iTunes &amp; Genius APIs.<br />
          <span style={{ fontSize: 12 }}>
            <span style={{ color: themeVars['--primary'] }}>Primary: #1DB954</span> &middot;
            <span style={{ color: themeVars['--accent'], marginLeft: 4 }}>Accent: #F5C518</span> &middot;
            <span style={{ color: themeVars['--secondary'], marginLeft: 4 }}>Secondary: #191414</span>
          </span>
        </div>
      </header>
    </div>
  );
}

export default App;
