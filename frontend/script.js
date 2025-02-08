let memeContainer = document.getElementById("meme-container");
let loadMoreButton = document.getElementById("load-more-btn");
let memeLikes = {};  // Holds likes for each meme
const API_URL = "http://localhost:3000";  // Backend URL for likes
let after = null; // Stores the last post ID for pagination

document.addEventListener("DOMContentLoaded", () => {
    const loadMoreBtn = document.getElementById("load-more-btn");
    loadMoreBtn.replaceWith(loadMoreBtn.cloneNode(true)); // Clears previous listeners
    document.getElementById("load-more-btn").addEventListener("click", loadMoreMemes);
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

let fetchingMemes = false // prevents duplicate fetches
let fetchedMemes = new Set()

// Fetch memes from Reddit 
async function fetchMemes() {
    if (fetchingMemes) return; // Stop if already fetching
    fetchingMemes = true;

    try {
        const apiUrl = after 
            ? `https://www.reddit.com/r/ProgrammerHumor.json?after=${after}`
            : "https://www.reddit.com/r/ProgrammerHumor.json";

        const response = await fetch(apiUrl);
        const data = await response.json();

        const newMemes = data.data.children
            .map(post => post.data.url)
            .filter(url => url.endsWith(".jpg") || url.endsWith(".png"));

            after = data.data.after || null; // Store 'after' for pagination
            if (newMemes.length > 0) {
                displayMemes(newMemes); // Append new memes
            } else {
                console.warn("🚨 No new memes fetched!");
            }

        showLoadMoreButton();
    } catch (error) {
        console.error("❌ Error fetching memes:", error);
    } finally {
        fetchingMemes = false
    }
}


// Call fetchMemes() once when the page loads
fetchMemes();


//Download button
function createDownloadButton(memeUrl) {
    let downloadBtn = document.createElement("button");
    downloadBtn.innerText = "⬇️ Download";
    downloadBtn.classList.add("download-btn");

    // Prevents redirection and downloads the meme
    downloadBtn.addEventListener("click", (event) => downloadMeme(memeUrl, event));

    return downloadBtn;
}


//Like button creation
function createLikeButton(memeUrl) {
    let likeBtn = document.createElement("button");
    likeBtn.classList.add("like-btn");

    let likes = memeLikes[memeUrl] || 0; // Ensure likes are initialized to 0

    likeBtn.innerHTML = `❤️ <span id="likes-${memeUrl}">${likes}</span>`;

    likeBtn.addEventListener("click", function () {
        if (localStorage.getItem(`liked-${memeUrl}`)) {
            console.log("❌ Already liked!");
            alert("❌ Already Liked This Meme")
            return; // Prevent multiple likes
        }

        likes++;
        localStorage.setItem(`liked-${memeUrl}`, "true");
        memeLikes[memeUrl] = likes;

        // Update UI
        document.getElementById(`likes-${memeUrl}`).textContent = likes;

        // Save to backend
        fetch("http://localhost:3000/like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memeId: memeUrl, likes })
        }).catch(err => console.error("❌ Failed to update like count:", err));
    });

    return likeBtn;
}



//Share button
function createShareButton(memeUrl) {
    let shareBtn = document.createElement("button");
    shareBtn.innerText = "📤 Share";
    shareBtn.classList.add("share-btn");

    shareBtn.addEventListener("click", () => {
        if (navigator.share) {
            navigator.share({
                title: "Check out this meme!",
                url: memeUrl
            }).catch(err => console.error("❌ Error sharing:", err));
        } else {
            alert("📤 Sharing not supported on this device.");
        }
    });

    return shareBtn;
}

//Display memes
let memesList = new Set(); // Store unique memes
let memesPerPage = 25;
let currentIndex = 0;

async function displayMemes(memes) {
    const memeContainer = document.getElementById("meme-container");
    
    let newMemes = memes.filter(meme => !memesList.has(meme)); // Avoid duplicates
    if (newMemes.length === 0) return; // If no new memes, don't proceed

    newMemes.forEach(meme => memesList.add(meme)); // Add new memes to set

    try {
        const response = await fetch("http://localhost:3000/likes");
        const storedLikes = await response.json();
        memeLikes = storedLikes || {}; // Store likes globally
    } catch (err) {
        console.error("❌ Failed to fetch likes:", err);
        return;
    }

    newMemes.forEach(memeUrl => {
        let imgWrapper = document.createElement("div");
        imgWrapper.classList.add("meme-wrapper");

        let img = document.createElement("img");
        img.src = memeUrl;
        img.alt = "Meme";
        img.classList.add("meme-item");

        // Create buttons
        let likeBtn = createLikeButton(memeUrl);
        let downloadBtn = createDownloadButton(memeUrl);
        let shareBtn = createShareButton(memeUrl);

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(likeBtn);
        imgWrapper.appendChild(downloadBtn);
        imgWrapper.appendChild(shareBtn);

        memeContainer.appendChild(imgWrapper);
    });

    console.log("✅ Memes with buttons added to DOM");
}




//Load more memes
function loadMoreMemes(){
    fetchingMemes = false
    fetchMemes()
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
// Function to handle like functionality (prevents multiple likes per user)
async function likeMeme(memeId, event) {
    const likeSpan = document.getElementById(`likes-${memeId}`);

    // Check if the meme was already liked by the user
    let likedMemes = JSON.parse(localStorage.getItem("likedMemes")) || {};
    if (likedMemes[memeId]) {
        alert("❌ You have already liked this meme!");
        return;
    }

    let currentLikes = parseInt(likeSpan.innerText) || 0;
    currentLikes++;

    likeSpan.innerText = currentLikes;
    
    // Save liked meme in localStorage
    likedMemes[memeId] = true;
    localStorage.setItem("likedMemes", JSON.stringify(likedMemes));

    try {
        await fetch("http://localhost:3000/like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memeId, likes: currentLikes })
        });
    } catch (error) {
        console.error("❌ Error updating like:", error);
    }
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
function downloadMeme(url, event) {
    event.preventDefault(); // Prevents redirection to Reddit

    // Redirect the request to your backend, which fetches the image
    const a = document.createElement("a");
    a.href = `http://localhost:3000/download?url=${encodeURIComponent(url)}`;
    a.download = "meme.jpg"; // Forces download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


// Show or hide load more button
function showLoadMoreButton() {
    let loadMoreBtn = document.getElementById("load-more-btn");
    
    if (!loadMoreBtn) {
        loadMoreBtn = document.createElement("button");
        loadMoreBtn.id = "load-more-btn";
        loadMoreBtn.innerText = "🔄 Load More Memes";
        loadMoreBtn.classList.add("load-more-btn");
        loadMoreBtn.addEventListener("click", () => fetchMemes(true));
        
        document.body.appendChild(loadMoreBtn); // Add button at the bottom
    }
    
    loadMoreBtn.style.display = after ? "block" : "none"; // Hide if no more memes
}

//load more button
document.getElementById("load-more-btn").addEventListener("click", function () {
    loadMoreMemes()
});

window.onload = fetchMemes
