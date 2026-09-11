import os, sys, json, time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

sys.stdout.reconfigure(encoding='utf-8')

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dataset', 'multicrop')
TRAIN_DIR = os.path.join(DATASET_DIR, 'train')
VAL_DIR = os.path.join(DATASET_DIR, 'val')
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
BEST_MODEL_PATH = os.path.join(MODEL_DIR, 'multicrop_mobilenetv3_best.pt')
FALLBACK_PATH = os.path.join(MODEL_DIR, 'groundnut_mobilenetv3_best.pt')
LABELS_PATH = os.path.join(MODEL_DIR, 'class_labels.json')

def main(epochs=8, batch_size=32, lr=1e-3):
    os.makedirs(MODEL_DIR, exist_ok=True)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'[Train MultiCrop] Using device: {device}')

    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=train_transforms)
    val_dataset = datasets.ImageFolder(VAL_DIR, transform=val_transforms)

    class_names = train_dataset.classes
    print(f'[Train MultiCrop] Classes ({len(class_names)}): {class_names}')
    print(f'[Train MultiCrop] Train size: {len(train_dataset)}, Val size: {len(val_dataset)}')

    with open(LABELS_PATH, 'w', encoding='utf-8') as f:
        json.dump(class_names, f, indent=2)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Pretrained MobileNetV3-Small
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, len(class_names))
    for param in model.features.parameters():
        param.requires_grad = False
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    for epoch in range(epochs):
        t0 = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total
        train_acc = (correct / total) * 100.0

        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += labels.size(0)

        val_loss = val_loss / val_total
        val_acc = (val_correct / val_total) * 100.0
        elapsed = time.time() - t0

        print(f'Epoch [{epoch+1}/{epochs}] ({elapsed:.1f}s) - Train Loss: {train_loss:.4f} Acc: {train_acc:.2f}% | Val Loss: {val_loss:.4f} Acc: {val_acc:.2f}%')

        if val_acc > best_val_acc or epoch == epochs - 1:
            best_val_acc = max(best_val_acc, val_acc)
            save_payload = {
                'model_state_dict': model.state_dict(),
                'class_names': class_names,
                'model_name': 'AgroSense Multi-Crop MobileNetV3-Small',
                'version': 'multicrop-v2.0',
                'epoch': epoch + 1,
                'val_acc': val_acc
            }
            torch.save(save_payload, BEST_MODEL_PATH)
            torch.save(save_payload, FALLBACK_PATH) # also update fallback so both load 7 classes
            print(f'  --> Saved model checkpoint! (Val Acc: {val_acc:.2f}%)')

    print(f'[Train MultiCrop] Complete! Best Val Accuracy: {best_val_acc:.2f}%')

if __name__ == '__main__':
    main(epochs=3, batch_size=64, lr=1.5e-3)