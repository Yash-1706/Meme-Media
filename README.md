# Meme-Media

A modern web application for sharing and viewing programming memes. Built with vanilla JavaScript for the frontend and Node.js/Express for the backend.

## Project Structure

```
Meme-Media/
├── backend/
│   ├── node_modules/
│   ├── memes.json
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── index.html
    ├── script.js
    ├── style.css
    ├── upload.css
    ├── upload.html
    ├── upload.js
    └── package.json
```

## Features

- View programming memes from Reddit's [r/ProgrammerHumor](https://www.reddit.com/r/ProgrammerHumor)
- Upload and share your own memes
- Like and save your favorite memes
- Share memes with friends
- Download memes
- Responsive design for all devices

## Hosted Version

The website is live and hosted on Render: **[Meme Media](https://meme-media-2.onrender.com/)**

_Backend is hosted on Render, while the frontend needs to be opened manually by launching `index.html` in a browser._

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts (Inter)

### Backend

- Node.js
- Express.js
- Multer (file uploads)
- CORS

## Data Source

Memes are fetched from Reddit using the [r/ProgrammerHumor JSON API](https://www.reddit.com/r/ProgrammerHumor.json).

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/Yash-1706/Meme-Media
   cd Meme-Media
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Start the backend server:

   ```bash
   node server.js
   ```

4. Open the frontend:

   - Open `frontend/index.html` in your web browser
   - Or use a local development server like Live Server for better performance

## API Endpoints

- `GET /api/memes` - Fetch memes with pagination
- `POST /api/upload` - Upload a new meme
- `POST /api/like/:memeId` - Like/unlike a meme (toggle system)
- `GET /proxy` - Proxy for downloading memes (CORS bypass)

## Feature Details

### Meme Feed (`index.html`, `script.js`)

- Infinite scroll for loading memes
- Like/unlike functionality with local storage
- Share functionality (Web Share API with clipboard fallback)
- Download functionality with CORS proxy support

### Upload System (`upload.html`, `upload.js`)

- Drag and drop file upload
- File validation (JPEG, PNG, GIF)
- 5MB size limit
- Image preview
- Upload progress feedback

## Development

The project is structured into two main parts:

1. **Backend** (`backend/`):
   - Express server handling API requests
   - File storage and management
   - CORS and proxy functionality

2. **Frontend** (`frontend/`):
   - Main feed page (`index.html`)
   - Upload page (`upload.html`)
   - Shared styles (`style.css`)
   - Upload-specific styles (`upload.css`)
   - JavaScript functionality (`script.js`, `upload.js`)

## Acknowledgments

- Reddit's [r/ProgrammerHumor](https://www.reddit.com/r/ProgrammerHumor) community
- Inter font family by Rasmus Andersson

