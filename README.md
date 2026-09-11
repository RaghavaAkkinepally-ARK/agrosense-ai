# AgroSense AI - Groundnut Crop Health Diagnostic Suite

AgroSense AI is a mobile-first, full-stack intelligence system for groundnut crop protective diagnostics. It integrates localized environment readings (temperature, humidity, soil moisture, light intensity) with foliar imagery using a Multimodal Fusion projection model to determine crop health states, pathogen classifications, and recovery interventions.

Implemented as a full-stack native mobile app target using **Vite, React 19, Capacitor, Express, and Multer**.

---

## Technical Architecture Overview

- **Mobile Client**: React 19 powered by Vite compiled under Android Capacitor runtime shell.
- **Express Backend Server**: Custom multipart REST endpoint handling image uploads via Multer and mock database transactions.
- **Mock Database Store**: File-persistable JSON database storage (`server/db.json`) pre-salted with diagnostic history.

---

## Directory Schema structure

```
agrosense-ai/
├── android/               # Native Android Studio Project shell generated via Capacitor CLI
│   └── app/src/main/      # Permissions and native app configurations (AndroidManifest.xml)
├── server/                # Multimodal Express API server & persistent storage
│   ├── server.js          # REST server endpoints & HTTP listeners
│   ├── aiService.js       # Multimodal Fusion Heuristics simulation logic
│   └── db.json            # Database store registry
├── src/                   # Client React Frontend source code
│   ├── components/        # Layout and navigation wrappers
│   ├── pages/             # Dashboard, Analysis Forms, Results, and History
│   └── services/          # Client API fetch calls and environment selectors
└── capacitor.config.json  # Capacitor app build orchestration targets
```

---

## 1. Setup & Backend Installation

To boot up the Express server backend (simulating the server engine on your local desktop/server environment):

```bash
# 1. Install workspace dependencies
npm install

# 2. Boot up the Express REST API backend
node server/server.js
```
The server will bind to `localhost:3001` and expose endpoints for analysis diagnostic uploads at `/api/analyze`, database fetches at `/api/analyses`, and status polling checks at `/api/status`.

---

## 2. API Environment Configurations

For native Android devices or emulators to resolve network requests back to the local host machine, we configure base routing points:

1. Look in the `.env` configuration file in the project folder root:
   ```properties
   VITE_API_BASE_URL=http://10.0.2.2:3001
   ```
   - **`http://10.0.2.2:3001`**: Standard emulator virtual loopback address connecting to the host machines' port `3001`.
   - **`http://localhost:3001`**: For local web-only development.
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
