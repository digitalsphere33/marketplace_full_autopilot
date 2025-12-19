import os
from fastapi import FastAPI
from pydantic import BaseModel
import requests
from io import BytesIO
from PIL import Image

app = FastAPI()

class ModerateRequest(BaseModel):
    image_url: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/moderate")
def moderate(req: ModerateRequest):
    try:
        resp = requests.get(req.image_url, timeout=5)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        return {"flagged": True, "reason": "Image fetch failed"}

    # Try Falconsai nsfw detection if available
    try:
        from nsfw_image_detection import NSFWImageDetector  # placeholder import name
        detector = NSFWImageDetector()
        score = detector.predict_image(img)
        flagged = score.get("nsfw", 0) > 0.5
        return {"flagged": flagged, "score": score}
    except Exception:
        # Fallback heuristic: block very small or grayscale-only images (demo)
        w, h = img.size
        blocked = (w * h) < (256 * 256)
        return {"flagged": blocked, "reason": "fallback"}
