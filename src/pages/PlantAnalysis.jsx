import React, { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import {
  Camera as CameraIcon,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  ShieldCheck,
  HelpCircle,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  CloudRain,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { analyzeCropLeaf } from '../services/aiInference';
import { getApiUrl } from '../services/config';

const STAGE_LABELS = {
  uploading: { label: 'Uploading foliar image...', step: 1 },
  validating: { label: 'Validating image quality & leaf presence...', step: 2 },
  inferring: { label: 'Running deep vision neural network...', step: 3 },
  diagnosing: { label: 'Computing class probabilities & severity...', step: 4 },
  guidance: { label: 'Compiling localized agronomic guidance...', step: 5 }
};

const SENSOR_SPECS = [
  {
    key: 'temperature',
    labelEn: 'Temperature',
    labelTe: 'ఉష్ణోగ్రత',
    labelHi: 'तापमान',
    unit: '°C',
    min: 10,
    max: 50,
    step: 0.5,
    icon: Thermometer
  },
  {
    key: 'humidity',
    labelEn: 'Humidity',
    labelTe: 'గాలిలో తేమ',
    labelHi: 'हवा में नमी',
    unit: '%',
    min: 10,
    max: 100,
    step: 1,
    icon: Droplets
  },
  {
    key: 'soilMoisture',
    labelEn: 'Soil Moisture',
    labelTe: 'నేల తేమ',
    labelHi: 'मिट्टी की नमी',
    unit: '%',
    min: 5,
    max: 80,
    step: 1,
    icon: Droplets
  },
  {
    key: 'lightIntensity',
    labelEn: 'Light Intensity',
    labelTe: 'సూర్యరశ్మి',
    labelHi: 'प्रकाश तीव्रता',
    unit: 'lux',
    min: 2000,
    max: 120000,
    step: 1000,
    icon: Sun
  },
  {
    key: 'canopyTemp',
    labelEn: 'Canopy Temp',
    labelTe: 'ఆకు ఉష్ణోగ్రత',
    labelHi: 'पत्ती तापमान',
    unit: '°C',
    min: 10,
    max: 50,
    step: 0.5,
    icon: Thermometer
  },
  {
    key: 'leafWetness',
    labelEn: 'Leaf Wetness',
    labelTe: 'ఆకు తేమ',
    labelHi: 'पत्ती पर नमी',
    unit: '%',
    min: 0,
    max: 100,
    step: 1,
    icon: Droplets
  },
  {
    key: 'rainfall',
    labelEn: 'Rainfall',
    labelTe: 'వర్షపాతం',
    labelHi: 'वर्षा',
    unit: 'mm',
    min: 0,
    max: 100,
    step: 1,
    icon: CloudRain
  },
  {
    key: 'windSpeed',
    labelEn: 'Wind',
    labelTe: 'గాలి వేగం',
    labelHi: 'हवा की गति',
    unit: 'm/s',
    min: 0,
    max: 25,
    step: 0.5,
    icon: Wind
  }
];

const PRESETS = [
  {
    id: 'normal',
    labelEn: '🌿 Field Standard',
    labelTe: '🌿 సాధారణ వాతావరణం',
    labelHi: '🌿 सामान्य खेत',
    values: {
      temperature: 28,
      humidity: 72,
      soilMoisture: 32,
      lightIntensity: 65000,
      canopyTemp: 27,
      leafWetness: 45,
      rainfall: 0,
      windSpeed: 2.5
    }
  },
  {
    id: 'humid',
    labelEn: '🌧️ Post-Rain / Humid',
    labelTe: '🌧️ వర్షం తర్వాత / అధిక తేమ',
    labelHi: '🌧️ बारिश बाद / आर्द्र',
    values: {
      temperature: 25,
      humidity: 92,
      soilMoisture: 52,
      lightIntensity: 35000,
      canopyTemp: 24,
      leafWetness: 85,
      rainfall: 14,
      windSpeed: 1.5
    }
  },
  {
    id: 'dry',
    labelEn: '☀️ Hot & Dry',
    labelTe: '☀️ ఎండ / పొడి వాతావరణం',
    labelHi: '☀️ गर्म व सूखा',
    values: {
      temperature: 34,
      humidity: 42,
      soilMoisture: 18,
      lightIntensity: 98000,
      canopyTemp: 35,
      leafWetness: 5,
      rainfall: 0,
      windSpeed: 4.2
    }
  }
];

export default function PlantAnalysis({ onAnalysisComplete, isAnalyzing, selectedLanguage = 'en', onLanguageChange }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [imageName, setImageName] = useState('');
  const [currentStage, setCurrentStage] = useState('uploading');
  const [qualityError, setQualityError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [envSensors, setEnvSensors] = useState(PRESETS[0].values);
  const [activePreset, setActivePreset] = useState('normal');
  const [showEnvEditor, setShowEnvEditor] = useState(false);
  const [activeSensorKey, setActiveSensorKey] = useState(null);
  const fileInputRef = useRef(null);

  const handleCapture = async (sourceType = CameraSource.Camera) => {
    setQualityError(null);
    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: sourceType
        });
        if (photo && photo.webPath) {
          const res = await fetch(photo.webPath);
          const blob = await res.blob();
          const file = new File([blob], `leaf-capture-${Date.now()}.${photo.format || 'jpg'}`, {
            type: `image/${photo.format === 'png' ? 'png' : 'jpeg'}`
          });
          setRawFile(file);
          setImagePreview(photo.webPath);
          setImageName(file.name);
        }
      } catch (err) {
        console.warn('[Camera] Capture cancelled or failed:', err);
      }
    } else {
      // In browser / web runtime
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQualityError(null);
      setRawFile(file);
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setRawFile(null);
    setImageName('');
    setQualityError(null);
    setIsProcessing(false);
  };

  const executeAnalysis = async () => {
    if (!rawFile) return;
    setIsProcessing(true);
    setQualityError(null);
    setCurrentStage('uploading');

    try {
      const result = await analyzeCropLeaf(rawFile, selectedLanguage, (stage) => {
        setCurrentStage(stage);
      }, envSensors);
      setIsProcessing(false);
      onAnalysisComplete(result);
    } catch (err) {
      setIsProcessing(false);
      if (err.isQualityError || err.allowRetake) {
        setQualityError({
          type: err.errorType,
          message: err.message,
          metrics: err.metrics
        });
      } else {
        const isNetworkErr = err.message?.toLowerCase().includes('failed to fetch') || err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('timed out');
        if (isNetworkErr) {
          const endpoint = getApiUrl();
          alert(`Server Connection Error: Could not reach the AI backend at:\n${endpoint}\n\nQuick Fix:\nTap the top status badge (where it says 'API Offline') and enter the secure AI tunnel URL:\nhttps://los-fisher-fighter-interval.trycloudflare.com`);
        } else {
          alert(err.message || 'Analysis could not be completed. Please check your network connection.');
        }
      }
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '820px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Hidden File Input for Web Browser */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* Header Banner */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: '0.5rem'
        }}>
          <ShieldCheck size={14} /> GENUINE AI CROP DOCTOR — NO DEMO DATA
        </span>
        <h1 style={{
          fontSize: '1.85rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginTop: '0.25rem'
        }}>
          {selectedLanguage === 'te' ? 'పంట ఆకును స్కాన్ చేయండి' : selectedLanguage === 'hi' ? 'फसल की पत्ती स्कैन करें' : 'Scan Crop Leaf'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0.25rem auto 0' }}>
          Capture or upload a clear foliar photograph. The real deep vision model analyzes pathogen symptoms and calculates infection severity.
        </p>
      </div>

      {/* Language Selector Capsule */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '1.5rem',
        padding: '8px 16px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        width: 'fit-content',
        margin: '0 auto 1.5rem'
      }}>
        <Globe size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Guidance Language:</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { code: 'en', label: 'English' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'hi', label: 'हिन्दी' }
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: selectedLanguage === l.code ? 700 : 500,
                backgroundColor: selectedLanguage === l.code ? 'var(--primary)' : 'transparent',
                color: selectedLanguage === l.code ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Environmental Context Banner & Interactive Pills (Matches Reference Screenshot) */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border-light)',
        padding: '1.25rem 1.25rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Caption matching user screenshot */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '0.85rem'
        }}>
          <span style={{
            fontSize: '0.92rem',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            {selectedLanguage === 'te'
              ? 'బాహ్య రూపం కంటే పర్యావరణ వాతావరణం అదనపు సమాచారాన్ని అందిస్తుంది.'
              : selectedLanguage === 'hi'
              ? 'पर्यावरणीय संदर्भ पौधे के रूप-रंग से परे अतिरिक्त जानकारी जोड़ता है।'
              : 'Environmental context adds information beyond appearance.'}
          </span>
          <button
            onClick={() => setShowEnvEditor(!showEnvEditor)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              backgroundColor: showEnvEditor ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
              color: showEnvEditor ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 650,
              border: '1px solid var(--border-light)',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={14} />
            <span>{showEnvEditor ? 'Hide Manual Inputs' : 'Manual Inputs & Presets'}</span>
          </button>
        </div>

        {/* 8 Sensor Pills Row (Pill design matching uploaded media) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px'
        }}>
          {SENSOR_SPECS.map((s) => {
            const Icon = s.icon;
            const val = envSensors[s.key];
            const label = selectedLanguage === 'te' ? s.labelTe : selectedLanguage === 'hi' ? s.labelHi : s.labelEn;
            const isSelected = activeSensorKey === s.key;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setActiveSensorKey(activeSensorKey === s.key ? null : s.key);
                  setShowEnvEditor(true);
                }}
                title="Click to adjust value"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#14532d',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(20, 83, 45, 0.15)',
                  color: '#14532d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={13} strokeWidth={2.4} />
                </span>
                <span>{label}</span>
                <span style={{
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ffffff',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  marginLeft: '2px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                  {val} {s.unit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expandable Manual Adjustment Panel */}
        {showEnvEditor && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '14px',
            border: '1px solid var(--border-light)',
            padding: '1rem',
            marginTop: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Quick 1-Tap Presets */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
                {selectedLanguage === 'te' ? 'త్వరిత ప్రీసెట్లు:' : selectedLanguage === 'hi' ? 'त्वरित प्रीसेट:' : 'Quick Presets:'}
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setEnvSensors(p.values);
                    setActivePreset(p.id);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: activePreset === p.id ? 700 : 500,
                    backgroundColor: activePreset === p.id ? 'var(--primary)' : 'var(--bg-card)',
                    color: activePreset === p.id ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {selectedLanguage === 'te' ? p.labelTe : selectedLanguage === 'hi' ? p.labelHi : p.labelEn}
                </button>
              ))}
            </div>

            {/* Manual Numeric Inputs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '10px'
            }}>
              {SENSOR_SPECS.map((s) => {
                const Icon = s.icon;
                const val = envSensors[s.key];
                const label = selectedLanguage === 'te' ? s.labelTe : selectedLanguage === 'hi' ? s.labelHi : s.labelEn;
                const isFocused = activeSensorKey === s.key;
                return (
                  <div
                    key={s.key}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isFocused ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                      border: isFocused ? '1.5px solid var(--primary)' : '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon size={12} style={{ color: 'var(--primary)' }} />
                        {label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.unit}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={val}
                        onChange={(e) => {
                          const num = parseFloat(e.target.value);
                          setEnvSensors(prev => ({ ...prev, [s.key]: isNaN(num) ? '' : num }));
                          setActivePreset('custom');
                        }}
                        style={{
                          width: '100%',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          fontWeight: 700
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={val || s.min}
                      onChange={(e) => {
                        setEnvSensors(prev => ({ ...prev, [s.key]: parseFloat(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      style={{ width: '100%', accentColor: 'var(--primary)', height: '4px', cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary Contribution Notice */}
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <Info size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            {selectedLanguage === 'te'
              ? 'పర్యావరణ ప్రభావం తక్కువగా (~15%) పరిగణించబడుతుంది; ప్రధాన రోగ నిర్ధారణ AI విజువల్ మోడల్ (85%) ద్వారా జరుగుతుంది.'
              : selectedLanguage === 'hi'
              ? 'पर्यावरणीय इनपुट का योगदान कम (~15%) है; मुख्य निदान AI विज़न मॉडल (85%) द्वारा किया जाता है।'
              : 'Environmental contribution is secondary (~15% weight) supporting the primary MobileNetV3 visual AI model (85% weight).'}
          </span>
        </div>
      </div>

      {/* Quality / OOD Rejection Warning Banner */}
      {qualityError && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertTriangle size={22} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b' }}>
                {qualityError.type === 'OUT_OF_DISTRIBUTION'
                  ? 'Unsupported Image Content'
                  : 'Image Quality Insufficient for Reliable Analysis'}
              </h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {qualityError.message}
              </p>
              {qualityError.metrics && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  {qualityError.metrics.resolution && (
                    <span>Resolution: {qualityError.metrics.resolution[0]}x{qualityError.metrics.resolution[1]}px</span>
                  )}
                  {qualityError.metrics.blur_variance !== undefined && (
                    <span>Blur Index: {qualityError.metrics.blur_variance} (min 30.0)</span>
                  )}
                  {qualityError.metrics.leaf_pixel_ratio !== undefined && (
                    <span>Foliage Ratio: {Math.round(qualityError.metrics.leaf_pixel_ratio * 100)}%</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleRetake}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 650,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Retake Photo
            </button>
          </div>
        </div>
      )}

      {/* Main Flow: Either Camera Prompts OR Preview/Analysis Execution */}
      {!imagePreview ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: dragging ? '2px dashed var(--primary)' : '2px dashed var(--border-light)',
          borderRadius: '24px',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-sm)'
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const f = e.dataTransfer.files[0];
            setRawFile(f);
            setImageName(f.name);
            const r = new FileReader();
            r.onload = (ev) => setImagePreview(ev.target.result);
            r.readAsDataURL(f);
          }
        }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CameraIcon size={38} strokeWidth={2} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {selectedLanguage === 'te' ? 'పంట ఆకు ఫోటో తీయండి' : selectedLanguage === 'hi' ? 'फसल की पत्ती का फोटो लें' : 'Capture Crop Leaf Photo'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.75rem' }}>
            Hold the phone 15-20 cm from the leaf surface in good lighting. Capture lesions clearly without shaking.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => handleCapture(CameraSource.Camera)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '14px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.1s ease'
              }}
            >
              <CameraIcon size={20} />
              <span>Take Photo</span>
            </button>

            <button
              onClick={() => handleCapture(CameraSource.Photos)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 650,
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <ImageIcon size={20} />
              <span>Choose from Gallery</span>
            </button>
          </div>
        </div>
      ) : (
        /* Captured Leaf Preview Card */
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Leaf Photo Preview Frame */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxHeight: '440px',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img
              src={imagePreview}
              alt="Leaf to analyze"
              style={{
                maxWidth: '100%',
                maxHeight: '440px',
                objectFit: 'contain'
              }}
            />

            {/* In-photo Badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {imageName || 'Captured Leaf Image'}
            </div>
          </div>

          {/* Action Footer or Live Progress Tracker */}
          <div style={{ padding: '1.5rem' }}>
            {isProcessing ? (
              <div style={{
                textAlign: 'center',
                padding: '1rem 0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginBottom: '1rem'
                }}>
                  <Loader2 size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {STAGE_LABELS[currentStage]?.label || 'Processing leaf...'}
                  </span>
                </div>

                {/* Actual Multi-Stage Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${((STAGE_LABELS[currentStage]?.step || 1) / 5) * 100}%`,
                    backgroundColor: 'var(--primary)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Stage {STAGE_LABELS[currentStage]?.step || 1} of 5</span>
                  <span>Direct Python Neural Inference</span>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <button
                  onClick={handleRetake}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 650,
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={18} />
                  <span>Retake Photo</span>
                </button>

                <button
                  onClick={executeAnalysis}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Sparkles size={18} />
                  <span>Analyze Leaf with Real AI</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transparency & Scientific Provenance Note */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <HelpCircle size={20} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Authentic Evaluation Notice:</strong> AgroSense AI uses a lightweight MobileNetV3-Small neural network trained on multi-crop agricultural plant leaf images across 7 foliar disease classes. Predictions reflect genuine classification probabilities. Images failing Laplacian focus or vegetation thresholds are rejected safely.
        </div>
      </div>
    </div>
  );
}
