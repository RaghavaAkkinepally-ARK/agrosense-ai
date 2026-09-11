/**
 * AgroSense AI - Phase 2 Multimodal Inference Service
 * 
 * DESIGN SPECIFICATIONS:
 * 1. Multimodal Architecture:
 *    - Vision Branch: Extracts 128-dimensional visual feature embedding.
 *    - Environmental Branch: Normalizes inputs (T, H, SM, LI) and projects them into 64-dimensional context embedding.
 *    - Multimodal Fusion: Concatenates embeddings (192-dimensional) and feeds through a Softmax Dense classifier layer.
 * 2. Pluggability:
 *    - Weights and projection matrices are stored as models parameters.
 *    - To swap for a trained model, replace matrix weights or load external ONNX/TensorFlow configurations inside loadModelParameters().
 * 3. Clinical Warning:
 *    - Clearly labels all diagnostic determinations as MOCK/DEMO until scientifically verified, avoiding false validation.
 */

// Target classes for diagnosis
const CLASSES = [
    'Early Rust',
    'Rust',
    'Early Leaf Spot',
    'Late Leaf Spot',
    'Nutritional Deficiency',
    'Healthy'
];

/**
 * Normalization helper (Min-Max or Z-Score style)
 */
function normalizeInputs(inputs) {
    // Reference limits for groundnuts microclimate
    const tempMean = 28.0;
    const tempStd = 6.0;
    const humMean = 70.0;
    const humStd = 20.0;
    const soilMean = 45.0;
    const soilStd = 15.0;
    const lightMean = 50000.0;
    const lightStd = 25000.0;

    return [
        (Number(inputs.temperature) - tempMean) / tempStd,
        (Number(inputs.humidity) - humMean) / humStd,
        (Number(inputs.soilMoisture) - soilMean) / soilStd,
        (Number(inputs.lightIntensity) - lightMean) / lightStd
    ];
}

/**
 * Pseudo-random generator seeded by input properties 
 * Ensures consistent output behavior for identical scans without state loss.
 */
function seededRandom(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };
}

/**
 * Model Parameters configuration
 * Simulates standard neural network layers.
 */
function loadModelParameters(seedVal = 'agrosense_default_seed') {
    const rand = seededRandom(seedVal);

    // 1. Environmental encoder projection weights: Shape (64, 4)
    const envWeights = Array.from({ length: 64 }, () =>
        Array.from({ length: 4 }, () => rand() * 2 - 1)
    );
    const envBiases = Array.from({ length: 64 }, () => rand() * 0.1 - 0.05);

    // 2. Multimodal Fusion classification weights: Shape (6, 192)
    // Let's seed weights deliberately to reflect agronomical rules!
    const classWeights = Array.from({ length: 6 }, () =>
        Array.from({ length: 192 }, () => rand() * 2 - 1)
    );

    // Custom inject agronomical correlations into the weights!
    // Indices: 0: Early Rust, 1: Rust, 2: Early Leaf Spot, 3: Late Leaf Spot, 4: Nutr Def, 5: Healthy
    // Env features correspond to: NormTemp [0], NormHum [1], NormSoil [2], NormLight [3]
    // We can customize the weights of Class Classifier relative to Env Feature projections
    // e.g. let's correlate High humidity (NormHum > 0) to Leaf spots or Rust:
    // Since env features are projected into 64 elements, we can bias the classification weights 
    // corresponding to Env index ranges. Let's make it simple and elegant:

    const classBiases = [0.1, -0.05, 0.05, 0.1, -0.1, 0.2]; // Biases

    return {
        envWeights,
        envBiases,
        classWeights,
        classBiases
    };
}

/**
 * Core Multimodal Fusion Inference logic
 */
export async function runMultimodalInference(environmentalData, imageFile = null) {
    // 1. Load weights (dynamic seed based on image size or metadata)
    const seedString = `${imageFile ? imageFile.originalname + imageFile.size : 'no-image'}_t${environmentalData.temperature}_h${environmentalData.humidity}`;
    const modelParameters = loadModelParameters(seedString);
    const rand = seededRandom(seedString);

    console.log(`[ML INFERENCE] Starting inference pipeline for seed: "${seedString}"`);

    // --- BRANCH 1: VISION PROCESSOR ---
    // Simulate leaf feature extraction through a CNN (e.g. ResNet50)
    // Generates 128-dimensional visual embedding
    console.log(`[ML INFERENCE] Vision Branch: Extracting 128-d visual feature map...`);
    const visionEmbedding = Array.from({ length: 128 }, () => rand() * 2 - 1);

    // Induce a visual bias based on file naming to simulate spot detection
    const imageName = (imageFile ? imageFile.originalname : '').toLowerCase();
    let visualBiasIndex = -1; // -1 represents no strong visual detection
    if (imageName.includes('rust')) {
        visualBiasIndex = imageName.includes('early') ? 0 : 1;
    } else if (imageName.includes('leaf') || imageName.includes('spot')) {
        visualBiasIndex = imageName.includes('early') ? 2 : 3;
    } else if (imageName.includes('deficiency') || imageName.includes('yellow')) {
        visualBiasIndex = 4;
    } else if (imageName.includes('healthy') || imageName.includes('green')) {
        visualBiasIndex = 5;
    }

    // --- BRANCH 2: ENVIRONMENTAL PROCESSOR ---
    // Input: 4-d vector -> Normalization -> Context Encoder (Dense 64-d projection)
    console.log(`[ML INFERENCE] Environmental Branch: Normalizing microclimate inputs...`);
    const normalizedParams = normalizeInputs(environmentalData); // 4-d

    console.log(`[ML INFERENCE] Environmental Branch: Projecting 4-d input to 64-d context embedding...`);
    const envEmbedding = new Array(64).fill(0);
    for (let i = 0; i < 64; i++) {
        let sum = modelParameters.envBiases[i];
        for (let j = 0; j < 4; j++) {
            sum += normalizedParams[j] * modelParameters.envWeights[i][j];
        }
        // Apply LeakyReLU activation
        envEmbedding[i] = sum > 0 ? sum : sum * 0.1;
    }

    // --- MULTIMODAL FUSION LAYER ---
    // Concatenate Vision (128) and Environmental (64) embeddings -> 192-d
    console.log(`[ML INFERENCE] Fusion Layer: Concatenating features (Vision: 128-d + Environmental: 64-d) -> 192-d`);
    const fusedEmbedding = [...visionEmbedding, ...envEmbedding];

    // --- CLASSIFICATION DENSE LAYER ---
    // Multiply fusedEmbedding by classWeights (shape 6x192) + classBiases
    console.log(`[ML INFERENCE] Classifier: Computing Softmax probabilities over 6 target classes...`);
    const logits = new Array(6).fill(0);

    for (let c = 0; c < 6; c++) {
        let sum = modelParameters.classBiases[c];
        for (let f = 0; f < 192; f++) {
            sum += fusedEmbedding[f] * modelParameters.classWeights[c][f];
        }
        logits[c] = sum;
    }

    // If a specific visual bias was detected, boost its logit significantly to simulate CNN classification power
    if (visualBiasIndex !== -1) {
        logits[visualBiasIndex] += 12.0;
    } else {
        // Rely on agronomical heuristics if no file hints exist
        const temp = Number(environmentalData.temperature);
        const hum = Number(environmentalData.humidity);
        const soil = Number(environmentalData.soilMoisture);

        if (hum > 85 && temp > 24 && temp < 32) {
            logits[2] += 5.0; // Early Leaf Spot warm + humid
            logits[3] += 3.0; // Late Leaf Spot
        } else if (hum > 90 && temp >= 18 && temp <= 25) {
            logits[3] += 5.0; // Late Leaf Spot cool + highly humid
        } else if (hum > 75 && soil > 60) {
            logits[0] += 4.0; // Early Rust wet soil
            logits[1] += 3.0; // Rust
        } else if (soil < 30) {
            logits[4] += 4.0; // Nutritional Deficiency under drought stress
        } else if (temp < 15 || temp > 40) {
            logits[4] += 3.0; // Thermal nutrient uptake locks
        } else {
            logits[5] += 6.0; // Normal parameters correlate with Healthy
        }
    }

    // Softmax mathematical computation
    const maxLogit = Math.max(...logits);
    const exps = logits.map(v => Math.exp(v - maxLogit)); // prevent overflow
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const probabilities = exps.map(v => v / sumExps);

    // Determine winning class
    let maxIdx = 0;
    let maxProb = 0;
    probabilities.forEach((p, idx) => {
        if (p > maxProb) {
            maxProb = p;
            maxIdx = idx;
        }
    });

    const predictedClass = CLASSES[maxIdx];
    const confidence = Number((maxProb * 100).toFixed(1));

    // Map to class probability percentages
    const classProbabilities = {};
    CLASSES.forEach((c, idx) => {
        classProbabilities[c] = Number((probabilities[idx] * 100).toFixed(1));
    });

    // Calculate environmental pathogen risk index based on humidity & temperature parameters
    let environmentalRisk = 'Low';
    const humValue = Number(environmentalData.humidity);
    if (humValue > 85) environmentalRisk = 'High';
    else if (humValue > 65) environmentalRisk = 'Medium';

    // Determine Severity Index
    let severity = 'Mild';
    if (predictedClass !== 'Healthy') {
        if (confidence > 85) severity = 'Severe';
        else if (confidence > 60) severity = 'Moderate';
    } else {
        severity = 'None';
    }

    // Generate disease-specific explanations
    let explanation = '';
    switch (predictedClass) {
        case 'Early Rust':
            explanation = `[DEMO MODEL] Detected early pustule formation indicating rust germination (Puccinia arachidis). High ground soil moisture (${environmentalData.soilMoisture}%) coupled with mild ambient temperature are the principal drivers.`;
            break;
        case 'Rust':
            explanation = `[DEMO MODEL] Severe leaf rust infestation identified. Fungal spore pustules have ruptured on lower leaf surfaces. Immediate isolate application is requested.`;
            break;
        case 'Early Leaf Spot':
            explanation = `[DEMO MODEL] Leaf spot lesions detected. Conidia of Cercospora arachidicola sprout rapidly when relative humidity (${environmentalData.humidity}%) is elevated in the crop canopy.`;
            break;
        case 'Late Leaf Spot':
            explanation = `[DEMO MODEL] Necrotic black spots matching Late Leaf Spot (Phaeoisariopsis personata) found. Favors cooler night borders and persistent condensation.`;
            break;
        case 'Nutritional Deficiency':
            explanation = `[DEMO MODEL] Chlorotic leaf yellowing identified. Linked to osmotic/hydration stress since soil moisture is ${environmentalData.soilMoisture}%. Recommended fertilizer amendments (zinc/calcium).`;
            break;
        case 'Healthy':
        default:
            explanation = `[DEMO MODEL] Groundnut leaf displays regular cellular density, normal pigmentation, and balanced vein structures. Microclimate parameter indices are balanced.`;
            break;
    }

    // Inject warning stating this is a simulated demo prediction
    explanation += " | NOTICE: This is a DEMO/MOCK Multimodal Architecture Output - Not scientifically validated for active clinical field deployments.";

    return {
        predicted_class: predictedClass,
        confidence,
        class_probabilities: classProbabilities,
        environmental_risk: environmentalRisk,
        severity,
        explanation,
        isDemoMock: true // Explicitly labeled property
    };
}
