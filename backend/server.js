import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import cors from 'cors';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json()); // Middleware for JSON requests

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
});

// Load JSON data safely
async function loadJsonData(filePath, defaultValue) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return defaultValue;
    }
}

// Initialize data
let memes = await loadJsonData(path.join(__dirname, 'memes.json'), []);
let likes = await loadJsonData(path.join(__dirname, 'likes.json'), {});

// API: Upload a new meme
app.post('/api/upload', upload.single('meme'), async (req, res) => {
    try {
        const meme = {
            id: Date.now().toString(),
            url: `/uploads/${req.file.filename}`,
            timestamp: new Date().toISOString()
        };

        memes.push(meme);
        await fs.writeFile(path.join(__dirname, 'memes.json'), JSON.stringify(memes, null, 2));

        res.json({ success: true, meme });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});


// API: Like a meme
app.post('/api/like/:memeId', async (req, res) => {
    const { memeId } = req.params;
    
    likes[memeId] = (likes[memeId] || 0) + 1;
    
    try {
        await fs.writeFile(path.join(__dirname, 'likes.json'), JSON.stringify(likes, null, 2));
        res.json({ success: true, likes: likes[memeId] });
    } catch (error) {
        console.error('Error saving likes:', error);
        res.status(500).json({ success: false, error: 'Failed to save like' });
    }
});

// API: Get memes with pagination
app.get('/api/memes', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    res.json({
        memes: memes.slice(start, end),
        hasMore: end < memes.length
    });
});

// API: Proxy route to download memes (bypassing CORS)
app.get('/proxy', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send('Image URL is required');

    try {
        console.log('Fetching image:', imageUrl);
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' } // Bypass Reddit bot protection
        });

        // Get content type
        const contentType = response.headers['content-type'];
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'attachment; filename="meme.jpg"');

        res.send(response.data);
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).send('Failed to fetch image');
    }
});


// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
