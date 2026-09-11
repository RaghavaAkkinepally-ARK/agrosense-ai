import cv2
import numpy as np

def check_image_quality(image_path_or_bytes):
    """
    Evaluates leaf image quality for agricultural AI inference.
    Returns:
      {
        'passed': bool,
        'reason': str or None,
        'metrics': {
          'resolution': (width, height),
          'blur_variance': float,
          'mean_brightness': float,
          'leaf_pixel_ratio': float
        }
      }
    """
    if isinstance(image_path_or_bytes, str):
        img = cv2.imread(image_path_or_bytes)
    else:
        nparr = np.frombuffer(image_path_or_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            'passed': False,
            'reason': 'Corrupted or unreadable image format. Please submit a valid JPG or PNG.',
            'metrics': None
        }

    h, w = img.shape[:2]
    if h < 120 or w < 120:
        return {
            'passed': False,
            'reason': f'Image resolution is too low ({w}x{h} px). Minimum recommended is 224x224 px.',
            'metrics': {'resolution': (w, h)}
        }

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 1. Blur evaluation using Laplacian variance
    blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if blur_var < 30.0:
        return {
            'passed': False,
            'reason': 'Image is excessively blurry for reliable AI analysis. Please retake photo holding the camera steady and focused on the leaf.',
            'metrics': {
                'resolution': (w, h),
                'blur_variance': round(blur_var, 2)
            }
        }

    # 2. Brightness evaluation
    mean_brightness = float(np.mean(gray))
    if mean_brightness < 25.0:
        return {
            'passed': False,
            'reason': 'Image is too dark. Please take photo under adequate daylight or diffused natural light.',
            'metrics': {
                'resolution': (w, h),
                'blur_variance': round(blur_var, 2),
                'mean_brightness': round(mean_brightness, 2)
            }
        }
    if mean_brightness > 240.0:
        return {
            'passed': False,
            'reason': 'Image is overexposed / too bright. Please avoid intense direct camera flash or specular reflection.',
            'metrics': {
                'resolution': (w, h),
                'blur_variance': round(blur_var, 2),
                'mean_brightness': round(mean_brightness, 2)
            }
        }

    # 3. Foliage / Leaf presence check via HSV color segmentation
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    # Green canopy mask
    lower_green = np.array([25, 25, 25])
    upper_green = np.array([95, 255, 255])
    green_mask = cv2.inRange(hsv, lower_green, upper_green)

    # Also include chlorotic/rust yellowish-brown foliar areas
    lower_foliar = np.array([10, 30, 30])
    upper_foliar = np.array([30, 255, 255])
    foliar_mask = cv2.inRange(hsv, lower_foliar, upper_foliar)

    combined_plant_mask = cv2.bitwise_or(green_mask, foliar_mask)
    plant_pixel_count = int(np.count_nonzero(combined_plant_mask))
    total_pixels = h * w
    plant_ratio = plant_pixel_count / total_pixels

    if plant_ratio < 0.05:
        return {
            'passed': False,
            'reason': 'No groundnut leaf or vegetation detected in the frame. Please frame the crop leaf prominently.',
            'metrics': {
                'resolution': (w, h),
                'blur_variance': round(blur_var, 2),
                'mean_brightness': round(mean_brightness, 2),
                'leaf_pixel_ratio': round(plant_ratio, 3)
            }
        }

    return {
        'passed': True,
        'reason': None,
        'metrics': {
            'resolution': (w, h),
            'blur_variance': round(blur_var, 2),
            'mean_brightness': round(mean_brightness, 2),
            'leaf_pixel_ratio': round(plant_ratio, 3)
        }
    }
