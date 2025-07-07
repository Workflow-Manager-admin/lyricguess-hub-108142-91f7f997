const express = require('express');
const router = express.Router();

// Demo static track pool for guessing game
const TRACKS_POOL = [
  { artist: "Adele", title: "Someone Like You" },
  { artist: "Queen", title: "Bohemian Rhapsody" },
  { artist: "The Beatles", title: "Hey Jude" },
  { artist: "Billie Eilish", title: "bad guy" },
  { artist: "Imagine Dragons", title: "Believer" },
  { artist: "Ed Sheeran", title: "Shape of You" },
  { artist: "Toto", title: "Africa" },
  { artist: "Eminem", title: "Lose Yourself" },
  { artist: "Lady Gaga", title: "Shallow" },
  { artist: "Journey", title: "Don't Stop Believin'" }
];

/**
 * PUBLIC_INTERFACE
 * GET /api/game/random-track
 * Returns one random track (plus 2 distractors for choices; expand as needed)
 * Response: { track: { artist, title }, choices: [artist/title, ...] }
 */
router.get('/random-track', (req, res) => {
  const main = TRACKS_POOL[Math.floor(Math.random() * TRACKS_POOL.length)];
  // Build distractors
  const poolShuffled = TRACKS_POOL
    .filter(t => !(t.artist === main.artist && t.title === main.title))
    .sort(() => Math.random() - 0.5);
  const distractors = poolShuffled.slice(0, 2);

  const choices = [
    { artist: main.artist, title: main.title, correct: true },
    ...distractors.map(t => ({ artist: t.artist, title: t.title, correct: false }))
  ].sort(() => Math.random() - 0.5);

  res.json({ track: main, choices });
});

module.exports = router;
