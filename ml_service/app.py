import os
import time
import itertools
import json
import cv2
import numpy as np
import traceback
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin # 👈 Added cross_origin import for safety
from sklearn.cluster import KMeans
from werkzeug.utils import secure_filename
from PIL import Image
import shutil
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Optional: background removal
try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    logging.warning("rembg library not available. Background removal disabled.")

# Optional: mediapipe for skin tone
try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False
    logging.warning("mediapipe library not available. Skin tone detection will use fallback.")

# ------------------- Config -------------------
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_FILES_PER_CATEGORY = 5
MAX_COMBOS = 200  # cap combos generation
COMBINED_PREVIEW_MAX_HEIGHT = 300

# Flask setup
app = Flask(__name__)
# 🌟 CORS FIX: Explicitly allow all origins in development to fix 403 errors
CORS(app, resources={r"/*": {"origins": "*"}}) 

# ------------------- Helpers -------------------

# ... (All helper functions: allowed_file, check_image_quality, get_dominant_colors, 
# detect_pattern, detect_style_from_filename, simple_color_name, remove_bg, 
# detect_skin_tone_mediapipe, combine_clothing_images, suggest_colors_for_skin, 
# OCCASION_MULTIPLIERS, score_outfit are assumed correct and remain unchanged) ...

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def check_image_quality(image_path, brightness_threshold=50, blur_threshold=100):
    img = cv2.imread(image_path)
    if img is None:
        return ["Cannot read image"]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))
    blur_value = float(np.var(cv2.Laplacian(gray, cv2.CV_64F)))
    warnings = []
    if brightness < brightness_threshold:
        warnings.append("Image too dark")
    if blur_value < blur_threshold:
        warnings.append("Image too blurry")
    return warnings

def get_dominant_colors(image_path, k=3):
    image = cv2.imread(image_path)
    if image is None:
        return []
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    h, w, _ = image.shape
    # sample to ~200x200 for speed
    sample_size = 200 * 200
    pixels = image.reshape(-1, 3)
    if pixels.shape[0] > sample_size:
        idx = np.linspace(0, pixels.shape[0]-1, sample_size).astype(int)
        sample = pixels[idx]
    else:
        sample = pixels
    n_clusters = min(k, len(sample))
    if n_clusters <= 0:
        return []
    kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=0)
    kmeans.fit(sample)
    colors = kmeans.cluster_centers_.astype(int)
    labels, counts = np.unique(kmeans.labels_, return_counts=True)
    order = np.argsort(-counts)
    ordered_colors = [tuple(int(c) for c in colors[idx]) for idx in order]
    return ordered_colors

def detect_pattern(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return "Unknown"
    edges = cv2.Canny(image, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 120)
    return "Patterned" if lines is not None else "Solid"

def detect_style_from_filename(filename):
    fname = filename.lower()
    if any(tok in fname for tok in ["tshirt","tee","hoodie","sweatshirt","top"]):
        return "Casual"
    if any(tok in fname for tok in ["shirt","blouse","jacket","coat","blazer"]):
        return "Formal"
    if any(tok in fname for tok in ["dress","skirt"]):
        return "Party/Festive"
    return "Casual"

def simple_color_name(rgb):
    r, g, b = rgb
    if r > 200 and g < 100 and b < 100: return "Red"
    if r > 200 and g > 200 and b < 120: return "Yellow"
    if b > 200 and r < 100 and g < 100: return "Blue"
    if g > 200 and r < 120 and b < 120: return "Green"
    if r > 200 and g > 200 and b > 200: return "White"
    if r < 50 and g < 50 and b < 50: return "Black"
    return "#{:02x}{:02x}{:02x}".format(int(r), int(g), int(b))

def remove_bg(image_path):
    try:
        base, ext = os.path.splitext(image_path)
        out_path = f"{base}_nobg{ext}"
        if REMBG_AVAILABLE:
            with open(image_path, "rb") as i:
                input_bytes = i.read()
            output_bytes = rembg_remove(input_bytes)
            with open(out_path, "wb") as o:
                o.write(output_bytes)
            return out_path
        else:
            # fallback: copy and return same image (no bg removal)
            shutil.copy(image_path, out_path)
            return out_path
    except Exception as e:
        logging.error(f"remove_bg error: {e}")
        return image_path

# Mediapipe face detection
mp_face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True) if MP_AVAILABLE else None

def detect_skin_tone_mediapipe(face_image_path):
    if not MP_AVAILABLE or mp_face_mesh is None:
        return "Medium / Olive"
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
        # A proper implementation would use a subset of landmarks for skin area (e.g., cheeks/forehead)
        # But for this simple mask, we use the whole detected face mesh area
        pts = [[int(lm.x * w), int(lm.y * h)] for lm in face_landmarks.landmark]
        pts = np.array(pts, dtype=np.int32)
        if pts.size > 0:
            cv2.fillConvexPoly(mask, pts, 255)
    skin_pixels = img_rgb[mask == 255]
    if len(skin_pixels) == 0:
        return "Medium / Olive"
    
    # Calculate average color in the masked skin area
    avg_color = np.mean(skin_pixels, axis=0)
    brightness = float(np.mean(avg_color))
    
    # Simple classification based on brightness
    if brightness > 210: return "Very Light / Porcelain"
    elif 180 < brightness <= 210: return "Light / Fair"
    elif 150 < brightness <= 180: return "Medium / Olive"
    elif 120 < brightness <= 150: return "Tan / Caramel / Light Brown"
    elif 90 < brightness <= 120: return "Brown / Warm Brown"
    elif 60 < brightness <= 90: return "Dark Brown / Deep"
    else: return "Very Dark / Ebony"

def combine_clothing_images(image_paths):
    if not image_paths:
        return None
    images = []
    for p in image_paths:
        try:
            # Check if the path is the no-background version and use it
            if os.path.exists(p):
                 images.append(Image.open(p).convert("RGBA"))
        except Exception as e:
            logging.error(f"Failed to open image {p} for combination: {e}")
            continue
    if not images:
        return None
        
    # Resize images proportionally
    max_height = COMBINED_PREVIEW_MAX_HEIGHT
    resized_images = []
    for img in images:
        h_percent = max_height / float(img.size[1])
        wsize = int(img.size[0] * h_percent)
        # Use Image.Resampling.LANCZOS for newer PIL versions
        resized_images.append(img.resize((wsize, max_height), Image.Resampling.LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS))
    
    total_width = sum(img.size[0] for img in resized_images)
    combined = Image.new("RGBA", (total_width, max_height), (255,255,255,0))
    x_offset = 0
    for img in resized_images:
        combined.paste(img, (x_offset,0), mask=img)
        x_offset += img.size[0]
        
    combined_filename = f"combined_{int(time.time())}.png"
    combined_path = os.path.join(UPLOAD_FOLDER, combined_filename)
    combined.save(combined_path)
    return combined_filename

def suggest_colors_for_skin(skin_tone):
    palettes = {
        "Very Light / Porcelain": ["Pastel Pink","Lavender","Soft Blue","Mint Green"],
        "Light / Fair": ["Peach","Coral","Sky Blue","Light Yellow"],
        "Medium / Olive": ["Teal","Mustard","Warm Beige","Terracotta"],
        "Tan / Caramel / Light Brown": ["Olive Green","Burnt Orange","Maroon","Cyan"],
        "Brown / Warm Brown": ["Royal Blue","Emerald Green","Bright Yellow","Red"],
        "Dark Brown / Deep": ["Magenta","Turquoise","Gold","Deep Purple"],
        "Very Dark / Ebony": ["White","Bright Red","Cobalt Blue","Orange"]
    }
    return palettes.get(skin_tone, ["Gray","Black","White"])

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

def score_outfit(items, skin_tone, occasion):
    base_score = 50
    styles = [item.get('style','Casual') for item in items]
    patterns = {item.get('pattern','Solid') for item in items}
    
    # style consistency
    if len(set(styles)) == 1:
        base_score += 20
    else:
        base_score -= 5
        
    # pattern mixing penalty
    if "Patterned" in patterns and len(patterns) > 1:
        base_score -= 8
    else:
        base_score += 3
        
    # skin-tone approximate boost based on first item color
    if items and items[0].get('dominant_colors'):
        # Only use the first, most dominant color
        r,g,b = items[0]['dominant_colors'][0]
        total = r+g+b
        if skin_tone in ["Very Light / Porcelain", "Light / Fair"] and total > 400:
            base_score += 5
        elif skin_tone in ["Medium / Olive", "Tan / Caramel / Light Brown"] and 150 < total < 400:
            base_score += 4
        elif skin_tone in ["Brown / Warm Brown", "Dark Brown / Deep", "Very Dark / Ebony"] and total < 300:
            base_score += 4
            
    dominant_style = max(set(styles), key=styles.count) if styles else 'Casual'
    multiplier = OCCASION_MULTIPLIERS.get(occasion, {}).get(dominant_style, 1.0)
    final_score = base_score * multiplier
    final_score = max(0, min(100, final_score))
    
    feedback = f"Great match for {occasion}." if final_score > 85 else (f"Good for {occasion}." if final_score > 70 else f"Maybe not ideal for {occasion}.")
    return int(final_score), feedback

# ------------------- API Endpoints -------------------
@app.route("/detect_skin", methods=["POST"])
def detect_skin():
    face_file = request.files.get("file_face")
    if face_file and allowed_file(face_file.filename):
        filename = secure_filename(face_file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        face_file.save(path)
        skin_tone = detect_skin_tone_mediapipe(path)
        # Optional: delete the file after analysis
        os.remove(path)
        return jsonify({"skin_tone": skin_tone})
    return jsonify({"skin_tone": "Medium / Olive"})

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts uploaded face (optional) and many clothing files named file_<category>.
    Returns clothing metadata and recommendations.
    """
    temp_files = [] # To ensure we clean up all files regardless of success/fail
    try:
        start_time = time.time()
        face_file = request.files.get("file_face")
        skin_tone = "Medium / Olive"
        
        if face_file and allowed_file(face_file.filename):
            face_name = f"face_{int(time.time()*1000)}_{secure_filename(face_file.filename)}"
            face_path = os.path.join(UPLOAD_FOLDER, face_name)
            face_file.save(face_path)
            temp_files.append(face_path)
            skin_tone = detect_skin_tone_mediapipe(face_path)

        occasion = request.form.get("occasion", "Casual Outing")
        
        # Categories list is inclusive of common item types
        categories = ["shirt","pants","shoes","top","bottom","outerwear","dress","skirt"]
        clothing_data = {cat: [] for cat in categories}
        uploaded_items = {} # Filename -> nobg_filepath

        for cat in categories:
            files = request.files.getlist(f"file_{cat}")
            for f in files[:MAX_FILES_PER_CATEGORY]:
                if f and allowed_file(f.filename):
                    # Use a unique name for the saved file
                    fname_safe = secure_filename(f.filename)
                    fname = f"{cat}_{int(time.time()*1000)}_{fname_safe}" 
                    fpath = os.path.join(UPLOAD_FOLDER, fname)
                    f.save(fpath)
                    temp_files.append(fpath) # Original image file
                    
                    fpath_nobg = remove_bg(fpath)
                    if fpath_nobg != fpath:
                        temp_files.append(fpath_nobg) # No-background image file
                        
                    dominant = get_dominant_colors(fpath_nobg, k=3)
                    
                    clothing_data[cat].append({
                        "filename": fname,
                        "dominant_colors": dominant,
                        "dominant_color_name": simple_color_name(dominant[0]) if dominant else "unknown",
                        "pattern": detect_pattern(fpath_nobg),
                        "style": detect_style_from_filename(fname),
                        "warnings": check_image_quality(fpath_nobg)
                    })
                    uploaded_items[fname] = fpath_nobg

        # --- Outfit Recommendation Generation ---
        recommended_outfits = []
        available_lists = [clothing_data[c] for c in categories if clothing_data[c]]
        
        if len(available_lists) >= 2:
            combos = itertools.product(*available_lists)
            for idx, combo in enumerate(combos):
                if idx >= MAX_COMBOS:
                    break
                
                combo_items = []
                for c in combo:
                    # Pass necessary item metadata to the scoring function
                    combo_items.append({
                        "style": c.get("style"),
                        "pattern": c.get("pattern"),
                        "dominant_colors": c.get("dominant_colors", [])
                    })
                
                score, feedback = score_outfit(combo_items, skin_tone, occasion)
                
                recommended_outfits.append({
                    "items": [c["filename"] for c in combo],
                    "score": score,
                    "feedback": feedback
                })
            
            # Sort and cap the recommendations
            recommended_outfits = sorted(recommended_outfits, key=lambda x: x["score"], reverse=True)[:10]

        # Combine uploaded item previews (using no-bg versions)
        combined_preview = combine_clothing_images(list(uploaded_items.values()))
        if combined_preview:
            # Add the combined preview to the list for cleanup in case of error
             temp_files.append(os.path.join(UPLOAD_FOLDER, combined_preview))

        accessories = ["Belt", "Watch", "Handbag", "Shoes Matching Color"]
        recommended_colors = suggest_colors_for_skin(skin_tone)
        elapsed = time.time() - start_time
        
        # NOTE: In a production environment, you would save files to persistent storage 
        # (e.g., S3/CDN) and NOT delete them. For this local setup, we delete originals 
        # but keep the no-bg versions/combined previews temporarily for the Node server 
        # to process/fetch via /uploads route.
        
        # Clean up original file uploads (keep no-bg and combined preview for fetching)
        for fpath in temp_files:
            if not fpath.endswith("_nobg.png") and not fpath.startswith("combined_") and os.path.exists(fpath):
                try:
                    os.remove(fpath)
                except OSError as e:
                    logging.warning(f"Could not delete temporary file {fpath}: {e}")

        return jsonify({
            "success": True,
            "timing_sec": elapsed,
            "skin_tone": skin_tone,
            "clothing_items": clothing_data,
            "recommended_outfits": recommended_outfits,
            "recommended_accessories": accessories,
            "recommended_colors": recommended_colors,
            "combined_preview": combined_preview
        })
        
    except Exception as e:
        logging.error(f"❌ /analyze error: {traceback.format_exc()}")
        # Minimal cleanup on error - usually kept for post-mortem debugging
        return jsonify({"success": False, "error": str(e)}), 500

# ... (suggest_outfit endpoint remains largely unchanged) ...
@app.route("/suggest_outfit", methods=["POST"])
def suggest_outfit():
    """
    Called by frontend OutfitSuggestion. Accepts items from local storage/DB.
    Returns recommended_outfits (score + items).
    """
    try:
        # Accept either JSON body or form-encoded repeated items
        items_payload = []
        if request.is_json:
            payload = request.get_json()
            items_payload = payload.get("items") or payload
        else:
            raw = request.form.getlist("items")
            if raw:
                for r in raw:
                    try:
                        items_payload.append(json.loads(r))
                    except Exception:
                        items_payload.append({"image": r})
            else:
                single = request.form.get("items")
                if single:
                    try:
                        items_payload = json.loads(single)
                    except Exception:
                        items_payload = [single]

        skin_tone = request.form.get("skin_tone") or (request.get_json() or {}).get("skin_tone") or "Medium / Olive"
        occasion = request.form.get("occasion") or (request.get_json() or {}).get("occasion") or "Casual Outing"

        # Normalize items: ensure each has keys we expect
        normalized = []
        for it in items_payload:
            if isinstance(it, str):
                normalized.append({"image": it})
                continue
            itn = {
                "image": it.get("image"),
                "category": it.get("category") or it.get("type") or "unknown",
                "name": it.get("name") or it.get("label") or "Item",
                "dominant_colors": it.get("dominant_colors") or [],
                "style": it.get("style") or detect_style_from_filename(it.get("name","")),
                "pattern": it.get("pattern") or "Solid"
            }
            normalized.append(itn)

        # Quick local analysis for items that lack dominant_colors: try to find file path
        for it in normalized:
            if not it.get("dominant_colors") and it.get("image"):
                path_candidate = None
                # Check for relative /uploads path or filename
                img_url = it["image"]
                if "uploads/" in img_url:
                    # Extract filename from the path
                    filename = img_url.split("/")[-1]
                    path_candidate = os.path.join(UPLOAD_FOLDER, filename)
                
                if path_candidate and os.path.exists(path_candidate):
                    try:
                        # Re-run color analysis on the saved file
                        it["dominant_colors"] = get_dominant_colors(path_candidate, k=3)
                    except Exception as e:
                        logging.warning(f"Failed to re-analyze colors for {path_candidate}: {e}")
                        it["dominant_colors"] = []

        # Now generate suggestions: as simple permutations of selected items
        recommended = []
        n = len(normalized)
        if n >= 2:
            combos = []
            for r in range(2, min(n, 5)+1):  # cap combination size at 5 for performance
                combos.extend(itertools.combinations(normalized, r))
            
            # Score combos
            for combo in combos:
                # Need to map the minimal saved data to the format score_outfit expects
                combo_items = [{
                    "style": i.get("style"), 
                    "pattern": i.get("pattern"), 
                    "dominant_colors": i.get("dominant_colors", [])
                } for i in combo]
                
                score, feedback = score_outfit(combo_items, skin_tone, occasion)
                
                recommended.append({
                    "items": [{"name": it.get("name"), "image": it.get("image"), "category": it.get("category")} for it in combo],
                    "score": score,
                    "feedback": feedback
                })
            
            recommended = sorted(recommended, key=lambda x: x["score"], reverse=True)[:20]

        return jsonify({
            "success": True,
            "skin_tone": skin_tone,
            "recommended_outfits": recommended
        })
    except Exception as e:
        logging.error(f"❌ /suggest_outfit error: {traceback.format_exc()}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/uploads/<filename>")
@cross_origin() # 🌟 CORS FIX: Explicitly allow cross-origin requests for file serving
def uploaded_file(filename):
    # Security: use secure_filename to prevent directory traversal attacks
    safe = secure_filename(filename)
    return send_from_directory(UPLOAD_FOLDER, safe)

if __name__ == "__main__":
    logging.info("Starting Flask ML Microservice on 127.0.0.1:5001")
    # run on port 5001 to avoid conflict with Node server if needed
    app.run(debug=True, host="127.0.0.1", port=5001)