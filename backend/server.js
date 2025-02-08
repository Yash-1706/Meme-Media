const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const axios = require("axios")

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

//route to fetch and download images 
app.get('/download', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        console.error("❌ No Image URL provided.");
        return res.status(400).send("❌ Image URL is required");
    }

    try {
        console.log(`🔗 Fetching image from URL: ${imageUrl}`);

        // Fetch image with axios (handles streaming properly)
        const response = await axios.get(imageUrl, {
            responseType: "stream", // Get response as a stream
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.reddit.com/",
            }
        });

        console.log(`🖼️ Image content type: ${response.headers["content-type"]}`);

        // Set response headers
        res.setHeader("Content-Disposition", "attachment; filename=meme.png");
        res.setHeader("Content-Type", response.headers["content-type"] || "image/png");

        // Stream the image directly to the client
        response.data.pipe(res);

    } catch (error) {
        console.error("❌ Error processing download:", error.message);
        res.status(500).send("❌ Error downloading meme");
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


