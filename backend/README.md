# LyricGuess Backend

A secure Express backend for Spotify-powered song guessing games.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure your environment:**
   - Copy `.env.example` to `.env` and fill in your Spotify credentials.
3. **Start the server:**
   ```bash
   npm start
   ```
   By default, runs on port 5000.

## API
- `GET /api/spotify/token` — return Spotify access token (internal use)
- `GET /api/spotify/preview/:id` — proxy to preview_url of a Spotify track
- `GET /api/game/random-track` — returns an object with one correct song (with preview) + 3 distractors

## Security
- Never commit `.env` with credentials!
