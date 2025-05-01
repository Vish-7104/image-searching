function convertToBase64(imageBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
}

function generateMultipleImages() {
  console.log("Generating multiple images...");
}

document.getElementById("submit-icon").addEventListener("click", handleGenerate);

async function handleGenerate() {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  generateMultipleImages(prompt, 4); 
  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();  // only happens if response was OK
    console.log("Images received:", data.images);

    if (data.image_urls) {
      const imageSection = document.querySelector(".image-section");
      imageSection.innerHTML = "";
      data.image_urls.forEach((imageBase64, index) => {
          const container = document.createElement("div");
          container.style.textAlign = "center";

          const img = document.createElement("img");
          img.src = `data:image/png;base64,${imageBase64}`;
          img.alt = "Generated Image";
          img.classList.add("generated-image");

          const is360Enabled = document.getElementById("toggle360").checked;
          if (is360Enabled) {
              img.classList.add("rotate-on-hover");
          }

          const downloadBtn = document.createElement("a");
          downloadBtn.href = `data:image/png;base64,${imageBase64}`;
          downloadBtn.download = "generated-image.png";
          downloadBtn.innerText = "Download";
          downloadBtn.classList.add("download-button");

          container.appendChild(img);
          container.appendChild(downloadBtn);
          imageSection.appendChild(container);
      });

      
const resultsContainer = document.getElementById("realFakeResults");
resultsContainer.innerHTML = data.moderation_results.map(result => {
    const scoreDisplay = result.score !== undefined ? 
        `(Score: ${result.score.toFixed(2)})` : 
        '(Score unavailable)';
    return `<div>Image ${result.index + 1}: ${result.label} ${scoreDisplay}</div>`;
}).join("");
    } else {
      alert('Error generating images');
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}
  
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

    // Image viewer logic
    const viewerModal = document.getElementById("imageViewerModal");
    const viewerImage = document.getElementById("viewerImage");
    const closeViewer = document.getElementById("closeViewer");

    let isDragging = false;
    let currentRotation = 0;
    let startX = 0;

    let imageBrightness = 1;
    let rotateDegree = 0;
    let imageResolution = 1;
    let filterEffect = 'none';

    document.querySelector(".image-section").addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") {
        viewerImage.src = e.target.src;
        viewerModal.style.display = "flex";
        currentRotation = 0;
        rotateDegree = 0;
        viewerImage.style.transform = `rotateY(0deg)`;
        viewerImage.classList.remove("rotate-on-hover");
      }
    });

    document.getElementById("brightness-slider").addEventListener("input", (e) => {
      imageBrightness = e.target.value;
      viewerImage.style.filter = `brightness(${imageBrightness}) ${filterEffect}`;
    });

    document.getElementById("rotate-left").addEventListener("click", () => {
      rotateDegree -= 90;
      viewerImage.style.transform = `rotate(${rotateDegree}deg)`;
    });

    document.getElementById("rotate-right").addEventListener("click", () => {
      rotateDegree += 90;
      viewerImage.style.transform = `rotate(${rotateDegree}deg)`;
    });

    document.getElementById("resolution-slider").addEventListener("input", (e) => {
      imageResolution = e.target.value;
      viewerImage.style.transform = `scale(${imageResolution}) rotate(${rotateDegree}deg)`;
    });

    document.getElementById("filter-select").addEventListener("change", (e) => {
      filterEffect = e.target.value;
      viewerImage.style.filter = `brightness(${imageBrightness}) ${filterEffect}`;
    });

    document.getElementById("save-changes").addEventListener("click", () => {
      const img = new Image();
      img.src = viewerImage.src;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `brightness(${imageBrightness}) ${filterEffect}`;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotateDegree * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        const finalImage = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.href = finalImage;
        downloadLink.download = "edited-image.png";
        downloadLink.click();
      };
    });

    closeViewer.addEventListener("click", () => {
      viewerModal.style.display = "none";
    });

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
        currentRotation += deltaX * 0.5;
        viewerImage.style.transform = `rotateY(${currentRotation}deg)`;
      }
    });

   

