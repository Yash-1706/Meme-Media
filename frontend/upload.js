const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const uploadForm = document.getElementById('upload-form');
const uploadPrompt = document.querySelector('.upload-prompt');
const uploadedMemesContainer = document.getElementById('uploaded-memes-container');

// Load liked memes and uploaded memes from localStorage
let likedMemes = JSON.parse(localStorage.getItem('likedMemes')) || {};
let uploadedMemes = JSON.parse(localStorage.getItem('uploadedMemes')) || [];

// Function to save uploaded memes to localStorage
function saveUploadedMemes() {
    localStorage.setItem('uploadedMemes', JSON.stringify(uploadedMemes));
}

// Function to create a meme card for display
function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    const memeId = meme.id;
    const isLiked = likedMemes[memeId];

    card.innerHTML = `
        <img src="${meme.url}" alt="Uploaded Meme" class="meme-image" loading="lazy">
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

// Function to display uploaded memes from localStorage
function loadUploadedMemes() {
    uploadedMemesContainer.innerHTML = '';
    uploadedMemes.forEach(meme => {
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

// Function to handle file selection and preview
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
        uploadPrompt.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Function to toggle like status
function toggleLike(memeId, button) {
    likedMemes[memeId] = !likedMemes[memeId];
    localStorage.setItem('likedMemes', JSON.stringify(likedMemes));
    button.classList.toggle('liked');
    button.innerHTML = likedMemes[memeId] ? '❤️ Like' : '🤍 Like';
}

// Function to share meme
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

// Function to download meme
async function downloadMeme(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `meme-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Handle upload form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const newMeme = {
            id: Date.now().toString(),
            url: e.target.result
        };
        uploadedMemes.push(newMeme);
        saveUploadedMemes();
        alert('Meme uploaded successfully!');

        // Reset form and update display
        preview.style.display = 'none';
        uploadPrompt.style.display = 'flex';
        uploadForm.reset();
        loadUploadedMemes();
    };
    reader.readAsDataURL(file);
});

// Initial load of uploaded memes
loadUploadedMemes();
