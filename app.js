document.getElementById("submit-icon").addEventListener("click", handleGenerate);

async function handleGenerate() {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  generateMultipleImages(prompt, 4); // generate 4 images
}

async function generateMultipleImages(promptText, count) {
  const apiKey = ""; 
  const apiUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
  const imageSection = document.querySelector(".image-section");
  imageSection.innerHTML = "<p style='color:white;'>Generating images...</p>";
  imageSection.classList.add("grid-layout");

  const fetchImage = async () => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: promptText
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Error:", err);
      return null;
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  try {
    const imagePromises = Array.from({ length: count }, fetchImage);
    const images = await Promise.all(imagePromises);

    imageSection.innerHTML = ""; // Clear loading text

    images.forEach(imgURL => {
        if (imgURL) {
          const container = document.createElement("div");
          container.style.textAlign = "center";
      
          const img = document.createElement("img");
          img.src = imgURL;
          img.alt = "Generated Image";
          img.classList.add("generated-image");
      
          const is360Enabled = document.getElementById("toggle360").checked;
          if (is360Enabled) {
            img.classList.add("rotate-on-hover");
          }
      
          const downloadBtn = document.createElement("a");
          downloadBtn.href = imgURL;
          downloadBtn.download = "generated-image.png";
          downloadBtn.innerText = "Download";
          downloadBtn.classList.add("download-button");
      
          container.appendChild(img);
          container.appendChild(downloadBtn);
          imageSection.appendChild(container);
        }
      });
      
      
      // Auth popup logic
const authIcon = document.getElementById("authIcon");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");

authIcon.addEventListener("click", () => {
  authModal.style.display = "flex";
});

closeAuth.addEventListener("click", () => {
  authModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.style.display = "none";
  }
});

document.getElementById("authSubmit").addEventListener("click", () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  alert(`Logging in with\nUsername: ${user}\nPassword: ${pass}`);
  authModal.style.display = "none";
});

const viewerModal = document.getElementById("imageViewerModal");
const viewerImage = document.getElementById("viewerImage");
const closeViewer = document.getElementById("closeViewer");

let isDragging = false;
let currentRotation = 0;
let startX = 0;

// Open image in viewer
document.querySelector(".image-section").addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      viewerImage.src = e.target.src;
      viewerModal.style.display = "flex";
      currentRotation = 0;
      viewerImage.style.transform = `rotateY(0deg)`;
      viewerImage.classList.remove("rotate-on-hover"); // Remove animation
    }
  });
  
  // Image editing functions (rotate, resolution, filters)
let imageBrightness = 1;
let rotateDegree = 0;
let imageResolution = 1;
let filterEffect = 'none';

document.getElementById("brightness-slider").addEventListener("input", (e) => {
    imageBrightness = e.target.value;
    viewerImage.style.filter = `brightness(${imageBrightness}) ${filterEffect}`;
  });

// Rotate the image
document.getElementById("rotate-left").addEventListener("click", () => {
  rotateDegree -= 90;
  viewerImage.style.transform = `rotate(${rotateDegree}deg)`;
});

document.getElementById("rotate-right").addEventListener("click", () => {
  rotateDegree += 90;
  viewerImage.style.transform = `rotate(${rotateDegree}deg)`;
});

// Change image resolution
document.getElementById("resolution-slider").addEventListener("input", (e) => {
  imageResolution = e.target.value;
  viewerImage.style.transform = `scale(${imageResolution})`;
});


// Apply filters
document.getElementById("filter-select").addEventListener("change", (e) => {
  filterEffect = e.target.value;
  viewerImage.style.filter = filterEffect;
});

  // Save the edited image (after applying all transformations)
  document.getElementById("save-changes").addEventListener("click", () => {
    // Ensure the image has loaded before manipulating
    const img = new Image();
    img.src = viewerImage.src; // Use the enlarged image's source

    img.onload = () => {
        // Set the canvas size to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply the transformations (filter, rotation, etc.)
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas before drawing
        ctx.filter = `brightness(${imageBrightness}) ${filterEffect}`;  // Apply the filter

        // Apply the transformations like rotation
        ctx.save(); // Save the canvas state before transformation
        ctx.translate(canvas.width / 2, canvas.height / 2);  // Move to the center
        ctx.rotate((imageRotation * Math.PI) / 180);  // Rotate (convert degrees to radians)
        ctx.translate(-canvas.width / 2, -canvas.height / 2);  // Move back to original position

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Create a link to download the edited image
        const finalImage = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.href = finalImage;
        downloadLink.download = "edited-image.png"; // Specify file name
        downloadLink.click();  // Trigger download
    };
});

// Close viewer
closeViewer.addEventListener("click", () => {
  viewerModal.style.display = "none";
});

// Drag logic
viewerImage.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const deltaX = e.clientX - startX;
    startX = e.clientX;
    currentRotation += deltaX * 0.5; // rotation speed
    viewerImage.style.transform = `rotateY(${currentRotation}deg)`;
  }
});



  } catch (err) {
    console.error("Error in generation:", err);
    imageSection.innerHTML = "<p style='color:red;'>Failed to generate images.</p>";
  }
}