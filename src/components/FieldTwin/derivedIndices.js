/**
 * AgroSense AI - Bioclimatic & Environmental Derived Indices Engine
 * Agronomic reference models for groundnut (Arachis hypogaea L.)
 */

/**
 * Calculates Vapor Pressure Deficit (VPD) in kiloPascals (kPa)
 * using the Tetens equation for saturation vapor pressure.
 * 
 * es = 0.61078 * exp((17.27 * T) / (T + 237.3))
 * ea = es * (RH / 100)
 * VPD = es - ea
 */
export function calculateVPD(temperatureC, relativeHumidityPct) {
  const T = Number(temperatureC);
  const RH = Number(relativeHumidityPct);
  
  if (isNaN(T) || isNaN(RH)) return { vpd: 0, status: 'Normal', color: '#10b981' };

  const es = 0.61078 * Math.exp((17.27 * T) / (T + 237.3));
  const ea = es * (Math.min(100, Math.max(0, RH)) / 100);
  const vpd = Math.max(0, es - ea);
  const vpdRounded = Math.round(vpd * 100) / 100;

  // Groundnut physiological interpretation:
  // < 0.4 kPa: Very low VPD (high fungal risk, reduced transpiration, guttation)
  // 0.4 - 1.2 kPa: Optimal stomatal conductance and photosynthesis
  // 1.2 - 2.0 kPa: Moderate atmospheric dryness / mild stress
  // > 2.0 kPa: High atmospheric water stress (stomatal closure, wilting risk)
  let status = 'Optimal';
  let color = '#10b981'; // Green
  let interpretation = 'Healthy stomatal transpiration rate; ideal for groundnut vegetative and reproductive growth.';

  if (vpdRounded < 0.4) {
    status = 'Low (Fungal Risk)';
    color = '#f59e0b'; // Amber
    interpretation = 'Excessive atmospheric moisture suppresses transpiration and prolongs foliar wetness, sharply elevating leaf spot and rust spore germination.';
  } else if (vpdRounded > 1.8) {
    status = 'High (Atmospheric Stress)';
    color = '#ef4444'; // Red
    interpretation = 'High vapor pressure deficit triggers guard cell closure, reducing carbon fixation and causing thermal foliage stress.';
  }

  return {
    value: vpdRounded,
    unit: 'kPa',
    status,
    color,
    interpretation
  };
}

/**
 * Calculates Soil Water Stress Index (SWSI)
 * Based on groundnut sandy loam root-zone available water capacity:
 * Field Capacity (FC) ~ 28-32% volumetric water content
 * Permanent Wilting Point (PWP) ~ 10-12%
 */
export function calculateSoilWaterStress(soilMoisturePct) {
  const sm = Number(soilMoisturePct);
  if (isNaN(sm)) return { index: 0, status: 'Normal', color: '#10b981' };

  const PWP = 12.0; // Permanent Wilting Point %
  const FC = 30.0;  // Field Capacity %

  let stressFraction = 0;
  let status = 'Optimal Soil Moisture';
  let color = '#10b981';
  let interpretation = 'Soil water potential facilitates optimal root water and nutrient flux without hypoxic root asphyxiation.';

  if (sm < PWP) {
    stressFraction = 1.0;
    status = 'Severe Water Deficit (Wilting)';
    color = '#ef4444';
    interpretation = 'Soil moisture below permanent wilting point. Cell turgor lost, causing peg abortion and yield crash.';
  } else if (sm < 20.0) {
    stressFraction = Math.round(((20.0 - sm) / (20.0 - PWP)) * 100) / 100;
    status = 'Moderate Drought Stress';
    color = '#f59e0b';
    interpretation = 'Mild-to-moderate deficit; stomatal conductance throttled to conserve moisture.';
  } else if (sm > 45.0) {
    stressFraction = 0.8;
    status = 'Waterlogged / Anaerobic';
    color = '#3b82f6';
    interpretation = 'Soil pores saturated. Hypoxic conditions restrict root respiration and induce iron chlorosis.';
  }

  return {
    index: Math.round(stressFraction * 100),
    unit: '%',
    status,
    color,
    interpretation
  };
}

/**
 * Approximates Photosynthetically Active Radiation (PAR) from sunlight lux
 * Sunlight standard solar constant conversion: ~1 lux ≈ 0.0185 μmol·m⁻²·s⁻¹ PAR (400-700 nm)
 */
export function calculatePAR(lightIntensityLux) {
  const lux = Math.max(0, Number(lightIntensityLux) || 0);
  const par = Math.round(lux * 0.0185);
  
  let status = 'Optimal Solar Flux';
  let color = '#10b981';

  if (par < 200) {
    status = 'Low Light (Sub-saturating)';
    color = '#6b7280';
  } else if (par > 1600) {
    status = 'High Solar Saturation';
    color = '#f59e0b';
  }

  return {
    value: par,
    unit: 'μmol·m⁻²·s⁻¹',
    status,
    color,
    interpretation: `${par} μmol/m²/s of quantum light energy available for Rubisco foliar carbon assimilation.`
  };
}

/**
 * Calculates Growing Degree Days (GDD) / Thermal-time accumulation
 * Groundnut baseline physiological zero temperature: Tbase = 10°C
 */
export function calculateThermalTime(airTempC) {
  const t = Number(airTempC) || 28;
  const tBase = 10.0;
  const gddDaily = Math.max(0, t - tBase);

  return {
    dailyRate: Math.round(gddDaily * 10) / 10,
    unit: '°C·day',
    status: 'Thermal Accumulation Active',
    color: '#8b5cf6',
    interpretation: `At current ambient temperatures, groundnut physiological phenology advances by ${Math.round(gddDaily * 10) / 10} degree-days daily.`
  };
}

/**
 * Calculates Multi-Factor Pathogen Risk Indicator
 * Integrates:
 * - Leaf Wetness Duration / Percentage
 * - Relative Humidity
 * - Canopy and Air Temperatures (Bio-envelope for Puccinia & Cercospora: 20-30°C)
 * - Rainfall
 */
export function calculatePathogenRisk({
  airTemp,
  humidity,
  leafWetness,
  leafTemp,
  rainfall
}) {
  const T = Number(airTemp) || 28;
  const RH = Number(humidity) || 75;
  const LW = Number(leafWetness) || 40;
  const Rain = Number(rainfall) || 0;

  // Temperature favorability: 22°C - 28°C is optimal for fungal sporulation
  let tempFactor = 0;
  if (T >= 20 && T <= 32) {
    tempFactor = 1.0 - Math.abs(T - 26) / 10;
  }

  // Moisture favorability: High leaf wetness (>60%) and high RH (>80%)
  const moistureFactor = Math.min(1.0, (LW / 100) * 0.6 + (RH / 100) * 0.4);
  const rainBonus = Rain > 2 ? 0.2 : (Rain > 0 ? 0.1 : 0);

  const rawScore = Math.min(100, Math.round((tempFactor * 0.45 + moistureFactor * 0.45 + rainBonus) * 100));

  let level = 'Low Infection Pressure';
  let color = '#10b981';
  let primaryThreat = 'None immediate';

  if (rawScore > 75) {
    level = 'Severe Infection Alert';
    color = '#ef4444';
    primaryThreat = 'Late Leaf Spot & Rust Fungal Sporulation';
  } else if (rawScore > 45) {
    level = 'Moderate Pathogen Risk';
    color = '#f59e0b';
    primaryThreat = 'Early Leaf Spot Micro-Lesion Formation';
  }

  return {
    score: rawScore,
    level,
    color,
    primaryThreat,
    interpretation: `Current environmental moisture envelope (${RH}% RH, ${LW}% foliar wetness at ${T}°C) yields an index of ${rawScore}/100 for fungal spore propagation.`
  };
}
