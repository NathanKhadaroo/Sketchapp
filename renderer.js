// Wait for the DOM to be fully loaded before attaching event handlers and performing actions
document.addEventListener('DOMContentLoaded', function () {
    loadPrompts();
});


document.addEventListener('DOMContentLoaded', () => {
    setupGallery();  // Initialize the gallery when the document is ready
});


document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById("myModal");
    var imgs = document.querySelectorAll('.gallery-image');
    var modalImg = document.getElementById("img01");
    var captionText = document.getElementById("caption");
    var span = document.getElementsByClassName("close")[0];

    imgs.forEach(img => {
        img.onclick = function(){
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
        }
    });

    span.onclick = function() {
        modal.style.display = "none";
    }
});

let currentImageFile = null;

document.getElementById('uploadButton').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        document.getElementById('gallery').appendChild(img);

        // Enable save button and attach file data to it
        document.getElementById('saveButton').disabled = false;
        document.getElementById('saveButton').dataset.imageData = e.target.result;
        currentImageFile = file; // Store the file reference for later use
    };

    reader.readAsDataURL(file); // Read the file as a Data URL
});


document.getElementById('saveButton').addEventListener('click', async function() {
    const imageData = this.dataset.imageData;
    const fileName = currentImageFile ? currentImageFile.name : undefined;
    const timeTaken = document.getElementById('timeTakenInput').value;
    const materialsUsed = document.getElementById('materialsUsedInput').value;
    const promptOfTheDay = document.getElementById('promptOfTheDayInput').value;

    if (imageData && fileName) {
        const result = await window.api.saveImage(imageData, fileName, timeTaken, materialsUsed, promptOfTheDay);
        console.log(result.message);
        if (result.status === 'success') {
            setupGallery(); // Refresh the gallery after successful upload
        }
        document.getElementById('saveButton').disabled = true;
        currentImageFile = null;
    } else {
        console.error('File name or image data is missing');
    }
});

// Load and display today's prompt
async function loadPrompts() {
    const prompts = await window.api.loadPrompts();
    const today = new Date().getDay(); // getDay gives us the day of the week (0-6)
    if (prompts.length > 0) {
        document.getElementById('promptDisplay').innerText = prompts[today % prompts.length]; // Display today's prompt
        document.getElementById('promptOfTheDayInput').value = prompts[today % prompts.length];
    } else {
        document.getElementById('promptDisplay').innerText = "No prompt available"; // Fallback text
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadPrompts();
    openTab(null, 'Upload');
});



// Load and display the gallery with metadata


async function setupGallery() {
    const galleryData = await window.api.loadGallery(); // API call to fetch gallery data
    const galleryElement = document.getElementById('gallery');
    galleryElement.innerHTML = ''; // Clear existing content

    galleryData.forEach(item => {
        const img = document.createElement('img');
        img.src = item.filepath;
        img.alt = 'Uploaded Artwork';
        img.classList.add('gallery-image');
        img.style.cursor = 'pointer';

        const info = document.createElement('div');
        info.innerHTML = `<p>Date: ${item.date}</p>
                          <p>Prompt: ${item.prompt}</p>
                          <p>Time Taken: ${item.timeTaken}</p>
                          <p>Materials: ${item.materials}</p>`;
        const imgContainer = document.createElement('div');
        imgContainer.appendChild(img);
        imgContainer.appendChild(info);
        galleryElement.appendChild(imgContainer);

        // Click listener for toggling fullscreen
        img.addEventListener('click', () => toggleFullscreen(img));
    });
}


function toggleFullscreen(img) {
    if (!document.fullscreenElement) {
        if (img.requestFullscreen) {
            img.requestFullscreen();
        } else if (img.mozRequestFullScreen) { // Firefox
            img.mozRequestFullScreen();
        } else if (img.webkitRequestFullscreen) { // Chrome, Safari, and Opera
            img.webkitRequestFullscreen();
        } else if (img.msRequestFullscreen) { // IE/Edge
            img.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }
}
