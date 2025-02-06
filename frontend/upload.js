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
    const memeUrl = document.getElementById("preview").src;
    let storedMemes = JSON.parse(localStorage.getItem("uploadedMemes")) || [];
    storedMemes.push(memeUrl);
    localStorage.setItem("uploadedMemes", JSON.stringify(storedMemes));

    alert("✅ Meme uploaded! It will now appear in the 'For You' section.");
});