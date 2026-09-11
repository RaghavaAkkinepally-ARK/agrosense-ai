import os
import sys
import urllib.request
import zipfile
import shutil

sys.stdout.reconfigure(encoding='utf-8')

DATASET_DIR = os.path.join(os.path.dirname(__file__), 'raw')
ZIP_PATH = os.path.join(os.path.dirname(__file__), 'groundnut_dataset.zip')
DOWNLOAD_URL = 'https://data.mendeley.com/public-api/zip/22p2vcbxfk/download/3'

def download_dataset():
    if os.path.exists(DATASET_DIR) and len(os.listdir(DATASET_DIR)) >= 6:
        print(f'[Dataset] Raw dataset already exists at {DATASET_DIR} with classes: {os.listdir(DATASET_DIR)}')
        return

    os.makedirs(os.path.dirname(ZIP_PATH), exist_ok=True)

    if not os.path.exists(ZIP_PATH) or os.path.getsize(ZIP_PATH) < 100000000:
        print(f'[Dataset] Fetching dataset from Mendeley Data: {DOWNLOAD_URL}...')
        req = urllib.request.Request(DOWNLOAD_URL, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req) as resp:
            total_size = int(resp.headers.get('Content-Length', 0))
            print(f'[Dataset] Total archive size: {total_size / (1024*1024):.2f} MB')
            
            downloaded = 0
            chunk_size = 1024 * 1024 # 1MB
            last_pct = -1
            
            with open(ZIP_PATH, 'wb') as f:
                while True:
                    chunk = resp.read(chunk_size)
                    if not chunk:
                        break
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        pct = int((downloaded / total_size) * 100)
                        if pct != last_pct and pct % 10 == 0:
                            print(f'[Dataset] Download progress: {pct}% ({downloaded / (1024*1024):.1f}/{total_size / (1024*1024):.1f} MB)')
                            last_pct = pct
        print('[Dataset] Download complete.')
    else:
        print(f'[Dataset] Existing zip found at {ZIP_PATH} ({os.path.getsize(ZIP_PATH)/(1024*1024):.2f} MB)')

    print(f'[Dataset] Extracting archive to {DATASET_DIR}...')
    os.makedirs(DATASET_DIR, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
        # Check files inside
        namelist = zf.namelist()
        print(f'[Dataset] Archive contains {len(namelist)} items.')
        zf.extractall(DATASET_DIR)
    
    print('[Dataset] Extraction finished. Inspecting extracted folder structure...')
    # Check if there are nested folders
    for root, dirs, files in os.walk(DATASET_DIR):
        if len(files) > 0 and root != DATASET_DIR:
            print(f'  Folder: {os.path.basename(root)} -> {len(files)} files')

if __name__ == '__main__':
    download_dataset()
