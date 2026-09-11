/**
 * AgroSense AI - Real Crop Leaf Diagnostic API Client
 * Connects directly to the genuine Express & Python ML Vision Pipeline.
 * Zero mock predictions, zero simulated heuristics, zero hardcoded results.
 */

import { getApiUrl } from './config';

/**
 * Analyzes a real crop leaf photograph via the trained AI model.
 * 
 * @param {File|Blob} imageFile - The leaf photo captured from camera or gallery
 * @param {string} language - Target language code ('en', 'te', 'hi')
 * @param {function} onStage - Callback receiving active stage identifier
 * @param {Object} [envData=null] - Optional manual microclimate sensor parameters
 * @returns {Promise<Object>} Diagnostic report directly from model inference
 */
export async function analyzeCropLeaf(imageFile, language = 'en', onStage = () => {}, envData = null) {
  if (!imageFile) {
    throw new Error('Please select or capture a crop leaf image.');
  }

  const baseUrl = getApiUrl();
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('lang', language);
  if (envData) {
    formData.append('envData', JSON.stringify(envData));
  }

  onStage('uploading');

  // Staged UX notifications matching backend execution
  const stageTimer1 = setTimeout(() => onStage('validating'), 300);
  const stageTimer2 = setTimeout(() => onStage('inferring'), 800);
  const stageTimer3 = setTimeout(() => onStage('diagnosing'), 1500);
  const stageTimer4 = setTimeout(() => onStage('guidance'), 2200);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

    const response = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    clearTimeout(stageTimer3);
    clearTimeout(stageTimer4);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const err = new Error(
        `Cloud AI Connection Needed: The request reached a static web host (${baseUrl}) instead of the AI inference engine.\n\n` +
        `Please click the 'API Status' badge in the top header to configure or verify your AI backend URL (e.g. ${baseUrl}).`
      );
      err.isRoutingError = true;
      throw err;
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      const err = new Error(
        `Invalid server response format. Please verify your backend server endpoint in the top status bar.`
      );
      err.isRoutingError = true;
      throw err;
    }

    if (!response.ok) {
      if (response.status === 422 && (data.errorType === 'IMAGE_QUALITY_INSUFFICIENT' || data.errorType === 'OUT_OF_DISTRIBUTION')) {
        const err = new Error(data.message || 'Image validation check rejected the photo.');
        err.isQualityError = true;
        err.errorType = data.errorType;
        err.metrics = data.qualityMetrics;
        err.allowRetake = true;
        throw err;
      }
      throw new Error(data.error || 'Server rejected inference request.');
    }

    if (!data.success || !data.analysis) {
      throw new Error(data.error || 'Diagnostic inference could not be completed.');
    }

    return data.analysis;

  } catch (err) {
    clearTimeout(stageTimer1);
    clearTimeout(stageTimer2);
    clearTimeout(stageTimer3);
    clearTimeout(stageTimer4);

    if (err.name === 'AbortError') {
      throw new Error('Analysis request timed out. Please verify network connection to the AI server.');
    }
    throw err;
  }
}

// Backward-compatible alias
export const analyzePlantHealth = (params, image, lang) => analyzeCropLeaf(image, lang);

