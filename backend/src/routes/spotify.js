const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get Spotify API Token
router.get('/token', async (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    res.json(tokenRes.data);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// Proxy preview audio
router.get('/preview/:id', async (req, res) => {
  const { id } = req.params;
  const tokenUrl = '/api/spotify/token';
  try {
    // Normally, you'd use get preview_url from a previous API call or cache
    // For demo: Just build a Spotify embed URL
    res.redirect(`https://open.spotify.com/embed/track/${id}`);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

module.exports = router;
