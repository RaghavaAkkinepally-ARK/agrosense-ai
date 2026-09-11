import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  calculateVPD,
  calculateSoilWaterStress,
  calculatePAR,
  calculateThermalTime,
  calculatePathogenRisk
} from './derivedIndices';
import {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Wind,
  CloudRain,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  Sliders,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const SENSOR_METADATA = {
  airTemp: {
    id: 'airTemp',
    name: 'Air Temperature',
    symbol: '🌡️',
    unit: '°C',
    min: 10,
    max: 48,
    step: 0.5,
    default: 28.5,
    hardware: 'Sensirion SHT35 Micro-weather Shield',
    description: 'Ambient air temperature measured at standard 1.5m canopy elevation inside a radiation screen.',
    impact: 'Drives plant metabolic rates, evapotranspiration demand, and fungal spore germination kinetics.'
  },
  humidity: {
    id: 'humidity',
    name: 'Relative Humidity',
    symbol: '💧',
    unit: '%',
    min: 15,
    max: 99,
    step: 1,
    default: 82,
    hardware: 'Sensirion SHT35 High-Precision RH',
    description: 'Atmospheric moisture saturation percentage around the groundnut microclimate.',
    impact: 'RH > 80% is the critical bio-envelope triggering Early and Late Leaf Spot conidia germination.'
  },
  soilMoisture: {
    id: 'soilMoisture',
    name: 'Soil Moisture',
    symbol: '🌱',
    unit: '%',
    min: 5,
    max: 60,
    step: 1,
    default: 34,
    hardware: 'Teros 12 Capacitive FDR Multi-Depth Probe',
    description: 'Volumetric soil water content in the root and pegging zone (0-20 cm depth).',
    impact: 'Crucial for pod calcium uptake; water stress below 15% causes flower and peg abortion.'
  },
  lightIntensity: {
    id: 'lightIntensity',
    name: 'Light Intensity',
    symbol: '☀️',
    unit: 'lux',
    min: 2000,
    max: 120000,
    step: 1000,
    default: 68000,
    hardware: 'Apogee SP-110 Silicon-cell Pyranometer',
    description: 'Total incident solar illuminance flux reaching the upper groundnut canopy.',
    impact: 'Directly powers photosynthetic carbon fixation and accelerates canopy dew evaporation.'
  },
  leafTemp: {
    id: 'leafTemp',
    name: 'Canopy / Leaf Temperature',
    symbol: '🌡️',
    unit: '°C',
    min: 10,
    max: 48,
    step: 0.5,
    default: 27.2,
    hardware: 'Melexis MLX90614 Radiometric IR Sensor',
    description: 'Infrared radiometer non-contact surface temperature of the groundnut foliage.',
    impact: 'Canopy temperature below ambient indicates active transpirational cooling.'
  },
  windSpeed: {
    id: 'windSpeed',
    name: 'Wind Speed',
    symbol: '💨',
    unit: 'm/s',
    min: 0,
    max: 20,
    step: 0.5,
    default: 2.8,
    hardware: 'Davis 6410 3-Cup Optical Anemometer',
    description: 'Horizontal boundary layer wind velocity across the groundnut canopy.',
    impact: 'Air movement disperses Puccinia arachidis rust urediniospores across neighboring rows.'
  },
  rainfall: {
    id: 'rainfall',
    name: 'Rainfall Event',
    symbol: '🌧️',
    unit: 'mm',
    min: 0,
    max: 50,
    step: 1,
    default: 4,
    hardware: 'Texas Electronics TR-525M Tipping Bucket',
    description: 'Cumulative precipitation over the preceding 24-hour observation cycle.',
    impact: 'Rain splash physically detaches fungal spores and provides essential root moisture.'
  },
  leafWetness: {
    id: 'leafWetness',
    name: 'Leaf Wetness',
    symbol: '🌿',
    unit: '%',
    min: 0,
    max: 100,
    step: 1,
    default: 72,
    hardware: 'Decagon PHYTOS 31 Dielectric Surface Grid',
    description: 'Percentage of leaf blade covered by microscopic moisture or dew droplets.',
    impact: 'Over 8-10 continuous hours of leaf wetness (>60%) allows fungal germ-tubes to penetrate stomata.'
  }
};

export default function Field3DCanvas() {
  const mountRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSensorId, setSelectedSensorId] = useState('airTemp');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // Sensor state values
  const [sensorValues, setSensorValues] = useState({
    airTemp: 28.5,
    humidity: 82,
    soilMoisture: 34,
    lightIntensity: 68000,
    leafTemp: 27.2,
    windSpeed: 2.8,
    rainfall: 4,
    leafWetness: 72
  });

  // Calculate derived indicators
  const vpd = calculateVPD(sensorValues.airTemp, sensorValues.humidity);
  const soilStress = calculateSoilWaterStress(sensorValues.soilMoisture);
  const par = calculatePAR(sensorValues.lightIntensity);
  const gdd = calculateThermalTime(sensorValues.airTemp);
  const pathogenRisk = calculatePathogenRisk({
    airTemp: sensorValues.airTemp,
    humidity: sensorValues.humidity,
    leafWetness: sensorValues.leafWetness,
    leafTemp: sensorValues.leafTemp,
    rainfall: sensorValues.rainfall
  });

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const sensorMeshesRef = useRef({});
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.8, 0));
  const cameraLookAtRef = useRef(new THREE.Vector3(0, 0.8, 0));
  const particlesRef = useRef([]);
  const anemometerCupsRef = useRef(null);
  const rainParticlesRef = useRef(null);

  // Handle sensor slider adjustments
  const handleSensorChange = (id, val) => {
    setSensorValues(prev => ({ ...prev, [id]: Number(val) }));
  };

  const resetToOptimal = () => {
    setSensorValues({
      airTemp: 28.0,
      humidity: 65,
      soilMoisture: 32,
      lightIntensity: 65000,
      leafTemp: 27.0,
      windSpeed: 2.2,
      rainfall: 0,
      leafWetness: 25
    });
  };

  const simulateHighFungalRisk = () => {
    setSensorValues({
      airTemp: 26.5,
      humidity: 92,
      soilMoisture: 42,
      lightIntensity: 35000,
      leafTemp: 25.8,
      windSpeed: 3.5,
      rainfall: 18,
      leafWetness: 95
    });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1410);
    scene.fog = new THREE.FogExp2(0x0a1410, 0.045);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 9.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    sunLight.position.set(8, 12, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Central Fusion Engine Glow Light
    const coreLight = new THREE.PointLight(0x10b981, 2.5, 8);
    coreLight.position.set(0, 1.2, 0);
    scene.add(coreLight);

    // 4. Groundnut Field Terrain
    const terrainGeo = new THREE.PlaneGeometry(24, 24, 48, 48);
    // Add agricultural furrow displacement
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const furrow = Math.sin(x * 2.0) * 0.08;
      pos.setZ(i, furrow);
    }
    terrainGeo.computeVertexNormals();

    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d, // Reddish sandy-loam typical of groundnut belts in India
      roughness: 0.9,
      metalness: 0.05
    });
    const terrain = new THREE.Mesh(terrainGeo, soilMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Crop Row Markers (furrow ridges)
    const plantGroup = new THREE.Group();
    for (let row = -3; row <= 3; row++) {
      for (let col = -6; col <= 6; col++) {
        if (Math.abs(row) < 1 && Math.abs(col) < 1) continue; // Skip center for fusion hub

        const plantMesh = createGroundnutPlant();
        plantMesh.position.set(row * 1.5 + (Math.random() * 0.1 - 0.05), 0, col * 0.9 + (Math.random() * 0.1 - 0.05));
        plantMesh.scale.setScalar(0.7 + Math.random() * 0.25);
        plantGroup.add(plantMesh);
      }
    }
    scene.add(plantGroup);

    // 5. Central AGROSENSE AI MULTISENSOR FUSION ENGINE Hub
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, 0);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.8, 1.1, 0.35, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.175;
    hubGroup.add(baseMesh);

    // Glowing Holographic Core
    const coreGeo = new THREE.IcosahedronGeometry(0.45, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 1.1;
    hubGroup.add(coreMesh);

    // Orbiting Ring
    const ringGeo = new THREE.TorusGeometry(0.75, 0.02, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.6 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.position.y = 1.1;
    hubGroup.add(ringMesh);

    scene.add(hubGroup);

    // 6. Sensor 3D Physical Models positioned in field
    const sensorConfigs = [
      { id: 'airTemp', pos: [-3.2, 0, -2.4], color: 0xef4444, builder: buildWeatherMast },
      { id: 'humidity', pos: [-3.2, 0, 2.4], color: 0x3b82f6, builder: buildHygrometer },
      { id: 'soilMoisture', pos: [-1.4, 0, -0.6], color: 0x10b981, builder: buildSoilProbe },
      { id: 'lightIntensity', pos: [3.2, 0, -2.4], color: 0xf59e0b, builder: buildPyranometer },
      { id: 'leafTemp', pos: [1.2, 0, -0.8], color: 0xf97316, builder: buildInfraredRadiometer },
      { id: 'windSpeed', pos: [3.4, 0, 2.2], color: 0x06b6d4, builder: buildAnemometer },
      { id: 'rainfall', pos: [-1.2, 0, 3.2], color: 0x6366f1, builder: buildRainGauge },
      { id: 'leafWetness', pos: [1.4, 0, 1.0], color: 0x84cc16, builder: buildLeafWetnessGrid }
    ];

    const meshesMap = {};
    const particleStreams = [];

    sensorConfigs.forEach(cfg => {
      const mesh = cfg.builder(cfg.color);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.userData = { sensorId: cfg.id };
      scene.add(mesh);
      meshesMap[cfg.id] = mesh;

      // Particle stream from sensor to central fusion hub (y=1.1)
      const stream = createDataStreamParticles(
        new THREE.Vector3(cfg.pos[0], mesh.userData.streamOriginY || 1.0, cfg.pos[2]),
        new THREE.Vector3(0, 1.1, 0),
        cfg.color
      );
      scene.add(stream.mesh);
      particleStreams.push(stream);
    });

    sensorMeshesRef.current = meshesMap;
    particlesRef.current = particleStreams;

    // Rain Particle System
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 16;
      rainPos[i + 1] = Math.random() * 8;
      rainPos[i + 2] = (Math.random() - 0.5) * 16;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.04,
      transparent: true,
      opacity: 0.4
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    rainSystem.visible = false;
    scene.add(rainSystem);
    rainParticlesRef.current = rainSystem;

    // 7. Raycaster for clicking sensors
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickables = Object.values(meshesMap);
      const intersects = raycaster.intersectObjects(clickables, true);

      if (intersects.length > 0) {
        let top = intersects[0].object;
        while (top.parent && top.parent !== scene && !top.userData.sensorId) {
          top = top.parent;
        }
        if (top.userData && top.userData.sensorId) {
          setSelectedSensorId(top.userData.sensorId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate central fusion hub elements
      coreMesh.rotation.y += delta * 0.7;
      coreMesh.rotation.x += delta * 0.3;
      ringMesh.rotation.z += delta * 0.9;

      // Animate particle streams
      particleStreams.forEach(st => {
        st.update(delta);
      });

      // Animate Anemometer cups spinning based on windSpeed
      if (anemometerCupsRef.current) {
        const speed = sensorValues.windSpeed || 2.0;
        anemometerCupsRef.current.rotation.y += delta * (speed * 2.2);
      }

      // Animate Rain
      if (rainParticlesRef.current && sensorValues.rainfall > 0) {
        rainParticlesRef.current.visible = true;
        const positions = rainParticlesRef.current.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * (5 + sensorValues.rainfall * 0.5);
          if (positions[i] < 0) positions[i] = 8;
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (rainParticlesRef.current) {
        rainParticlesRef.current.visible = false;
      }

      // Smooth Camera Lerp
      camera.position.lerp(cameraTargetRef.current, delta * 3.0);
      cameraLookAtRef.current.lerp(
        selectedSensorId && meshesMap[selectedSensorId]
          ? meshesMap[selectedSensorId].position
          : new THREE.Vector3(0, 0.8, 0),
        delta * 3.0
      );
      camera.lookAt(cameraLookAtRef.current);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      }
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update camera target when selectedSensorId changes
  useEffect(() => {
    if (!cameraRef.current) return;
    if (selectedSensorId && sensorMeshesRef.current[selectedSensorId]) {
      const mesh = sensorMeshesRef.current[selectedSensorId];
      const pos = mesh.position;
      // Fly to focus near the sensor
      cameraTargetRef.current.set(pos.x + 1.2, pos.y + 1.6, pos.z + 1.8);
    } else {
      // Default overview
      cameraTargetRef.current.set(0, 6, 9.5);
    }
  }, [selectedSensorId]);

  const activeMeta = SENSOR_METADATA[selectedSensorId] || SENSOR_METADATA.airTemp;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-emerald-900/50 shadow-2xl text-slate-100 flex flex-col font-sans">
      {/* Top Controls & Status Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur border-b border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold tracking-wide text-white">3D Field Multi-Sensor Digital Twin</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PROTOTYPE SIMULATION
              </span>
            </div>
            <p className="text-xs text-slate-400">8 Physical Edge Sensors Streaming to AgroSense Multi-Sensor Fusion Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedSensorId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              !selectedSensorId
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Overview View
          </button>
          <button
            onClick={resetToOptimal}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Optimal Preset</span>
          </button>
          <button
            onClick={simulateHighFungalRisk}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-900/40 border border-amber-500/40 hover:bg-amber-800/40 text-amber-300 transition flex items-center space-x-1"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Simulate Fungal Risk</span>
          </button>
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Parameter Sliders"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive 3D Canvas Area */}
      <div className="relative w-full h-[520px] bg-slate-950">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Bioclimatic Derived Indices Overlay (Top-Left) */}
        <div className="absolute top-4 left-4 max-w-xs w-full bg-slate-900/85 backdrop-blur-md rounded-xl p-3 border border-emerald-900/50 shadow-xl pointer-events-auto space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Derived Bioclimatic Indices
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Vapor Pressure Deficit</div>
              <div className="font-bold text-sm text-white flex items-center gap-1">
                {vpd.value} <span className="text-[10px] text-slate-400">{vpd.unit}</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: vpd.color }}>{vpd.status}</span>
            </div>

            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Pathogen Risk Index</div>
              <div className="font-bold text-sm text-white flex items-center gap-1">
                {pathogenRisk.score} <span className="text-[10px] text-slate-400">/100</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: pathogenRisk.color }}>{pathogenRisk.level}</span>
            </div>

            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Soil Water Stress</div>
              <div className="font-bold text-sm text-white flex items-center gap-1">
                {soilStress.index} <span className="text-[10px] text-slate-400">{soilStress.unit}</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: soilStress.color }}>{soilStress.status}</span>
            </div>

            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Quantum PAR Flux</div>
              <div className="font-bold text-sm text-white flex items-center gap-1">
                {par.value} <span className="text-[9px] text-slate-400">μmol/m²s</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: par.color }}>{par.status}</span>
            </div>
          </div>
        </div>

        {/* Selected Sensor Telemetry Card (Bottom-Left) */}
        {selectedSensorId && (
          <div className="absolute bottom-4 left-4 max-w-sm w-full bg-slate-900/90 backdrop-blur-md rounded-xl p-3.5 border border-emerald-600/50 shadow-2xl pointer-events-auto space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{activeMeta.symbol}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeMeta.name}</h4>
                  <p className="text-[10px] text-emerald-400">{activeMeta.hardware}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-300">
                  {sensorValues[selectedSensorId]} {activeMeta.unit}
                </div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Interactive Node
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-1.5">
              {activeMeta.description}
            </p>
            <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/60">
              <strong className="text-emerald-400">Agronomic Contribution:</strong> {activeMeta.impact}
            </div>
          </div>
        )}

        {/* Floating Quick Sensor Buttons Bar (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 flex flex-wrap max-w-md justify-end gap-1.5 pointer-events-auto">
          {Object.values(SENSOR_METADATA).map(s => {
            const isSelected = selectedSensorId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSensorId(s.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium backdrop-blur transition flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg scale-105'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <span>{s.symbol}</span>
                <span className="hidden sm:inline">{s.name.split(' ')[0]}</span>
                <span className="font-mono text-emerald-300">{sensorValues[s.id]}{s.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Sensor Sliders Drawer */}
      {isConfigOpen && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 z-10 animate-slideDown">
          {Object.values(SENSOR_METADATA).map(s => (
            <div key={s.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <span>{s.symbol}</span> {s.name}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {sensorValues[s.id]} {s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={sensorValues[s.id]}
                onChange={(e) => handleSensorChange(s.id, e.target.value)}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{s.min}{s.unit}</span>
                <span>{s.max}{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 3D Procedural Plant & Sensor Builders ---

function createGroundnutPlant() {
  const group = new THREE.Group();

  // Stem
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.8 });
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.6, 6);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.3;
  stem.castShadow = true;
  group.add(stem);

  // Trifoliate/Tetrafoliate leaf cluster
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, side: THREE.DoubleSide });
  const leafGeo = new THREE.SphereGeometry(0.18, 6, 6);
  leafGeo.scale(1.0, 0.1, 1.8);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.2;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(Math.cos(angle) * 0.22, 0.45 + (i % 2) * 0.08, Math.sin(angle) * 0.22);
    leaf.rotation.set(0.3, angle, 0.4);
    leaf.castShadow = true;
    group.add(leaf);
  }

  return group;
}

function buildWeatherMast(accentColor) {
  const g = new THREE.Group();
  // Pole
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 1.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
  );
  mast.position.y = 0.9;
  mast.castShadow = true;
  g.add(mast);

  // Louvered radiation shield (stacked plates)
  for (let i = 0; i < 5; i++) {
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    plate.position.y = 1.3 + i * 0.05;
    g.add(plate);
  }

  // Beacon Top Light
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: accentColor })
  );
  beacon.position.y = 1.85;
  g.add(beacon);

  g.userData.streamOriginY = 1.85;
  return g;
}

function buildHygrometer(accentColor) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.05, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 })
  );
  pole.position.y = 0.75;
  g.add(pole);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.22, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  head.position.y = 1.45;
  g.add(head);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshBasicMaterial({ color: accentColor })
  );
  led.position.set(0, 1.58, 0);
  g.add(led);

  g.userData.streamOriginY = 1.58;
  return g;
}

function buildSoilProbe(accentColor) {
  const g = new THREE.Group();
  // Probe head housing
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.12, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  head.position.y = 0.25;
  g.add(head);

  // Dual metallic insertion rods penetrating soil
  for (let s of [-0.04, 0.04]) {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 })
    );
    rod.position.set(s, 0.1, 0);
    g.add(rod);
  }

  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: accentColor })
  );
  indicator.position.y = 0.32;
  g.add(indicator);

  g.userData.streamOriginY = 0.32;
  return g;
}

function buildPyranometer(accentColor) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.05, 1.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  stand.position.y = 0.8;
  g.add(stand);

  // Anodized Aluminum Disc Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  base.position.y = 1.6;
  g.add(base);

  // Optical Diffuser Glass Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 })
  );
  dome.position.y = 1.63;
  g.add(dome);

  g.userData.streamOriginY = 1.65;
  return g;
}

function buildInfraredRadiometer(accentColor) {
  const g = new THREE.Group();
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x64748b })
  );
  arm.position.set(0, 0.4, 0);
  arm.rotation.z = 0.3;
  g.add(arm);

  // Sensor barrel aimed downwards
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.14, 10),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
  );
  barrel.position.set(0.15, 0.75, 0);
  barrel.rotation.z = 0.6;
  g.add(barrel);

  g.userData.streamOriginY = 0.75;
  return g;
}

function buildAnemometer(accentColor) {
  const g = new THREE.Group();
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 2.0, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
  );
  mast.position.y = 1.0;
  g.add(mast);

  // Revolving Cups Group
  const cupsGroup = new THREE.Group();
  cupsGroup.position.y = 2.0;

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    rod.rotation.z = Math.PI / 2;
    rod.rotation.y = angle;
    rod.position.set(Math.cos(angle) * 0.11, 0, Math.sin(angle) * 0.11);
    cupsGroup.add(rod);

    const cup = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8, 0, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    cup.position.set(Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22);
    cup.rotation.y = angle;
    cupsGroup.add(cup);
  }

  g.add(cupsGroup);
  g.userData.streamOriginY = 2.0;
  return g;
}

function buildRainGauge(accentColor) {
  const g = new THREE.Group();
  // Cylindrical funnel
  const funnel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.1, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 })
  );
  funnel.position.y = 0.35;
  g.add(funnel);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: accentColor })
  );
  led.position.y = 0.62;
  g.add(led);

  g.userData.streamOriginY = 0.62;
  return g;
}

function buildLeafWetnessGrid(accentColor) {
  const g = new THREE.Group();
  // Flat dielectric leaf clamp
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.015, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.4 })
  );
  board.position.set(0, 0.4, 0);
  board.rotation.set(0.2, 0.3, -0.15);
  g.add(board);

  g.userData.streamOriginY = 0.42;
  return g;
}

// 8. Animated 3D Data Stream Particle Tube
function createDataStreamParticles(fromVec, toVec, colorHex) {
  const particleCount = 20;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  // Curved quadratic trajectory
  const midPoint = new THREE.Vector3().addVectors(fromVec, toVec).multiplyScalar(0.5);
  midPoint.y += 0.8; // arc above field canopy

  const curve = new THREE.QuadraticBezierCurve3(fromVec, midPoint, toVec);
  const offsets = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    offsets[i] = i / particleCount;
    const pt = curve.getPoint(offsets[i]);
    positions[i * 3] = pt.x;
    positions[i * 3 + 1] = pt.y;
    positions[i * 3 + 2] = pt.z;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: colorHex,
    size: 0.09,
    transparent: true,
    opacity: 0.85
  });

  const pointsMesh = new THREE.Points(geo, mat);

  return {
    mesh: pointsMesh,
    update: (delta) => {
      const posAttr = geo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        offsets[i] += delta * 0.4;
        if (offsets[i] > 1) offsets[i] -= 1;
        const pt = curve.getPoint(offsets[i]);
        posAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      posAttr.needsUpdate = true;
    }
  };
}
