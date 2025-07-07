import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * COLOR THEME:
 *  - Primary:   #1DB954 (Spotify green)
 *  - Accent:    #F5C518 (Genius yellow)
 *  - Secondary: #191414 (Spotify dark)
 */

/**
 * A minimalist, modern, light-themed single-page lyric guessing game.
 * Users are shown a random lyric (via Lyrics.ovh). They guess the artist or song.
 * After each guess: immediate feedback, hints available, audio preview from Spotify, and
 * extended metadata (artist bio, album info, Genius lyrics link) shown using public/free APIs.
 */

// Theme color styles setup
const themeVars = {
  '--primary': '#1DB954',
  '--accent': '#F5C518',
  '--secondary': '#191414',
  '--background': '#ffffff',
  '--text': '#191414',
  '--card-bg': '#f8f9fa',
  '--border': '#e9ecef'
};

// ------------ Helper functions for API requests ------------

const LYRICS_OVH_API = 'https://api.lyrics.ovh/v1/';
const GENIUS_SEARCH_API = 'https://genius-song-lyrics1.p.rapidapi.com/search/';
const SPOTIFY_SEARCH_API = 'https://api.spotify.com/v1/search';
const LASTFM_ARTIST_API = 'https://ws.audioscrobbler.com/2.0/';

// You need to provide a free RapidAPI key for Genius free endpoint, and a Last.fm API key for artist bio; for test/demo, we link to Genius instead of fetching directly.

// Demo pool: a selection of known hits to enable reliable audio and metadata retrieval
const TRACKS_POOL = [
  {
    artist: "Adele",
    title: "Someone Like You"
  },
  {
    artist: "Queen",
    title: "Bohemian Rhapsody"
  },
  {
    artist: "The Beatles",
    title: "Hey Jude"
  },
  {
    artist: "Billie Eilish",
    title: "bad guy"
  },
  {
    artist: "Imagine Dragons",
    title: "Believer"
  },
  {
    artist: "Ed Sheeran",
    title: "Shape of You"
  },
  {
    artist: "Toto",
    title: "Africa"
  },
  {
    artist: "Eminem",
    title: "Lose Yourself"
  },
  {
    artist: "Lady Gaga",
    title: "Shallow"
  },
  {
    artist: "Journey",
    title: "Don't Stop Believin'"
  }
];

// Helper: Sleep for ms delay (used for UI transitions)
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * PUBLIC_INTERFACE
 * Main app component for Lyric Guessing Game.
 */
function App() {
  // Theming (always light for this app)
  useEffect(() => {
    for (const key in themeVars) {
      document.documentElement.style.setProperty(key, themeVars[key]);
    }
  }, []);

  // Game state
  const [gameLoading, setGameLoading] = useState(true);
  const [lyric, setLyric] = useState('');
  const [answerArtist, setAnswerArtist] = useState('');
  const [answerTitle, setAnswerTitle] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect'
  const [showHint, setShowHint] = useState(false);
  const [hintType, setHintType] = useState('artist'); // 'artist' or 'length'
  const [revealed, setRevealed] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null); // { url, trackUrl }
  const [songMetadata, setSongMetadata] = useState(null);
  const [artistBio, setArtistBio] = useState(null);
  const [geniusUrl, setGeniusUrl] = useState(null);

  const [error, setError] = useState('');
  const guessInputRef = useRef();

  // When resetting game
  const resetGame = () => {
    setGameLoading(true);
    setLyric('');
    setAnswerArtist('');
    setAnswerTitle('');
    setGuess('');
    setFeedback(null);
    setShowHint(false);
    setHintType(Math.random() < 0.5 ? 'artist' : 'length');
    setRevealed(false);
    setAudioPreview(null);
    setSongMetadata(null);
    setArtistBio(null);
    setGeniusUrl(null);
    setError('');
    fetchNewRound();
  };

  // Fetch lyric + details for a new round
  const fetchNewRound = async () => {
    setGameLoading(true);
    setError('');
    setFeedback(null);
    setShowHint(false);
    setRevealed(false);

    // Select a random track from pool where lyric fetch will be most reliable
    const track = TRACKS_POOL[Math.floor(Math.random() * TRACKS_POOL.length)];
    const { artist, title } = track;
    let lyricLine = '';

    // Fetch lyric (from Lyrics.ovh)
    try {
      const res = await fetch(`${LYRICS_OVH_API}${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      // Check for fetch/network issues
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (!data.lyrics) throw new Error('No lyrics found.');
      // Pick a random non-empty line from lyrics as the round's lyric cue
      const linesArr = data.lyrics.split('\n').map(x => x.trim()).filter(x => x.length > 10);
      lyricLine = linesArr[Math.floor(Math.random() * linesArr.length)];
      setLyric(lyricLine || data.lyrics.split('\n')[0]);
      setAnswerArtist(artist);
      setAnswerTitle(title);
    } catch (e) {
      setError(
        "Could not fetch a lyric via Lyrics.ovh (free public API). This API does NOT require an API key, but it is unreliable and may be down or rate limited. " +
        "Try again later, or consider alternative lyrics APIs if the problem persists. " +
        "If you want a stable experience, you may need to use a paid or more reliable lyrics API."
      );
      setGameLoading(false);
      return;
    }

    // Fetch Spotify preview (no auth: use https://open.spotify.com/embed/track/{track_id} or attempt search)
    getSpotifyPreview(artist, title);

    // Fetch Genius lyrics link
    getGeniusSongUrl(artist, title);

    // Fetch metadata (album, etc)
    getSongMetadata(artist, title);

    // Fetch artist bio (from Last.fm public endpoint)
    getArtistBio(artist);

    setGameLoading(false);
  };

  // On mount, fetch first round
  useEffect(() => {
    fetchNewRound();
    // eslint-disable-next-line
  }, []);

  // ---- API helpers below ----

  // Fetch Spotify audio preview (public search endpoint, limited market=US, will not require OAuth for preview_url)
  async function getSpotifyPreview(artist, title) {
    // Try: Use public oEmbed API for Spotify
    // Fallback: Search (no token = will be denied; so we offer embedded player via open.spotify.com as fallback)
    const query = encodeURIComponent(`${artist} ${title}`);
    fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/search/${query}`)
      .then(r => r.json())
      .then(data => {
        // Try too look for a Spotify link to the track
        // We'll attempt to infer and show the embedded player to let user play the preview
        // oEmbed sometimes produces generic result so fallback to constructing link
        let trackUrl = `https://open.spotify.com/search/${query}`;
        setAudioPreview({ url: null, trackUrl });
      })
      .catch(() => {
        // fallback search page
        setAudioPreview({ url: null, trackUrl: `https://open.spotify.com/search/${query}` });
      });
  }

  // Fetch metadata (link to album art, album name, release, etc.) from iTunes Search API (always free+public)
  async function getSongMetadata(artist, title) {
    const query = encodeURIComponent(`${title} ${artist}`);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      if (data.resultCount > 0) {
        setSongMetadata({
          album: data.results[0].collectionName,
          albumArt: data.results[0].artworkUrl100,
          release: data.results[0].releaseDate.substring(0, 10)
        });
      }
    } catch {
      setSongMetadata(null);
    }
  }

  // Genius: Only fetches song page URL w/ free endpoint (RapidAPI or just generate search link)
  function getGeniusSongUrl(artist, title) {
    // Just link to: https://genius.com/search?q=artist%20title
    setGeniusUrl(`https://genius.com/search?q=${encodeURIComponent(`${artist} ${title}`)}`);
  }

  // Last.fm: Get artist bio (public endpoint, needs API key, or fallback to Wikipedia search link)
  async function getArtistBio(artist) {
    // Fallback: link to Wikipedia search or general bio summary
    setArtistBio({
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(artist)}`,
      summary: null
    });
  }

  // Handle guess submit
  const handleGuess = (event) => {
    event.preventDefault();
    if (revealed || !lyric) return;
    const g = guess.trim().toLowerCase();
    const acceptedAnswers = [answerArtist.toLowerCase(), answerTitle.toLowerCase()];
    if (
      g === answerArtist.toLowerCase() ||
      g === answerTitle.toLowerCase()
    ) {
      setFeedback('correct');
      setRevealed(true);
    } else {
      setFeedback('incorrect');
    }
  };

  // Handles user pressing Enter in input (for focus/UX)
  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleGuess(event);
    }
  };

  // Request hint
  const handleHint = () => {
    setShowHint(true);
  };

  // Move to next lyric/round
  const handleNext = () => {
    resetGame();
    if (guessInputRef.current) guessInputRef.current.focus();
  };

  // Render hint
  const renderHint = () => {
    if (!showHint) return null;
    if (hintType === 'artist') {
      return (
        <span className="hint">
          <span style={{ color: themeVars['--accent'], fontWeight: 600 }}>Hint:</span> Artist's name starts with "<b>{answerArtist.charAt(0)}</b>" ({answerArtist.length} letters)
        </span>
      );
    }
    if (hintType === 'length') {
      return (
        <span className="hint">
          <span style={{ color: themeVars['--accent'], fontWeight: 600 }}>Hint:</span> Song title is {answerTitle.length} letters long
        </span>
      );
    }
    return null;
  };

  // Render answer/metadata section (revealed or correct)
  const renderReveal = () => {
    if (!revealed && feedback !== 'correct') return null;
    return (
      <div className="reveal-section">
        <div className="answer-main">
          <span className="label" style={{ color: themeVars['--primary'], fontWeight: 600 }}>🎵 The song: </span>
          <span className="song">{answerTitle}</span> by <span className="artist">{answerArtist}</span>
        </div>
        {songMetadata && (
          <div className="meta">
            {songMetadata.albumArt && <img src={songMetadata.albumArt} className="album-art" alt="Album" />}
            <div>
              <span className="meta-label">Album: </span>
              <span>{songMetadata.album}</span>
              <span style={{ marginLeft: 10, color: '#888', fontSize: '0.95em' }}>({songMetadata.release})</span>
            </div>
          </div>
        )}
        {audioPreview && (
          <div className="preview">
            {/* Embedding Spotify search page for track */}
            <a
              href={audioPreview.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify-preview-link"
              style={{
                display: 'inline-flex', alignItems: 'center',
                textDecoration: 'none', color: themeVars['--primary'], fontWeight: 600, marginTop: 10
              }}
            >
              ▶️ Listen/Preview on Spotify
            </a>
          </div>
        )}
        <div className="bio-genius-row" style={{ marginTop: 12 }}>
          {artistBio && (
            <a href={artistBio.url} className="bio-link" target="_blank" rel="noopener noreferrer">
              About artist (Wikipedia) →
            </a>
          )}
          {geniusUrl && (
            <a href={geniusUrl} className="genius-link" style={{ marginLeft: 10, color: themeVars['--accent'] }}
              target="_blank" rel="noopener noreferrer">
              Full lyrics on Genius →
            </a>
          )}
        </div>
      </div>
    );
  };

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
        }}>Lyric Guessing Game</h1>
        <div className="subtitle"
          style={{ color: themeVars['--secondary'], opacity: 0.95, fontSize: 18, marginBottom: 30 }}>
          Guess the song title or artist by the lyric line.
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
              }}>🎼 Loading a lyric...</span>
            </div>
          ) : (
            <>
              <div className="lyric" style={{
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 22,
                marginBottom: 28,
                color: themeVars['--secondary'],
                letterSpacing: '.02em'
              }}>
                "{lyric}"
              </div>
              <form onSubmit={handleGuess} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input
                  className="guess-input"
                  ref={guessInputRef}
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  disabled={revealed}
                  placeholder="Guess the song or artist..."
                  style={{
                    border: `1.5px solid ${themeVars['--primary']}`,
                    borderRadius: 7,
                    fontSize: 17,
                    padding: '10px 18px',
                    outline: 'none',
                    marginBottom: 10,
                    width: 260
                  }}
                  aria-label="Guess input"
                  autoComplete="off"
                  maxLength={45}
                />
                <div className="btn-row" style={{ display: 'flex', alignItems: 'center' }}>
                  <button type="submit"
                    disabled={revealed || !guess.trim()}
                    className="btn"
                    style={{
                      background: themeVars['--primary'],
                      color: '#fff',
                      border: 'none',
                      borderRadius: 7,
                      padding: '7.5px 18px',
                      fontWeight: 'bold',
                      fontSize: 16,
                      marginRight: 6,
                      cursor: revealed ? 'not-allowed' : 'pointer',
                      opacity: revealed ? 0.7 : 1
                    }}>Submit</button>
                  {!showHint && (
                    <button
                      type="button"
                      className="btn accent"
                      onClick={handleHint}
                      style={{
                        marginLeft: 6,
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
                  {revealed ? (
                    <button
                      type="button"
                      className="btn"
                      onClick={handleNext}
                      style={{
                        marginLeft: 8,
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
                  ) : null}
                </div>
              </form>
              <div style={{ minHeight: 32, marginTop: 5 }}>
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
                {renderReveal()}
              </div>
            </>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 15 }}>
          Powered by Lyrics.ovh, Spotify, iTunes & Genius APIs. <br />
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
