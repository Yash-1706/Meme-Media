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

//route to fetch and download images 
app.get('/download', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
        console.error("❌ No Image URL provided.");
        return res.status(400).send("❌ Image URL is required");
    }

    try {
        console.log(`🔗 Fetching image from URL: ${imageUrl}`);
        
        // Use built-in fetch
        const response = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0", 
                "Referer": "https://www.reddit.com/", 
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch image. Status: ${response.status}`);
            throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        console.log(`🖼️ Image content type: ${contentType}`);
        
        const imageBuffer = await response.arrayBuffer(); // <-- Fix here (use arrayBuffer)
        console.log(`📦 Image size: ${imageBuffer.byteLength} bytes`);

        if (imageBuffer.byteLength < 100) {
            console.error("❌ Image is too small (possibly invalid)");
            return res.status(500).send("❌ Error downloading meme");
        }

        res.setHeader("Content-Disposition", "attachment; filename=meme.png");
        res.setHeader("Content-Type", contentType || "image/png");
        res.send(Buffer.from(imageBuffer)); // <-- Convert arrayBuffer to Buffer

    } catch (error) {
        console.error("❌ Error processing download:", error);
        res.status(500).send("❌ Error downloading meme");
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
