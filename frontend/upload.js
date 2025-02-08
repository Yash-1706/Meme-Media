document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");
    const uploadBtn = document.getElementById("uploadBtn");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            uploadBtn.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("uploadBtn").addEventListener("click", function() {
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const uploadBtn = document.getElementById("uploadBtn");
    
    const memeUrl = preview.src;
    let storedMemes = JSON.parse(localStorage.getItem("uploadedMemes")) || [];
    storedMemes.push(memeUrl);
    localStorage.setItem("uploadedMemes", JSON.stringify(storedMemes));

    alert("✅ Meme uploaded! It will now appear in the 'Uploaded Memes' section.");

    // Reset input section
    fileInput.value = ""; // Clears the file input
    preview.src = "";
    preview.style.display = "none";
    uploadBtn.style.display = "none";

    // Display uploaded memes immediately
    loadUploadedMemes();
});


// Function to load and display uploaded memes only on upload.html
function loadUploadedMemes() {
    const storedMemes = JSON.parse(localStorage.getItem("uploadedMemes")) || [];
    const uploadedMemeContainer = document.getElementById("uploaded-memes-container");

    uploadedMemeContainer.innerHTML = ""; // Clear existing memes

    storedMemes.forEach(memeUrl => {
        let img = document.createElement("img");
        img.src = memeUrl;
        img.alt = "Uploaded Meme";
        img.classList.add("uploaded-meme");

        uploadedMemeContainer.appendChild(img);
    });
}

// Load memes when `upload.html` loads
window.onload = loadUploadedMemes;
