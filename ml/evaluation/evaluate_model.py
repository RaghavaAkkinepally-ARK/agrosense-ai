import os
import sys
import json
import torch
import torch.nn as nn
import numpy as np
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix

sys.stdout.reconfigure(encoding='utf-8')

PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset', 'processed')
TEST_DIR = os.path.join(PROCESSED_DIR, 'test')
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
BEST_MODEL_PATH = os.path.join(MODEL_DIR, 'groundnut_mobilenetv3_best.pt')
EVAL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'evaluation')

def evaluate_test_set():
    os.makedirs(EVAL_DIR, exist_ok=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    checkpoint = torch.load(BEST_MODEL_PATH, map_location=device)
    class_names = checkpoint['class_names']
    print(f'[Eval] Loaded model checkpoint from {BEST_MODEL_PATH} ({checkpoint.get("architecture", "MobileNetV3-Small")})')
    print(f'[Eval] Target classes: {class_names}')

    test_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_dataset = datasets.ImageFolder(TEST_DIR, transform=test_transforms)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False, num_workers=0)
    print(f'[Eval] Independent held-out test samples: {len(test_dataset)}')

    model = models.mobilenet_v3_small()
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, len(class_names))
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()

    all_preds = []
    all_targets = []
    all_probs = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())
            all_probs.extend(probs.cpu().numpy())

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    # Calculate metrics
    report = classification_report(all_targets, all_preds, target_names=class_names, output_dict=True)
    overall_acc = float(np.mean(all_preds == all_targets) * 100.0)
    cm = confusion_matrix(all_targets, all_preds)

    print(f'\n==================================================')
    print(f'  HELD-OUT TEST SET EVALUATION RESULTS')
    print(f'  Overall Accuracy: {overall_acc:.2f}%')
    print(f'==================================================')
    print(classification_report(all_targets, all_preds, target_names=class_names))

    # Save metrics JSON
    metrics_data = {
        'modelName': 'Groundnut MobileNetV3-Small',
        'modelVersion': 'v1.0-real',
        'dataset': 'Dataset of Groundnut Plant Leaf Images (Mendeley Data 10.17632/22p2vcbxfk.3)',
        'testAccuracy': round(overall_acc, 2),
        'macroF1': round(report['macro avg']['f1-score'] * 100, 2),
        'weightedF1': round(report['weighted avg']['f1-score'] * 100, 2),
        'perClass': {
            c: {
                'precision': round(report[c]['precision'] * 100, 2),
                'recall': round(report[c]['recall'] * 100, 2),
                'f1': round(report[c]['f1-score'] * 100, 2),
                'support': int(report[c]['support'])
            } for c in class_names
        },
        'confusionMatrix': cm.tolist()
    }

    metrics_path = os.path.join(EVAL_DIR, 'metrics.json')
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump(metrics_data, f, indent=2)
    print(f'[Eval] Saved metrics JSON to {metrics_path}')

    # Plot Confusion Matrix
    plt.figure(figsize=(8, 7))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Greens)
    plt.title(f'AgroSense AI - Groundnut Test Confusion Matrix\n(Accuracy: {overall_acc:.1f}%)', fontsize=12, pad=15)
    plt.colorbar()
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=45, ha='right', fontsize=9)
    plt.yticks(tick_marks, class_names, fontsize=9)

    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'),
                     ha="center", va="center",
                     color="white" if cm[i, j] > thresh else "black", fontsize=10)

    plt.ylabel('True Class', fontsize=11)
    plt.xlabel('Predicted Class', fontsize=11)
    plt.tight_layout()
    cm_path = os.path.join(EVAL_DIR, 'confusion_matrix.png')
    plt.savefig(cm_path, dpi=200)
    plt.close()
    print(f'[Eval] Saved confusion matrix plot to {cm_path}')

    # Generate Evaluation Markdown Report
    md_content = f"""# AgroSense AI — Real Groundnut Vision Model Evaluation Report
**Model**: MobileNetV3-Small (Groundnut Foliar Health Diagnostic Backbone)  
**Dataset**: Dataset of Groundnut Plant Leaf Images (Aishwarya Manvikar & Padmanabha Reddy, 2023)  
**DOI**: 10.17632/22p2vcbxfk.3 | **License**: CC BY 4.0 | **Origin**: Koppal, Karnataka, India  
**Split**: Held-Out Independent Test Set (15% of dataset, strictly unobserved during training)  

## Summary Performance
- **Overall Accuracy**: **{overall_acc:.2f}%**
- **Macro-Averaged F1-Score**: **{metrics_data['macroF1']}%**
- **Weighted-Averaged F1-Score**: **{metrics_data['weightedF1']}%**
- **Total Test Images Evaluated**: **{len(test_dataset)}**

## Per-Class Breakdown
| Condition / Disease Class | Precision (%) | Recall (%) | F1-Score (%) | Test Support |
| :--- | :--- | :--- | :--- | :--- |
"""
    for c in class_names:
        row = metrics_data['perClass'][c]
        md_content += f"| **{c}** | {row['precision']}% | {row['recall']}% | {row['f1']}% | {row['support']} |\n"

    md_content += """
## Confusion Matrix
![Groundnut Test Confusion Matrix](confusion_matrix.png)

## Real-World Limitations
1. **Controlled vs. Field Conditions**: This model was trained and evaluated on groundnut leaves collected across diverse cultivation plots in Karnataka, India under natural and semi-controlled illumination. Field accuracy in uncontrolled environments with heavy dust, shadows, or motion blur may differ.
2. **Quality Checks**: The deployed AgroSense application rejects low-resolution (<224px), blurry (Laplacian variance < 30), or non-vegetative photos before running this model.
"""
    with open(os.path.join(EVAL_DIR, 'evaluation_report.md'), 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f'[Eval] Generated evaluation markdown report at {os.path.join(EVAL_DIR, "evaluation_report.md")}')

if __name__ == '__main__':
    evaluate_test_set()
