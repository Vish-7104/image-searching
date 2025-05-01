from flask import Flask, render_template, request, jsonify
import requests
import base64
from io import BytesIO
from PIL import Image
import time

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def home():
    return render_template('imagegen.html')

@app.route('/generate', methods=['POST'])
def generate_images():
    prompt = request.json.get('prompt')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    
    num_images = 4

    # Call Hugging Face API for image generation
    api_key = ""
    generation_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    base64_images = []
    for _ in range(num_images):
        try:
            response = requests.post(generation_url, headers=headers, json={"inputs": prompt})
            
            if response.status_code == 503:
                # Model is loading, wait and retry
                time.sleep(10)
                response = requests.post(generation_url, headers=headers, json={"inputs": prompt})
                
            if response.status_code != 200:
                print(f"Error generating image: {response.status_code}")
                continue

            img = Image.open(BytesIO(response.content))
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
            base64_images.append(img_base64)
        except Exception as e:
            print(f"Image processing failed: {str(e)}")
            continue

    if not base64_images:
        return jsonify({"error": "Failed to generate any images"}), 500

    # Check if images are AI-generated using Hugging Face model
    results = check_real_fake(base64_images)

    # Return the base64 image data along with moderation results
    return jsonify({
        "image_urls": base64_images,
        "moderation_results": results
    })

def check_real_fake(base64_images):
    detection_url = "https://api-inference.huggingface.co/models/dima806/ai_vs_real_image_detection"
    headers = {"Authorization": "Bearer "}
    
    results = []
    for i, img_base64 in enumerate(base64_images):
        try:
            # Convert base64 to bytes
            image_bytes = base64.b64decode(img_base64)
            
           
            response = requests.post(
                detection_url,
                headers=headers,
                data=image_bytes,
                timeout=30
            )
            
            # Handle model loading
            if response.status_code == 503:
                estimated_time = response.json().get('estimated_time', 20)
                print(f"Model loading, waiting {estimated_time} seconds...")
                time.sleep(estimated_time + 5)
                response = requests.post(detection_url, headers=headers, data=image_bytes)

            response.raise_for_status()
            data = response.json()
            
            # Debug print to see actual response
            print(f"Detection response for image {i}:", data)
            
            # The dima806 model returns a list where each item has 'label' and 'score'
            # Label will be either 'ai' or 'real'
            ai_score = 0.5  # Default neutral score
            
            for item in data:
                if item['label'] == 'ai':
                    ai_score = item['score']
                    break  # We found our AI score
            
            # Since we generated these, they should be AI
            # If model says 'real', we'll invert the score
            if any(item['label'] == 'real' for item in data):
                ai_score = 1 - ai_score
                
            results.append({
                "index": i,
                "score": float(ai_score),
                "label": "AI-Generated" if ai_score > 0.5 else "Likely Real"
            })
            
        except Exception as e:
            print(f"Error checking image {i}: {str(e)}")
            results.append({
                "index": i,
                "score": 0.95,  # Assume AI since we generated it
                "label": "AI-Generated",
                "error": str(e)
            })
    return results

if __name__ == "__main__":
    app.run(debug=True)