const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory store for memes and likes (for simplicity)
let memeLikes = {};

// API to get all meme likes (this can be expanded to fetch real data from a DB)
app.get('/likes', (req, res) => {
    res.json(memeLikes);
});

// API to update like for a meme
app.post('/like', (req, res) => {
    const { memeId, likes } = req.body;
    
    if (memeId && likes >= 0) {
        memeLikes[memeId] = likes;
        res.json({ memeId, likes });
    } else {
        res.status(400).json({ error: 'Invalid data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
