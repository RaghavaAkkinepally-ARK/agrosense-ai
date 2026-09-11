/**
 * AgroSense AI - Universal Crop Agricultural Knowledge Base
 * Scientific protocols covering multiple agricultural crops and pathologies:
 * - ICAR (Indian Council of Agricultural Research)
 * - ICRISAT (International Crops Research Institute for the Semi-Arid Tropics)
 * - TNAU Agritech Portal (Crop Protection & Diagnostic Protocols)
 * - PJTSAU (Professor Jayashankar Telangana State Agricultural University)
 */

export const CROP_KNOWLEDGE_BASE = {
  'Healthy': {
    condition: 'Healthy',
    crop: 'Universal Agricultural Crop',
    pathogen: 'None (Optimal Plant Health)',
    scientificName: 'Optimal Foliar Chlorophyll Integrity',
    symptoms: [
      'Vibrant uniform green foliar pigmentation with no necrotic lesions, rust pustules, or chlorotic mottling.',
      'Smooth, intact leaf margins with normal cell turgidity and active stomatal transpiration.',
      'Optimal physiological canopy development consistent with crop growth stage.'
    ],
    management: [
      'No curative chemical treatment required.',
      'Maintain balanced irrigation schedules; ensure proper drainage to prevent waterlogging.',
      'Apply balanced NPK fertilization tailored to soil fertility analysis.'
    ],
    prevention: [
      'Practice crop rotation with non-host crops to disrupt dormant soil-borne pathogens.',
      'Inspect field borders and lower canopy weekly, especially following high-humidity or rainy spells.'
    ],
    monitoring: 'Weekly routine visual crop scouting across representative field quadrants.',
    chemicalGuidance: 'No chemical intervention required or advised for healthy crop foliage.',
    chemicalSafetyDisclaimer: 'Avoid prophylactic pesticide sprays to preserve beneficial phyllosphere microflora and pollinators.',
    sources: [
      {
        title: 'Universal Crop Production and Health Guide',
        institution: 'ICAR National Agricultural Guidance',
        url: 'https://icar.org.in'
      },
      {
        title: 'Integrated Foliar Disease Management',
        institution: 'TNAU Agritech Portal',
        url: 'http://agritech.tnau.ac.in'
      }
    ]
  },
  'Early Leaf Spot': {
    condition: 'Early Leaf Spot',
    crop: 'Foliar Agricultural Crop',
    pathogen: 'Fungal (Cercospora spp. / Alternaria spp.)',
    scientificName: 'Cercospora / Alternaria zonate foliar pathogen',
    symptoms: [
      'Circular to sub-circular brown to reddish-brown necrotic spots (1 to 10 mm diameter) on the upper leaf epidermis.',
      'Prominent bright yellow chlorotic halo surrounding each necrotic lesion.',
      'Premature defoliation of lower leaves under persistent leaf wetness and moderate temperatures (22-28°C).'
    ],
    management: [
      'Maintain adequate plant-to-plant spacing to facilitate canopy ventilation and decrease microclimate humidity.',
      'Prune and safely destroy heavily infected lower leaves during early focal outbreaks.',
      'Apply bio-agent spray with Neem Seed Kernel Extract (NSKE 5%) or Trichoderma harzianum formulation.'
    ],
    prevention: [
      'Use certified disease-free seeds treated with Trichoderma viride @ 4 g/kg or Thiram @ 3 g/kg seed before sowing.',
      'Implement seasonal crop rotation with non-host cereals or pulses.',
      'Deep summer ploughing to bury crop residues and overwintering fungal spores.'
    ],
    monitoring: 'Scout lower leaf layers every 5-7 days after rainfall or when relative humidity exceeds 80%.',
    chemicalGuidance: 'Foliar spray with Mancozeb 75% WP @ 1000 g/ha (2-2.5 g/L water) or Carbendazim 50% WP @ 500 g/ha (1 g/L water) at 10-14 day intervals upon initial spot appearance.',
    chemicalSafetyDisclaimer: 'Follow local agricultural extension recommendations. Observe 14-day pre-harvest intervals. Wear protective gloves and mask when spraying.',
    sources: [
      {
        title: 'Foliar Leaf Spot Diagnosis & Containment Manual',
        institution: 'ICAR / ICRISAT Collaborative Bulletin',
        url: 'https://www.icrisat.org'
      },
      {
        title: 'Plant Pathology Extension Guide - Leaf Spot Diseases',
        institution: 'PJTSAU Hyderabad',
        url: 'https://pjtsau.edu.in'
      }
    ]
  },
  'Late Leaf Spot': {
    condition: 'Late Leaf Spot',
    crop: 'Foliar Agricultural Crop',
    pathogen: 'Fungal (Phaeoisariopsis spp. / Nothopassalora spp.)',
    scientificName: 'Phaeoisariopsis personata / Nothopassalora spp.',
    symptoms: [
      'Nearly circular dark brown to carbon-black lesions (1 to 6 mm) appearing heavily on both leaf surfaces.',
      'Yellow chlorotic halos are minimal or diffuse compared to Early Leaf Spot.',
      'Concentric rings of fungal fruiting bodies visible on lower leaf surfaces under magnification.',
      'Rapid canopy defoliation from base upwards, leaving denuded stems and reducing yields.'
    ],
    management: [
      'Avoid evening overhead sprinkler irrigation to minimize nocturnal foliar wetness.',
      'Collect and destroy infected foliar debris post-harvest to reduce primary inoculum reservoirs.',
      'Spray Pseudomonas fluorescens @ 2.5 kg/ha in 500 L water at 15-day intervals.'
    ],
    prevention: [
      'Cultivate disease-tolerant crop cultivars recommended by national research institutes.',
      'Maintain balanced fertilizer application; avoid excess nitrogen which induces lush susceptible foliage.'
    ],
    monitoring: 'Inspect canopy during mid-to-late vegetative stages when relative humidity exceeds 85%.',
    chemicalGuidance: 'Spray Hexaconazole 5% EC @ 1000 ml/ha (2 ml/L water) or Chlorothalonil 75% WP @ 1000 g/ha (2 g/L) or Tebuconazole 25.9% EC @ 500-750 ml/ha.',
    chemicalSafetyDisclaimer: 'Use only registered fungicides. Wear protective gear and observe recommended withholding safety periods.',
    sources: [
      {
        title: 'Foliar Fungal Blight and Leaf Spot Management',
        institution: 'ICAR Research Manual',
        url: 'https://icar.org.in'
      }
    ]
  },
  'Rust': {
    condition: 'Rust',
    crop: 'Foliar Agricultural Crop',
    pathogen: 'Fungal (Puccinia spp. / Uromyces spp.)',
    scientificName: 'Puccinia spp. / Uromyces foliar rust',
    symptoms: [
      'Dense clusters of raised reddish-brown to dark chestnut pustules (uredinia) on leaf surfaces.',
      'Pustules rupture releasing powdery masses of airborne spores that smudge fingers on touch.',
      'Infected leaves curl, scorch, and suffer severe premature defoliation under warm, humid conditions.',
      'Dramatically impairs photosynthesis and dry matter accumulation, resulting in substantial yield loss.'
    ],
    management: [
      'Promptly remove and safely burn heavily infected leaves from isolated infection foci.',
      'Drain standing surface water immediately from crop furrows to lower ambient humidity.'
    ],
    prevention: [
      'Plant rust-tolerant crop cultivars certified by regional agricultural universities.',
      'Intercrop with barrier crops (sorghum, maize, or pigeonpea at 3:1 row ratio) to block windborne fungal spores.'
    ],
    monitoring: 'Daily scouting during warm (22-30°C), humid or overcast weather phases.',
    chemicalGuidance: 'Apply Tebuconazole 25.9% EC @ 500-750 ml/ha (1-1.5 ml/L water) or Propiconazole 25% EC @ 500 ml/ha (1 ml/L water). Ensure thorough spray coverage.',
    chemicalSafetyDisclaimer: 'Strictly follow CIBRC registered dosage limits. Wear safety mask and eye protection during application.',
    sources: [
      {
        title: 'Epidemiology and Management of Crop Rust Diseases',
        institution: 'ICAR / ICRISAT Collaborative Monograph',
        url: 'https://www.icrisat.org'
      },
      {
        title: 'Crop Rust Diagnostic Advisory',
        institution: 'PJTSAU Hyderabad',
        url: 'https://pjtsau.edu.in'
      }
    ]
  },
  'Black Spot': {
    condition: 'Black Spot',
    crop: 'Foliar Crops & Ornamental / Horticulture Plants',
    pathogen: 'Fungal (Diplocarpon rosae / Alternaria / Septoria spp.)',
    scientificName: 'Diplocarpon rosae Wolf / Septoria foliar complex',
    symptoms: [
      'Distinct circular black to dark-brown spots with irregular, feathery or fringed margins on upper leaf surfaces.',
      'Foliage around the black spots turns chlorotic bright yellow, spreading outward from lesions.',
      'Severe progressive leaf drop starting from lower branches and moving upward, leaving bare canes and stems.',
      'Weakens plant vitality and stunts flowering and vegetative vigor.'
    ],
    management: [
      'Rake and dispose of all fallen diseased leaves; do not compost infected foliage.',
      'Prune lower stems and branches to improve air circulation and prevent soil-splash spore transmission.',
      'Water at the base of plants in early morning so foliage dries quickly during the day.'
    ],
    prevention: [
      'Choose black spot resistant cultivars or varieties suited to humid climates.',
      'Apply preventive bio-fungicide sprays with Bacillus subtilis or potassium bicarbonate solutions.',
      'Maintain adequate spacing between plants to maximize sunlight and airflow.'
    ],
    monitoring: 'Scout foliage weekly, especially during warm rainy periods with leaf wetness exceeding 7 hours.',
    chemicalGuidance: 'Apply Chlorothalonil 75% WP @ 2 g/L or Myclobutanil 10% WP @ 1 g/L or Mancozeb 75% WP @ 2.5 g/L at 10-14 day intervals during wet weather.',
    chemicalSafetyDisclaimer: 'Wear rubber gloves and protective goggles. Avoid spraying during high midday temperatures to prevent foliar burn.',
    sources: [
      {
        title: 'Identification and Integrated Control of Black Spot Disease',
        institution: 'ICAR-IIHR (Indian Institute of Horticultural Research)',
        url: 'https://iihr.icar.gov.in'
      },
      {
        title: 'Horticultural Foliar Pathology Advisory',
        institution: 'TNAU Horticulture Portal',
        url: 'http://agritech.tnau.ac.in'
      }
    ]
  },
  'Downy Mildew - Mosaic': {
    condition: 'Downy Mildew - Mosaic',
    crop: 'Cucurbits, Vegetables & Broadleaf Crops',
    pathogen: 'Oomycete / Viral Complex (Pseudoperonospora cubensis / Cucurbit Mosaic Virus)',
    scientificName: 'Pseudoperonospora cubensis / Potyvirus foliar complex',
    symptoms: [
      'Angular chlorotic (yellowish) lesions constrained by leaf veins on the upper leaf surface, creating a mosaic or patchwork pattern.',
      'Purplish-gray downy fungal-like sporulation visible on the underside of leaves during humid mornings.',
      'In viral mosaic phases: vein clearing, blistered surface puckering, leaf distortion, and stunted vine growth.',
      'Lesions rapidly turn necrotic brown under warm dry spells, causing leaves to curl and crisp.'
    ],
    management: [
      'Remove and bury infected vine leaves immediately upon first symptom detection.',
      'Switch strictly to drip irrigation; avoid overhead watering that splashes zoospores between leaves.',
      'Control sap-sucking insect vectors (aphids, whiteflies) using yellow sticky traps and neem oil sprays (5 ml/L).'
    ],
    prevention: [
      'Plant certified disease-resistant hybrid varieties with tolerance to downy mildew and mosaic viruses.',
      'Eradicate weed hosts and wild cucurbits around field borders that harbor viral reservoirs.',
      'Practice minimum 3-year crop rotation with non-cucurbit crops.'
    ],
    monitoring: 'Inspect undersides of older leaves twice weekly during morning dew hours.',
    chemicalGuidance: 'Spray Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2 g/L or Copper Oxychloride 50% WP @ 3 g/L.',
    chemicalSafetyDisclaimer: 'Rotate fungicide modes of action (FRAC codes) to prevent resistance build-up. Adhere strictly to pre-harvest intervals.',
    sources: [
      {
        title: 'Cucurbit Disease Identification and Eco-Friendly Management',
        institution: 'ICAR-IIVR (Indian Institute of Vegetable Research)',
        url: 'https://iivr.icar.gov.in'
      },
      {
        title: 'Foliar Downy Mildew and Viral Complex Management',
        institution: 'PJTSAU Horticultural Extension',
        url: 'https://pjtsau.edu.in'
      }
    ]
  },
  'Nutrition Deficiency': {
    condition: 'Nutrition Deficiency',
    crop: 'Universal Agricultural Crop',
    pathogen: 'Abiotic / Physiological (Nutrient Imbalance / Soil pH Lockout)',
    scientificName: 'Abiotic Physiological Foliar Disorder',
    symptoms: [
      'Interveinal chlorosis (prominent yellowing between green veins) signaling Iron (Fe), Magnesium (Mg), or Manganese (Mn) deficiency.',
      'Generalized pale yellow-green leaves and stunted crop stature indicating Nitrogen (N) deficiency.',
      'Purpling of lower leaves and petioles indicating Phosphorus (P) deficiency.',
      'Marginal scorching, apical leaf cupping, and tip necrosis indicating Potassium (K) or Calcium (Ca) deficiency.'
    ],
    management: [
      'Foliar spray for micronutrient chlorosis: Spray Ferrous Sulphate (0.5%) + Citric Acid (0.1%) or Chelated Micronutrient formulation twice at 10-day intervals.',
      'Soil amendment: Apply recommended gypsum, lime, or compost based on soil pH and electrical conductivity testing.',
      'Foliar spray for general vigor: Apply 19:19:19 water-soluble NPK @ 5 g/L water during active vegetative growth.'
    ],
    prevention: [
      'Conduct comprehensive soil testing prior to each cropping season to identify nutrient deficiencies and pH imbalances.',
      'Incorporate well-rotted Farmyard Manure (FYM) or vermicompost @ 10-12 tonnes/ha during land preparation.',
      'Maintain balanced drip fertigation schedules to avoid nutrient leaching and root stress.'
    ],
    monitoring: 'Inspect youngest emerging terminal leaves for micronutrients and older lower leaves for macronutrients.',
    chemicalGuidance: 'Apply balanced fertilizer amendments according to Soil Test Crop Response (STCR). Do not apply chemical pesticides for physiological chlorosis.',
    chemicalSafetyDisclaimer: 'Adhere to recommended foliar nutrient concentrations. Higher concentrations cause foliar chemical scorch.',
    sources: [
      {
        title: 'Foliar Nutrient Deficiency Diagnosis in Field Crops',
        institution: 'ICAR - Indian Institute of Soil Science',
        url: 'https://iiss.icar.gov.in'
      },
      {
        title: 'Diagnostic Visual Guide for Crop Micronutrient Deficiencies',
        institution: 'TNAU Soil Science Portal',
        url: 'http://agritech.tnau.ac.in'
      }
    ]
  }
};

export const GROUNDNUT_KNOWLEDGE_BASE = CROP_KNOWLEDGE_BASE;

export function getCropGuidance(condition) {
  return CROP_KNOWLEDGE_BASE[condition] || null;
}

export function getGroundnutGuidance(condition) {
  return getCropGuidance(condition);
}