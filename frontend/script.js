let after = '';
const memeContainer = document.getElementById('meme-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// Load liked memes from localStorage
let likedMemes = JSON.parse(localStorage.getItem('likedMemes')) || {};

async function fetchMemes() {
    try {
        const response = await fetch(`https://www.reddit.com/r/ProgrammerHumor.json?after=${after}`);
        const data = await response.json();
        after = data.data.after;
        return data.data.children;
    } catch (error) {
        console.error('Error fetching memes:', error);
        return [];
    }
}

function createMemeCard(meme) {
    const card = document.createElement('div');
    card.className = 'meme-card';
    const memeId = meme.data.id;
    const memeUrl = meme.data.url;
    const isLiked = likedMemes[memeId];

    card.innerHTML = `
        <img src="${memeUrl}" alt="Meme" class="meme-image" loading="lazy">
        <div class="meme-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${memeId}', this)">
                ${isLiked ? '❤️' : '🤍'} Like
            </button>
            <button class="action-btn" onclick="shareMeme('${memeUrl}')">
                📤 Share
            </button>
            <button class="action-btn" onclick="downloadMeme('${memeUrl}', '${meme.data.title}')">
                💾 Download
            </button>
        </div>
    `;
    return card;
}

async function loadMemes() {
    const memes = await fetchMemes();
    memes.forEach(meme => {
        if (meme.data.post_hint === 'image') {
            const card = createMemeCard(meme);
            memeContainer.appendChild(card);
        }
    });
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

async function downloadMeme(url, title = 'meme') {
    try {
        const proxyUrl = `https://meme-media-1.onrender.com/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error downloading meme:', error);
        alert('Failed to download meme. Try opening it in a new tab.');
    }
}


loadMoreBtn.addEventListener('click', loadMemes);

// Initial load
loadMemes();