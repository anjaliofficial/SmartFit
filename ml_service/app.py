# ml_service/app.py
import os
import time
import itertools
import cv2
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.cluster import KMeans
from werkzeug.utils import secure_filename
import mediapipe as mp
import traceback # <-- Added thiscom import

# ------------------- Environment Fix -------------------
os.environ["OPENBLAS_NUM_THREADS"] = "12"

# ------------------- Flask Setup -------------------
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ------------------- Image Quality Check -------------------
def check_image_quality(image_path, brightness_threshold=50, blur_threshold=100):
    img = cv2.imread(image_path)
    if img is None:
        return ["Cannot read image"]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    blur_value = cv2.Laplacian(gray, cv2.CV_64F).var()
    warnings = []
    if brightness < brightness_threshold:
        warnings.append("Image too dark")
    if blur_value < blur_threshold:
        warnings.append("Image too blurry")
    return warnings

# ------------------- Clothing Analysis -------------------
def get_dominant_colors(image_path, k=3):
    image = cv2.imread(image_path)
    if image is None:
        return []
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = image.reshape((-1, 3))
    kmeans = KMeans(n_clusters=k, n_init=10)
    kmeans.fit(image)
    colors = kmeans.cluster_centers_.astype(int)
    # Convert np.int64 to int for JSON serialization
    return [tuple(int(c) for c in color) for color in colors]

def detect_pattern(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return "Unknown"
    edges = cv2.Canny(image, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 100)
    return "Patterned" if lines is not None else "Solid"

def detect_style(filename):
    fname = filename.lower()
    if "tshirt" in fname or "tee" in fname or "top" in fname or "hoodie" in fname:
        return "Casual"
    elif "shirt" in fname or "blouse" in fname:
        return "Formal"
    elif "jacket" in fname or "coat" in fname or "blazer" in fname:
        return "Formal"
    elif "dress" in fname or "skirt" in fname:
        return "Party/Festive"
    else:
        return "Casual"

# ------------------- Mediapipe Skin Detection -------------------
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True)

def detect_skin_tone_mediapipe(face_image_path):
    img = cv2.imread(face_image_path)
    if img is None:
        return "Medium / Olive"
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = mp_face_mesh.process(img_rgb)
    if not results.multi_face_landmarks:
        return "Medium / Olive"
    h, w, _ = img.shape
    mask = np.zeros((h, w), dtype=np.uint8)
    for face_landmarks in results.multi_face_landmarks:
        pts = [[int(lm.x * w), int(lm.y * h)] for lm in face_landmarks.landmark]
        pts = np.array(pts, dtype=np.int32)
        if pts.size > 0:
            cv2.fillConvexPoly(mask, pts, 255)
    skin_pixels = img_rgb[mask == 255]
    if len(skin_pixels) == 0:
        return "Medium / Olive"
    avg_color = np.mean(skin_pixels, axis=0)
    brightness = np.mean(avg_color)
    r, g, b = avg_color
    if brightness > 210 and r > 200 and g > 180:
        return "Very Light / Porcelain"
    elif 180 < brightness <= 210:
        return "Light / Fair"
    elif 150 < brightness <= 180:
        return "Medium / Olive"
    elif 120 < brightness <= 150:
        return "Tan / Caramel / Light Brown"
    elif 90 < brightness <= 120:
        return "Brown / Warm Brown"
    elif 60 < brightness <= 90:
        return "Dark Brown / Deep"
    else:
        return "Very Dark / Ebony"

# ------------------- Occasion Multipliers -------------------
OCCASION_MULTIPLIERS = {
    'Casual Outing': {'Casual': 1.2, 'Formal': 0.8, 'Party/Festive': 0.9, 'Sporty': 1.1},
    'College': {'Casual': 1.2, 'Formal': 0.8, 'Party/Festive': 0.9, 'Sporty': 1.1},
    'Office': {'Formal': 1.2, 'Casual': 0.7, 'Party/Festive': 0.6, 'Sporty': 0.5},
    'Wedding/Poosa': {'Party/Festive': 1.3, 'Formal': 1.1, 'Casual': 0.6, 'Sporty': 0.5},
    'Party': {'Party/Festive': 1.2, 'Formal': 1.0, 'Casual': 0.9, 'Sporty': 0.8},
    'Bar': {'Party/Festive': 1.1, 'Formal': 1.0, 'Casual': 1.0, 'Sporty': 0.9},
    'Mountain': {'Sporty': 1.3, 'Casual': 1.2, 'Formal': 0.5, 'Party/Festive': 0.4},
    'Beach': {'Casual': 1.3, 'Sporty': 1.1, 'Formal': 0.5, 'Party/Festive': 1.0},
    'Temple': {'Formal': 1.2, 'Casual': 0.8, 'Party/Festive': 0.7, 'Sporty': 0.6},
    'Gym': {'Sporty': 1.3, 'Casual': 0.8, 'Formal': 0.5, 'Party/Festive': 0.5},
}

def get_accessory_suggestions(occasion):
    if occasion in ['Party', 'Wedding/Poosa', 'Bar']:
        return ["Jewelry", "Clutch", "Formal Shoes"]
    elif occasion in ['College', 'Casual Outing']:
        return ["Backpack", "Casual Shoes", "Simple Watch"]
    elif occasion in ['Office']:
        return ["Tie/Scarf", "Leather Bag", "Professional Shoes"]
    elif occasion in ['Temple']:
        return ["Minimal Accessories", "Traditional Footwear"]
    elif occasion in ['Mountain', 'Gym', 'Beach']:
        return ["Sporty Watch", "Sunglasses", "Hat"]
    return ["Belt", "Watch", "Handbag", "Shoes Matching Color"]

# ------------------- Outfit Scoring with Occasion -------------------
def score_outfit(items, skin_tone, occasion):
    base_score = 50
    styles = [item['style'] for item in items]
    patterns = {item['pattern'] for item in items}
    
    # Base Scoring Logic
    if len(set(styles)) == 1:
        base_score += 20
    else:
        base_score -= 10
    
    if "Patterned" in patterns and len(patterns) > 1:
        base_score -= 10
    else:
        base_score += 5
    
    # Skin Tone Color Matching
    if items:
        r, g, b = items[0]['dominant_colors'][0] if items[0]['dominant_colors'] else (128,128,128)
        total = r + g + b
        if skin_tone in ["Very Light / Porcelain", "Light / Fair"] and total > 400:
            base_score += 5
        elif skin_tone in ["Medium / Olive", "Tan / Caramel / Light Brown"] and 150 < total < 400:
            base_score += 5
        elif skin_tone in ["Brown / Warm Brown", "Dark Brown / Deep", "Very Dark / Ebony"] and total < 300:
            base_score += 5

    # Occasion Factor
    dominant_style = max(set(styles), key=styles.count) if styles else 'Casual'
    multiplier = OCCASION_MULTIPLIERS.get(occasion, {}).get(dominant_style, 1.0)
    
    final_score = base_score * multiplier
    
    final_score = max(0, min(100, final_score))
    
    feedback = f"Great for a {occasion}!" if final_score > 75 else f"Consider for a different occasion. May not be the best for a {occasion}."
    
    return int(final_score), feedback

# ------------------- Combine Outfit Preview -------------------
def combine_outfit_images(image_paths, grid_cols=3):
    imgs = []
    size = (200,200)
    for p in image_paths:
        img = cv2.imread(p)
        if img is None:
            img = np.zeros((size[1], size[0], 3), dtype=np.uint8)
        else:
            img = cv2.resize(img, size)
        imgs.append(img)
    rows = (len(imgs) + grid_cols - 1) // grid_cols
    grid_imgs = []
    for r in range(rows):
        row_imgs = imgs[r*grid_cols:(r+1)*grid_cols]
        while len(row_imgs) < grid_cols:
            row_imgs.append(np.zeros((size[1], size[0], 3), dtype=np.uint8))
        grid_imgs.append(cv2.hconcat(row_imgs))
    combined = cv2.vconcat(grid_imgs)
    combined_path = os.path.join(UPLOAD_FOLDER, "combined_preview.jpg")
    cv2.imwrite(combined_path, combined)
    return "combined_preview.jpg"

# ------------------- Suggested Color Palettes -------------------
def suggest_colors_for_skin(skin_tone):
    palettes = {
        "Very Light / Porcelain": ["Pastel Pink", "Lavender", "Soft Blue", "Mint Green"],
        "Light / Fair": ["Peach", "Coral", "Sky Blue", "Light Yellow"],
        "Medium / Olive": ["Teal", "Mustard", "Warm Beige", "Terracotta"],
        "Tan / Caramel / Light Brown": ["Olive Green", "Burnt Orange", "Maroon", "Cyan"],
        "Brown / Warm Brown": ["Royal Blue", "Emerald Green", "Bright Yellow", "Red"],
        "Dark Brown / Deep": ["Magenta", "Turquoise", "Gold", "Deep Purple"],
        "Very Dark / Ebony": ["White", "Bright Red", "Cobalt Blue", "Orange"]
    }
    return palettes.get(skin_tone, ["Gray", "Black", "White"])

# ------------------- API Endpoints -------------------
@app.route("/detect_skin", methods=["POST"])
def detect_skin():
    face_file = request.files.get("file_face")
    if face_file and allowed_file(face_file.filename):
        filename = secure_filename(face_file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        face_file.save(path)
        skin_tone = detect_skin_tone_mediapipe(path)
        return jsonify({"skin_tone": skin_tone})
    return jsonify({"skin_tone": "Medium / Olive"})

@app.route("/analyze", methods=["POST"])
def analyze():
    try: # <-- Main try block
        face_file = request.files.get("file_face")
        skin_tone = "Medium / Olive"
        if face_file and allowed_file(face_file.filename):
            face_name = f"{int(time.time()*1000)}_{secure_filename(face_file.filename)}"
            face_path = os.path.join(UPLOAD_FOLDER, face_name)
            face_file.save(face_path)
            skin_tone = detect_skin_tone_mediapipe(face_path)

        occasion = request.form.get("occasion", "Casual Outing")
        
        categories = ["shirt","pants","shoes","top","bottom","outerwear","dress","skirt"]
        clothing_data = {cat: [] for cat in categories}
        MAX_FILES_PER_CATEGORY = 3

        for cat in categories:
            files = request.files.getlist(f"file_{cat}")
            for f in files[:MAX_FILES_PER_CATEGORY]:
                if f and allowed_file(f.filename):
                    fname = f"{int(time.time()*1000)}_{secure_filename(f.filename)}"
                    fpath = os.path.join(UPLOAD_FOLDER, fname)
                    f.save(fpath)
                    clothing_data[cat].append({
                        "filename": fname,
                        "dominant_colors": get_dominant_colors(fpath),
                        "pattern": detect_pattern(fpath),
                        "style": detect_style(fname),
                        "warnings": check_image_quality(fpath)
                    })

        recommended_outfits = []
        combined_preview = ""
        available_categories = [cat for cat in categories if clothing_data[cat]]
        MAX_COMBOS = 20
        
        if len(available_categories) >= 2:
            product_lists = [clothing_data[cat] for cat in available_categories]
            combos = itertools.product(*product_lists)
            for idx, combo in enumerate(combos):
                if idx >= MAX_COMBOS:
                    break
                score, feedback = score_outfit(combo, skin_tone, occasion)
                if score > 60:
                    recommended_outfits.append({
                        "items": [c["filename"] for c in combo],
                        "score": int(score),
                        "feedback": feedback
                    })
            if recommended_outfits:
                recommended_outfits = sorted(recommended_outfits, key=lambda x: x["score"], reverse=True)
                top = recommended_outfits[0]
                image_paths = [os.path.join(UPLOAD_FOLDER, fname) for fname in top["items"]]
                combined_preview = combine_outfit_images(image_paths, grid_cols=3)

        if not recommended_outfits:
            recommended_outfits.append({
                "items": ["-"],
                "score": 0,
                "feedback": "No outfits with a score above 60. Try different items."
            })

        accessories = get_accessory_suggestions(occasion)
        recommended_colors = suggest_colors_for_skin(skin_tone)

        return jsonify({
            "skin_tone": skin_tone,
            "clothing_items": clothing_data,
            "recommended_outfits": recommended_outfits,
            "combined_preview": combined_preview,
            "recommended_colors": recommended_colors,
            "recommended_accessories": accessories
        })

    except Exception as e: # <-- Catch all exceptions
        print("Error in /analyze:", e)
        traceback.print_exc() # <-- Print full traceback to console
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500

# ------------------- Serve uploaded images -------------------
@app.route("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)