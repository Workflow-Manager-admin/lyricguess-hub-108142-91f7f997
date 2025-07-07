const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * PUBLIC_INTERFACE
 * POST /api/spotify/token
 * Proxy endpoint to retrieve a Spotify access token using client credentials (server-side only).
 * Never expose client secret to frontend.
 * 
 * Response: { access_token, token_type, expires_in }
 */
router.post('/token', async (req, res) => {
  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const resp = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    res.json(resp.data);
  } catch (err) {
    console.error("Auth error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to get Spotify token." });
  }
});

/**
 * PUBLIC_INTERFACE
 * GET /api/spotify/preview
 * Proxy audio preview for a given Spotify track (optionally could proxy other types of Spotify content).
 * Query: trackId=<Spotify Track ID>
 * If found, redirects to the preview_url; else, returns 404.
 */
router.get('/preview', async (req, res) => {
  const { trackId } = req.query;
  if (!trackId) return res.status(400).json({ error: "trackId required" });

  try {
    // Get a Spotify token for app
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const tokenResp = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    const token = tokenResp.data.access_token;

    // Retrieve track details
    const trackResp = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const preview = trackResp.data.preview_url;
    if (!preview) return res.status(404).json({ error: "No preview for this track." });
    // Optionally, stream/proxy audio content. Here, let's redirect:
    return res.redirect(preview);
  } catch (err) {
    console.error("Error fetching preview:", err?.response?.data || err.message);
    res.status(500).json({ error: "Could not fetch preview URL." });
  }
});

module.exports = router;
