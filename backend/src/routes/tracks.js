const express = require('express');
const router = express.Router();

// Sample static tracks for demo purposes
const tracks = [
  {
    id: '3n3Ppam7vgaVa1iaRUc9Lp',
    title: 'Hey Ya!',
    artist: 'OutKast',
    preview_url: 'https://p.scdn.co/mp3-preview/254586fa9fa808ca1f6c4986a979b1ea1e2c3a42?cid=1b01880c57e4712bc8de36430e3fe60',
  },
  {
    id: '7ouMYWpwJ422jRcDASZB7P',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    preview_url: 'https://p.scdn.co/mp3-preview/6725dbcc866e449351cc9bc4b6de3e56b4232284?cid=1b01880c57e4712bc8de36430e3fe60',
  },
  {
    id: '5ChkMS8OtdzJeqyybCc9R5',
    title: 'Feel Good Inc.',
    artist: 'Gorillaz',
    preview_url: 'https://p.scdn.co/mp3-preview/baca435f9fcad7bff3724162dfde352ad0d544e6?cid=1b01880c57e4712bc8de36430e3fe60',
  },
  {
    id: '6J2VN40nDAVqL6kJvmPLRa',
    title: 'Shallow',
    artist: 'Lady Gaga & Bradley Cooper',
    preview_url: 'https://p.scdn.co/mp3-preview/1ac98526cead94bd2dfa085f4bbbfb16a3a836b6?cid=1b01880c57e4712bc8de36430e3fe60',
  },
  {
    id: '4uLU6hMCjMI75M1A2tKUQC',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    preview_url: 'https://p.scdn.co/mp3-preview/13f13e7c43975c8a2f69acdcbbaccc81b331fef4?cid=1b01880c57e4712bc8de36430e3fe60',
  }
];

router.get('/random-track', (req, res) => {
  // Pick a random track as the "correct" one
  const correctIdx = Math.floor(Math.random() * tracks.length);
  const choices = [tracks[correctIdx]];

  // Pick 3 random distractors
  let distractors = tracks.filter((_, idx) => idx !== correctIdx);
  distractors = distractors
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  const allChoices = [...choices, ...distractors].sort(() => 0.5 - Math.random());

  res.json({
    track: tracks[correctIdx],
    choices: allChoices.map(({ id, title, artist }) => ({ id, title, artist })),
  });
});

module.exports = router;
