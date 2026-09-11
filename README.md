# AgroSense AI — Real-World Multi-Crop Foliar Disease Diagnostics

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/RaghavaAkkinepally-ARK/agrosense-ai)

**DeVert-A-Thon 2026 (Problem Statement DVPS07)**

AgroSense AI is a production-grade, multi-crop plant disease intelligence suite designed for Indian agriculture. It combines state-of-the-art **MobileNetV3-Small deep learning inference (85% primary visual neural weight)** with a **bioclimatic microclimate attribution layer (15% secondary environmental weight)** across 8 calibrated microclimate parameters:
- Ambient Temperature (°C)
- Relative Humidity (%)
- Soil Moisture Content (%)
- Ambient Light / Lux (lx)
- Foliar Canopy Temperature (°C)
- Leaf Surface Wetness (0–15 Index)
- Recent Precipitation / Rainfall (mm)
- Surface Wind Velocity (km/h)

The system features complete multilingual localization (English, Telugu, Hindi) with native voice synthesis audio playback.

---

## 🌟 Key Features

1. **True AI Vision Model**: Trained on genuine leaf imagery across 7 distinct agricultural classes (Black Spot, Downy Mildew / Mosaic, Early Leaf Spot, Healthy Foliage, Late Leaf Spot, Nutrition Deficiency, Rust).
2. **Dual Bioclimatic Attribution Engine**: Computes Vapor Pressure Deficit (VPD) and Pathogen Moisture Envelope Risk without altering the authoritative neural classification.
3. **Multilingual Speech Synthesis**: Interactive voice readout of diagnostic guidance in English, Telugu, and Hindi.
4. **Offline First Mobile APK**: Full Android release APK built with Capacitor.
5. **1-Click Netlify / Vercel Deployment**: Pre-configured `netlify.toml`, `_redirects`, and `vercel.json`.

---

## Technical Architecture Overview

- **Mobile & Web Client**: React 19 powered by Vite with Tailwind-inspired responsive mobile design.
- **Node.js Express Gateway**: REST API managing uploads, historical persistence (`server/db.json`), and bioclimatic physics computation.
- **Python ML Microservice**: Real-time PyTorch MobileNetV3-Small inference microservice running on port 5001.

---

## 🚀 1-Click Netlify Deployment

Click the button below to deploy this repository to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/RaghavaAkkinepally-ARK/agrosense-ai)

Or follow the quick manual deployment steps in Section 3.
   - **`http://<YOUR_LAN_IP>:3001`**: For physical Android USB testing connected to the same Wi-Fi router.

2. React services resolve imports automatically using the built-in system selector:
   ```javascript
   import { getApiUrl } from './services/config';
   ```

---

## 3. UI Features & Mobile Native Capabilities

1. **Native Camera & Gallery Prompts**: In native platforms, clicking the drag-and-drop foliar upload dropzone launches the native device camera selection sheet using Capacitor. In regular web runtimes, it falls back to standard file browser uploads.
2. **Dynamic Server Status Indicator**: Displays a status capsule (`API Online` / `API Offline`) next to the brand logo. Connective health checks run in the background on a 10-second polling timer.
3. **Touch-Screen UI Layouts**: Spacers, padding ratios, and grids scale down automatically in CSS media rules under `600px` screen widths. Click prompts and action sheets are expanded to a tactile minimum target size of `48px`.

---

## 4. Compiling the Android APK

Ensure you have Android Studio installed with appropriate platform SDK modules.

### Step A: Bundle Static Assets
Build the optimized web build directory:
```bash
npm run build
```

### Step B: Sync with Capacitor Android platform
Sync client-side builds and configurations down to the native Android folder:
```bash
npx cap sync android
```

### Step C: Build Debug APK from CLI
Verify code builds and package the APK using the gradle wrapper:
```bash
cd android
./gradlew assembleDebug
```
The built APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Step D: Build Signed Release APK
Generate the signed release bundle:
```bash
./gradlew assembleRelease
```
The configurations are pre-mapped against the securely bundled keystore file coordinates:
- **Keystore Target**: `android/app/release.keystore`
- **Keystore Password**: `agrosense123`
- **Key Alias**: `agrosense`
- **Alias Password**: `agrosense123`

---

## 5. Running and Troubleshooting

- **Check API Status**: Point your web browser to `http://localhost:3001/api/status` to ensure the server is responsive.
- **Port Conflict**: If port `3001` is taken, set the environment port variable or update file configurations in `server/server.js`.
