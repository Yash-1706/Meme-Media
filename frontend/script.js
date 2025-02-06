let memeContainer = document.getElementById("meme-container");
let loadMoreButton = document.getElementById("load-more-btn");
let memeLikes = {};  // Holds likes for each meme
const API_URL = "http://localhost:3000";  // Backend URL for likes
let after = null; // Stores the last post ID for pagination

// Fetch memes and initialize likes (called once during page load)
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM fully loaded. Fetching memes...");
    loadLikesFromLocalStorage();  // Load likes from localStorage first
    fetchMemes();
});


if (loadMoreButton) {
    loadMoreButton.addEventListener("click", fetchMemes);
} else {
    console.warn("⚠️ Load More button not found in the DOM.");
}

// Load likes from localStorage
function loadLikesFromLocalStorage() {
    const storedLikes = localStorage.getItem("memeLikes");
    memeLikes = storedLikes ? JSON.parse(storedLikes) : {};
}

// Fetch memes from Reddit API with pagination
function fetchMemes() {
    let url = "https://www.reddit.com/r/ProgrammerHumor.json";
    if (after) {
        url += `?after=${after}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            let memes = data.data.children.map(post => ({
                id: post.data.id,
                url: post.data.url,
                title: post.data.title
            }));
            after = data.data.after; // Store next page ID for pagination
            updateMemeList(memes);
            toggleLoadMoreButton(true);
        })
        .catch(error => {
            console.error("❌ Error fetching memes:", error);
            toggleLoadMoreButton(false);
        });
}

// Update the meme list in UI
function updateMemeList(memes) {
    memes.forEach(meme => {
        let memeCard = document.createElement("div");
        memeCard.classList.add("meme-card");
        memeCard.setAttribute("data-meme-id", meme.id);

        let likeCount = memeLikes[meme.id] || 0;

        memeCard.innerHTML = `
            <img src="${meme.url}" alt="${meme.title}">
            <div class="actions">
                <button class="like-btn" data-meme-id="${meme.id}" type="button">
                    👍 <span>${likeCount}</span> Likes
                </button>
                <button onclick="downloadMeme('${meme.url}')">⬇️ Download</button>
                <button onclick="shareMeme('${meme.url}')">📤 Share</button>
            </div>
        `;

        memeContainer.appendChild(memeCard);

        let likeButton = memeCard.querySelector(".like-btn");
        likeButton.addEventListener("click", (event) => likeMeme(meme.id, event));
    });
}

// Like a meme
function likeMeme(memeId, event) {
    event.preventDefault();
    let likeButton = event.target.closest(".like-btn");
    if (!likeButton) return;

    let likeCountSpan = likeButton.querySelector("span");
    if (!likeCountSpan) return;

    let currentLikeCount = parseInt(likeCountSpan.innerText);
    let newLikeCount = currentLikeCount + 1;

    likeCountSpan.innerText = newLikeCount;

    memeLikes[memeId] = newLikeCount;
    localStorage.setItem("memeLikes", JSON.stringify(memeLikes));

    fetch(`${API_URL}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeId, likes: newLikeCount })
    })
    .then(res => res.json())
    .then(data => console.log("✅ Like count updated on backend:", data))
    .catch(err => {
        console.error("❌ Error liking meme:", err);
        likeCountSpan.innerText = currentLikeCount;
    });
}

// Share the meme
function shareMeme(url) {
    if (navigator.share) {
        navigator.share({ title: 'Meme Media', url: url })
        .then(() => console.log('✅ Meme shared successfully!'))
        .catch(error => console.log('❌ Error sharing meme:', error));
    } else {
        alert('⚠️ Sharing is not supported on this browser.');
    }
}

// Download the meme image
function downloadMeme(url) {
    fetch(`http://localhost:3000/download?url=${encodeURIComponent(url)}`)
        .then(response => response.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "meme.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => console.error("❌ Error downloading meme:", error));
}

// Load more memes when button is clicked
loadMoreButton.addEventListener("click", fetchMemes);

// Show or hide load more button
function toggleLoadMoreButton(visible) {
    const button = document.getElementById("load-more-btn"); // Updated ID
    if (button) {
        button.style.display = visible ? "block" : "none";
    } else {
        console.warn("⚠️ Attempted to toggle a missing Load More button.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM fully loaded. Fetching memes...");
    loadUploadedMemes(); // Load uploaded memes
    fetchMemes();
});

// Function to load and display uploaded memes
function loadUploadedMemes() {
    const storedMemes = JSON.parse(localStorage.getItem("uploadedMemes")) || [];
    const memeContainer = document.getElementById("meme-container");

    storedMemes.forEach(memeUrl => {
        let memeCard = document.createElement("div");
        memeCard.classList.add("meme-card");

        memeCard.innerHTML = `
            <img src="${memeUrl}" alt="Uploaded Meme">
            <div class="actions">
                <button class="like-btn">👍 <span>0</span> Likes</button>
                <button onclick="downloadMeme('${memeUrl}')">⬇️ Download</button>
                <button onclick="shareMeme('${memeUrl}')">📤 Share</button>
            </div>
        `;

        memeContainer.prepend(memeCard); // Add at the top
    });
}
