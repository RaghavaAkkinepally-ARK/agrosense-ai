import os
import sys
import json
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from quality_checker import check_image_quality
from severity_analyzer import estimate_leaf_severity

sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(title="AgroSense AI - ML Vision Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
BEST_MODEL_PATH = os.path.join(MODEL_DIR, 'multicrop_mobilenetv3_best.pt')
FALLBACK_MODEL_PATH = os.path.join(MODEL_DIR, 'groundnut_mobilenetv3_best.pt')
LABELS_PATH = os.path.join(MODEL_DIR, 'class_labels.json')

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
class_names = []

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def load_inference_model():
    global model, class_names
    target_path = BEST_MODEL_PATH if os.path.exists(BEST_MODEL_PATH) else FALLBACK_MODEL_PATH
    if os.path.exists(target_path):
        checkpoint = torch.load(target_path, map_location=device)
        class_names = checkpoint.get('class_names') or checkpoint.get('classes')
        m = models.mobilenet_v3_small()
        in_features = m.classifier[3].in_features
        m.classifier[3] = nn.Linear(in_features, len(class_names))
        m.load_state_dict(checkpoint['model_state_dict'])
        m = m.to(device)
        m.eval()
        model = m
        print(f'[Service] Real Universal Multi-Crop MobileNetV3 loaded successfully ({len(class_names)} classes: {class_names}).')
    elif os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r', encoding='utf-8') as f:
            class_names = json.load(f)
        print(f'[Service] Warning: Model checkpoint not found at {target_path}, labels loaded: {class_names}')
    else:
        class_names = ['Black Spot', 'Downy Mildew - Mosaic', 'Early Leaf Spot', 'Healthy', 'Late Leaf Spot', 'Nutrition Deficiency', 'Rust']
        print('[Service] Default multi-crop classes assigned.')

@app.on_event("startup")
def startup_event():
    load_inference_model()

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "AgroSense AI Universal Multi-Crop Vision Microservice",
        "modelLoaded": model is not None,
        "modelName": "AgroSense Multi-Crop MobileNetV3-Small",
        "modelVersion": "multicrop-v2.0",
        "datasetVersion": "AgroSense-MultiCrop-7Class",
        "device": str(device),
        "supportedClasses": class_names
    }

@app.post("/predict")
async def predict_crop_leaf(file: UploadFile = File(...)):
    global model
    if model is None:
        load_inference_model()
        if model is None:
            raise HTTPException(status_code=503, detail="AI Vision model is currently not loaded. Ensure training has completed.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty image payload received.")

    # 1. Image Quality Validation
    quality = check_image_quality(contents)
    if not quality['passed']:
        return {
            "success": False,
            "qualityPassed": False,
            "errorType": "IMAGE_QUALITY_INSUFFICIENT",
            "message": quality['reason'],
            "qualityMetrics": quality['metrics']
        }

    # 2. Preprocess and Run Deep Inference
    try:
        pil_img = Image.open(io.BytesIO(contents)).convert('RGB')
        input_tensor = transform(pil_img).unsqueeze(0).to(device)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image parsing error: {str(e)}")

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1).cpu().squeeze().numpy()

    # Formulate probability distribution
    prob_dict = {class_names[i]: round(float(probs[i]) * 100.0, 2) for i in range(len(class_names))}
    top_idx = int(probs.argmax())
    top_class = class_names[top_idx]
    top_conf = round(float(probs[top_idx]) * 100.0, 1)

    # 3. Out-Of-Distribution (OOD) / Low-Confidence Guardrail
    # If the top confidence is below 40%, the image is unfamiliar or ambiguous
    if top_conf < 40.0:
        return {
            "success": False,
            "qualityPassed": True,
            "errorType": "OUT_OF_DISTRIBUTION",
            "message": "Unable to confidently identify a supported crop condition. Please upload a clear, focused photo of a groundnut leaf.",
            "confidence": top_conf,
            "probabilities": prob_dict,
            "modelName": "Groundnut MobileNetV3-Small",
            "modelVersion": "groundnut-v1.0"
        }

    # 4. Severity Assessment
    severity = estimate_leaf_severity(contents, top_class)

    return {
        "success": True,
        "qualityPassed": True,
        "prediction": top_class,
        "confidence": top_conf,
        "probabilities": prob_dict,
        "severity": severity,
        "qualityMetrics": quality['metrics'],
        "modelName": "Groundnut MobileNetV3-Small",
        "modelVersion": "groundnut-v1.0",
        "datasetVersion": "Mendeley-22p2vcbxfk.3",
        "isRealInference": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)
