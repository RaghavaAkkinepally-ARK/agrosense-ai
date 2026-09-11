import React from 'react';
import { ShieldCheck, Cpu, BookOpen, Layers, CheckCircle2, Box, Activity, AlertTriangle } from 'lucide-react';

export default function AboutSystem({ currentLang = 'en' }) {
    const isTe = currentLang === 'te';
    const isHi = currentLang === 'hi';

    return (
        <div className="animate-fade-in" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Page Title */}
            <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                    {isTe ? 'ఆగ్రోసెన్స్ AI టెక్నాలజీ ఆర్కిటెక్చర్' : isHi ? 'AgroSense AI तकनीकी आर्किटेक्चर' : 'AgroSense AI Technical Architecture'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {isTe 
                        ? 'డీప్ లెర్నింగ్, కంప్యూటర్ విజన్ క్వాలిటీ గేట్‌కీపర్ మరియు మైక్రోక్లైమేట్ మల్టీసెన్సార్ ఫ్యూజన్ ఆర్కిటెక్చర్.'
                        : isHi 
                        ? 'डीप लर्निंग मॉडल, कंप्यूटर विजन गुणवत्ता गेटकीपर और माइक्रॉक्लाइमेट मल्टी-सेंसर फ्यूजन का विस्तृत विवरण।'
                        : 'Real-world deep learning, computer vision quality gatekeeping, and microclimate digital twin engineering.'
                    }
                </p>
            </div>

            {/* Production Architecture Banner */}
            <div className="card" style={{
                backgroundColor: 'rgba(5, 150, 105, 0.05)',
                border: '1px solid rgba(5, 150, 105, 0.25)',
                borderLeft: '5px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1.5rem'
            }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    <ShieldCheck size={20} />
                    Production-Grade AI Pipeline Specification (DVPS07)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    AgroSense AI is engineered with <strong>zero simulated or mock heuristics</strong>. All predictions are generated from an actual PyTorch neural network model trained on authentic field imagery:
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <li><strong>Real Dataset:</strong> Mendeley Groundnut Leaf Disease Dataset (DOI: <code>10.17632/22p2vcbxfk.3</code>), 10,361 authentic images captured in Koppal, Karnataka, India.</li>
                    <li><strong>Edge Architecture:</strong> MobileNetV3-Small transfer learning optimized for edge mobile inference (&lt;10MB parameter footprint).</li>
                    <li><strong>6 Verified Foliar Classes:</strong> Healthy, Early Leaf Spot (Cercospora arachidicola), Late Leaf Spot (Phaeoisariopsis personata), Early Rust, Rust (Puccinia arachidis), Nutrition Deficiency.</li>
                    <li><strong>OOD & Blur Rejection:</strong> OpenCV Laplacian variance blur filter (threshold: 80.0) + HSV Green foliar pixel validation (threshold: 5% leaf area).</li>
                    <li><strong>Computer Vision Severity:</strong> HSV color mask segmentation measuring genuine ratio of necrotic/chlorotic lesion pixels to total leaf foliage.</li>
                </ul>
            </div>

            {/* Two-Column Grid: Scientific Background vs Software Architecture */}
            <div className="two-col-layout" style={{ alignItems: 'stretch', gap: '1.5rem' }}>

                {/* LEFT COLUMN: Scientific Pathology Background */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                        Epidemiology & Agronomic Sources
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Groundnut (<i>Arachis hypogaea</i>) disease etiology and management protocols integrated into AgroSense AI are derived directly from authoritative peer-reviewed agricultural research:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>Early Leaf Spot (<i>Cercospora arachidicola</i>)</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                                Source: ICAR-DGR Technical Bulletin. Circular reddish-brown lesions with distinct yellow haloes on upper leaflet surfaces. Triggered by persistent leaf wetness &gt;10 hrs at 25-30°C.
                            </p>
                        </div>

                        <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>Late Leaf Spot (<i>Phaeoisariopsis personata</i>)</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                                Source: ICRISAT Information Bulletin No. 34. Carbon-black spots on lower leaf surface with concentric spore rings. Rapid defoliation in cool, saturated microclimates (20-25°C, RH &gt;90%).
                            </p>
                        </div>

                        <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>Rust (<i>Puccinia arachidis</i>)</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                                Source: TNAU Agritech Portal. Sub-epidermal orange-brown pustules that rupture to discharge windborne urediospores. Synergistic yield loss with leaf spots.
                            </p>
                        </div>

                        <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block', color: 'var(--text-primary)' }}>Nutritional Chlorosis & Deficiencies</strong>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>
                                Source: PJTSAU Groundnut Production Guide. Interveinal chlorosis from Iron (Fe) or Zinc (Zn) deficiency, or pod-fill collapse from Calcium (Gypsum) deficiency.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Microclimate & Digital Twin Architecture */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Box size={18} style={{ color: 'var(--accent-blue)' }} />
                        3D Digital Twin & Sensor Fusion Engine
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        The 3D field visualization renders 8 distributed physical sensor probes streaming telemetry into the central fusion engine:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                            <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-blue)' }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Vapor Pressure Deficit (VPD)</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Computed via the Tetens formulation: <code>VPD = e_sat * (1 - RH / 100)</code>. Indicates transpiration stress and spore germination potential.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                            <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-blue)' }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Soil Water Stress Index</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Evaluated against groundnut sandy loam field capacity (FC=28%) and permanent wilting point (PWP=10%).
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                            <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-blue)' }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Pathogen Risk Index</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Dynamic composite scoring (0-100%) incorporating leaf wetness hours, RH &gt;80%, canopy temperature envelope, and rainfall.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                            <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--accent-blue)' }}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Edge Mobile Deployment</strong>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Packaged with Capacitor for Android native camera hardware access, offline storage, and responsive touch UI.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Citations and Hackathon Note */}
            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    <strong>Scientific Citation:</strong> Manvikar, R., & Reddy, P. (2023). <i>Groundnut Leaf Disease Dataset</i>. Mendeley Data, V3, doi: 10.17632/22p2vcbxfk.3. · ICAR-Directorate of Groundnut Research (ICAR-DGR, Junagadh) · ICRISAT Information Bulletin No. 34.
                </p>
            </div>

        </div>
    );
}
