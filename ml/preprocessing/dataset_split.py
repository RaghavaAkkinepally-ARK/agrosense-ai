import os
import shutil
import random
import json
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
RAW_DIR = os.path.join(BASE_DIR, 'dataset', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'dataset', 'processed')
MANIFEST_PATH = os.path.join(BASE_DIR, 'dataset', 'splits_manifest.json')

# Map discovered raw folders to clean standard class names
FOLDER_MAPPING = {
    'early_leaf_spot': 'Early Leaf Spot',
    'healthy leaf': 'Healthy',
    'late leaf spot': 'Late Leaf Spot',
    'nutrition deficiency': 'Nutrition Deficiency',
    'rust': 'Rust'
}

def find_class_folders(raw_path):
    class_dirs = {}
    for root, dirs, files in os.walk(raw_path):
        folder_name = os.path.basename(root).strip().lower()
        for raw_key, clean_target in FOLDER_MAPPING.items():
            if folder_name == raw_key.lower():
                imgs = [os.path.join(root, f) for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                if len(imgs) > 0:
                    if clean_target not in class_dirs or len(imgs) > len(class_dirs[clean_target]):
                        class_dirs[clean_target] = imgs
    return class_dirs

def prepare_splits(seed=42):
    random.seed(seed)
    print(f'[Split] Scanning for raw dataset in {RAW_DIR}...')
    class_map = find_class_folders(RAW_DIR)
    
    print('[Split] Found classes and authentic image counts:')
    total_found = 0
    for c, img_list in sorted(class_map.items()):
        print(f'  - {c}: {len(img_list)} images')
        total_found += len(img_list)
    print(f'[Split] Total authentic raw images: {total_found}')

    if len(class_map) < 5:
        print(f'[Split] WARNING: Expected 5 classes, found {len(class_map)}. Please check raw folder path.')

    manifest = {
        'seed': seed,
        'split_ratios': {'train': 0.70, 'val': 0.15, 'test': 0.15},
        'classes': {},
        'total_images': 0
    }

    if os.path.exists(PROCESSED_DIR):
        print(f'[Split] Refreshing processed directory {PROCESSED_DIR}...')
        shutil.rmtree(PROCESSED_DIR)

    for split in ['train', 'val', 'test']:
        for c in class_map.keys():
            os.makedirs(os.path.join(PROCESSED_DIR, split, c), exist_ok=True)

    for class_name, img_paths in class_map.items():
        valid_imgs = []
        for p in img_paths:
            try:
                with Image.open(p) as im:
                    im.verify()
                valid_imgs.append(p)
            except Exception:
                continue

        random.shuffle(valid_imgs)
        n = len(valid_imgs)
        n_train = int(0.70 * n)
        n_val = int(0.15 * n)
        n_test = n - n_train - n_val

        train_files = valid_imgs[:n_train]
        val_files = valid_imgs[n_train:n_train + n_val]
        test_files = valid_imgs[n_train + n_val:]

        for subset_name, flist in [('train', train_files), ('val', val_files), ('test', test_files)]:
            dest_dir = os.path.join(PROCESSED_DIR, subset_name, class_name)
            for fpath in flist:
                fname = os.path.basename(fpath)
                dest_file = os.path.join(dest_dir, fname)
                shutil.copy2(fpath, dest_file)

        manifest['classes'][class_name] = {
            'total': n,
            'train': len(train_files),
            'val': len(val_files),
            'test': len(test_files)
        }
        manifest['total_images'] += n

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print(f'[Split] Stratified dataset splits created successfully. Manifest saved to {MANIFEST_PATH}')
    print(f'[Split] Final processed dataset: {manifest["total_images"]} images across {len(manifest["classes"])} classes.')

if __name__ == '__main__':
    prepare_splits()
