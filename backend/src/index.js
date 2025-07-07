/**
 * Backend service to proxy Spotify API requests and securely store credentials.
 * Exposes endpoints for:
 *  - /auth/token: Securely obtain Spotify access tokens for backend use.
 *  - /preview: Proxy Spotify track previews/audio.
 *  - /random-track: Serve random tracks/choices for the guessing game.
 * 
 * Environment variables (see .env.example):
 *   - SPOTIFY_CLIENT_ID
 *   - SPOTIFY_CLIENT_SECRET
 *   - SPOTIFY_REDIRECT_URI (optional, not currently used in client credentials flow)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const spotifyRoutes = require('./routes/spotify');
const trackRoutes = require('./routes/tracks');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: "*", // For development; specify in prod
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({status: "ok"}));

// API routes
app.use('/api/spotify', spotifyRoutes);
app.use('/api/game', trackRoutes);

// Swagger/OpenAPI and docs note
app.get('/', (req, res) => {
  res.send(`
    <h2>LyricGuess Backend Proxy</h2>
    <p>Available endpoints:</p>
    <ul>
      <li><b>POST /api/spotify/token</b> — Obtain Spotify access token (Client Credentials, server-protected)</li>
      <li><b>GET /api/spotify/preview?trackId=...</b> — Proxy Spotify track preview/audio endpoint</li>
      <li><b>GET /api/game/random-track</b> — Get a random track & distractors for the guessing game</li>
    </ul>
  `);
});

app.listen(PORT, () => {
  console.log(`Backend Spotify proxy listening on port ${PORT}`);
});
