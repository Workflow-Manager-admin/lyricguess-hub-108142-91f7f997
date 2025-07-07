require('dotenv').config();
const express = require('express');
const cors = require('cors');

const spotifyRoutes = require('./routes/spotify');
const trackRoutes = require('./routes/tracks');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/spotify', spotifyRoutes);
app.use('/api/game', trackRoutes);

app.get('/', (req, res) => {
  res.send('LyricGuess Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
