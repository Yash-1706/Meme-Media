let memeContainer = document.getElementById("meme-container");
let memeLikes = {};  // Holds likes for each meme
const API_URL = "http://localhost:3000";  // Backend URL for likes

// Fetch memes and initialize likes (this is called once during page load)
document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM fully loaded. Fetching memes...");
    loadLikesFromLocalStorage();  // Load likes from localStorage first
    fetchMemes();
});

// Load likes from localStorage
function loadLikesFromLocalStorage() {
    const storedLikes = localStorage.getItem("memeLikes");
    if (storedLikes) {
        memeLikes = JSON.parse(storedLikes);
    }
}

// Fetch memes from Reddit API (called once during page load)
function fetchMemes() {
    let url = "https://www.reddit.com/r/ProgrammerHumor.json";
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // console.log("✅ Memes fetched successfully.");
            let memes = data.data.children.map(post => ({
                id: post.data.id,
                url: post.data.url,
                title: post.data.title
            }));
            // console.log("🖼 Processing memes:", memes);
            updateMemeList(memes);
        })
        .catch(error => console.error("❌ Error fetching memes:", error));
}

// Update the meme list in UI
function updateMemeList(memes) {
    memes.forEach(meme => {
        let memeCard = document.createElement("div");
        memeCard.classList.add("meme-card");
        memeCard.setAttribute("data-meme-id", meme.id);

        // Get like count for this meme (initialized to 0 if not set)
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

        // Attach event listener for the like button
        let likeButton = memeCard.querySelector(".like-btn");
        likeButton.addEventListener("click", (event) => likeMeme(meme.id, event));
    });
}

// Like a meme and update the backend (no re-fetching memes or likes)
function likeMeme(memeId, event) {
    event.preventDefault();
    let likeButton = event.target.closest(".like-btn");
    if (!likeButton) return;

    let likeCountSpan = likeButton.querySelector("span");
    if (!likeCountSpan) return;

    // Increase the like count
    let currentLikeCount = parseInt(likeCountSpan.innerText);
    let newLikeCount = currentLikeCount + 1;

    // Update the UI immediately for this meme
    likeCountSpan.innerText = newLikeCount;

    // Save the updated like count in memeLikes object and store in localStorage
    memeLikes[memeId] = newLikeCount;
    localStorage.setItem("memeLikes", JSON.stringify(memeLikes));

    // Send the updated like count to the backend
    fetch(`${API_URL}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeId, likes: newLikeCount })
    })
    .then(res => res.json())
    .then(data => {
        console.log("✅ Like count updated on backend:", data);
    })
    .catch(err => {
        console.error("❌ Error liking meme:", err);
        // If backend fails, revert UI to the previous like count
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
        console.log('⚠️ Sharing is not supported on this browser.');
    }
}

// Download the meme image
function downloadMeme(url) {
    fetch(`http://localhost:3000/download?url=${encodeURIComponent(url)}`)
        .then(response => response.blob()) // Convert response to a file
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "meme.png"; // Set default filename
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => console.error("❌ Error downloading meme:", error));
}

