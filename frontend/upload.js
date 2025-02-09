const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const uploadForm = document.getElementById('upload-form');
const uploadPrompt = document.querySelector('.upload-prompt');
const uploadedMemesContainer = document.getElementById('uploaded-memes-container');

// Load liked memes from localStorage
let likedMemes = JSON.parse(localStorage.getItem('likedMemes')) || {};

// Fetch and display uploaded memes
async function fetchUploadedMemes() {
    try {
        const response = await fetch('http://localhost:3000/api/memes'); // ✅ Fixed URL
        if (!response.ok) throw new Error('Failed to fetch memes');
        const data = await response.json();
        return data.memes;
    } catch (error) {
        console.error('Error fetching uploaded memes:', error);
        return [];
    }
}

function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    const memeId = meme.id;
    const isLiked = likedMemes[memeId];

    card.innerHTML = `
        <img src="http://localhost:3000${meme.url}" alt="Uploaded Meme" class="meme-image" loading="lazy">
        <div class="meme-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${memeId}', this)">
                ${isLiked ? '❤️' : '🤍'} Like
            </button>
            <button class="action-btn" onclick="shareMeme('${meme.url}')">
                📤 Share
            </button>
            <button class="action-btn" onclick="downloadMeme('${meme.url}')">
                💾 Download
            </button>
        </div>
    `;
    return card;
}

async function loadUploadedMemes() {
    const memes = await fetchUploadedMemes();
    uploadedMemesContainer.innerHTML = '';
    memes.forEach(meme => {
        const card = createMemeCard(meme);
        uploadedMemesContainer.appendChild(card);
    });
}

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadPrompt.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function toggleLike(memeId, button) {
    likedMemes[memeId] = !likedMemes[memeId];
    localStorage.setItem('likedMemes', JSON.stringify(likedMemes));
    button.classList.toggle('liked');
    button.innerHTML = likedMemes[memeId] ? '❤️ Like' : '🤍 Like';
}

async function shareMeme(url) {
    try {
        await navigator.share({
            title: 'Check out this meme!',
            url: url
        });
    } catch (error) {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
}

async function downloadMeme(url) {
    try {
        const proxyUrl = `http://localhost:3000/proxy?url=${encodeURIComponent(url)}`; // ✅ Use backend proxy to bypass CORS
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `meme-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error downloading meme:', error);
        alert('Failed to download meme. Please try again.');
    }
}

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first!');
        return;
    }

    const formData = new FormData();
    formData.append('meme', file);

    try {
        const response = await fetch('http://localhost:3000/api/upload', { 
            method: 'POST',
            body: formData
        });
        console.log(response)


        if (response.ok) {
            alert('Meme uploaded successfully!');
            preview.style.display = 'none';
            uploadPrompt.style.display = 'flex';
            uploadForm.reset();
            await loadUploadedMemes();
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Error uploading meme:', error);
        alert('Failed to upload meme. Please try again.');
    }
});

// Initial load of uploaded memes
loadUploadedMemes();
