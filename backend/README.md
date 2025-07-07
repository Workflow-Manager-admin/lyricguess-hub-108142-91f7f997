# LyricGuess Backend Proxy (Node/Express)

This is a secure proxy backend for the Lyric Guess game, handling Spotify credentials and proxying Spotify API calls so that client secrets are never exposed to the browser.

## Main Features

- **Spotify Token Endpoint**: Securely acquires and manages Spotify tokens for API use.
- **Audio Preview Proxy**: Proxies or redirects Spotify audio preview for a given track.
- **Random Track Endpoint**: Supplies frontend with random tracks/choices for gameplay (configurable).

## Endpoints

- `POST /api/spotify/token` — Get a Spotify token (server-to-server, never expose secret to frontend).
- `GET /api/spotify/preview?trackId=...` — Proxy Spotify audio preview for a track.
- `GET /api/game/random-track` — Get a random track (with distractors).

## Getting Started

1. Copy `.env.example` to `.env` and fill in your actual Spotify API credentials.
2. Install dependencies:

   ```
   npm install
   ```

3. Run the backend:

   ```
   npm start
   ```

## Secure Storage

**Never commit your `.env` with the actual Spotify secrets to version control.**

## License

MIT
