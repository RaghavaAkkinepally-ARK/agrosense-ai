import React from 'react';
import { Camera, Box, ShieldCheck, LineChart, Sparkles, ArrowRight, Activity, Volume2, Globe } from 'lucide-react';

export default function LandingPage({ 
    navigateTo, 
    stats = { totalCount: 0, diseaseRate: 0, alertLevel: 'Clear' }, 
    currentLang = 'en' 
}) {
    const isTe = currentLang === 'te';
    const isHi = currentLang === 'hi';

    const safeStats = {
        totalCount: stats?.totalCount ?? 0,
        diseaseRate: stats?.diseaseRate ?? 0,
        alertLevel: stats?.alertLevel ?? 'Clear'
    };

    const cards = [
        {
            title: isTe ? 'నిజమైన డయాగ్నస్టిక్స్' : (isHi ? 'सटीक वास्तविक निदान' : 'Genuine Machine Learning Inference'),
            desc: isTe 
                ? 'శిక్షణ పొందిన మొబైల్‌నెట్ మోడల్ ద్వారా 7 రకాల పంట ఆకు తెగుళ్లను ఖచ్చితంగా గుర్తిస్తుంది.' 
                : (isHi 
                    ? 'प्रशिक्षित MobileNetV3 द्वारा 7 प्रमुख फसल पर्ण रोगों का त्वरित व सटीक वर्गीकरण।' 
                    : 'Classifies authentic multi-crop foliar diseases using PyTorch MobileNetV3 across 7 disease classes.'),
            icon: Camera,
            color: 'var(--primary)',
            bg: 'var(--primary-glow)'
        },
        {
            title: isTe ? '3D డిజిటల్ ట్విన్ & మల్టీసెన్సార్ ఫ్యూజన్' : (isHi ? '3D डिजिटल ट्विन और सेंसर संलयन' : '3D Field Twin & Sensor Fusion'),
            desc: isTe
                ? '8 భౌతిక సెన్సార్ల డేటా ప్రవాహం, VPD, నేల నీటి ఒత్తిడి మరియు పాథోజెన్ రిస్క్ సూచికల ప్రత్యక్ష విజువలైజేషన్.'
                : (isHi
                    ? '8 भौतिक 3D सेंसरों के साथ लाइव माइक्रॉक्लाइमेट मॉनिटरिंग: VPD, मृदा तनाव और रोगज़नक़ जोखिम का रीयल-टाइम विश्लेषण।'
                    : 'Interactive 3D field canopy with 8 live environmental sensors, animated data streams, VPD, Soil Water Stress, and Pathogen Risk indices.'),
            icon: Box,
            color: 'var(--accent-blue)',
            bg: 'rgba(2, 132, 199, 0.15)'
        },
        {
            title: isTe ? 'ప్రాంతీయ భాషల్లో వాయిస్ సలహాలు' : (isHi ? 'स्थानीय भाषाओं में वॉयस मार्गदर्शन' : 'Multilingual ICAR/ICRISAT Treatment'),
            desc: isTe
                ? 'ఐకార్ (ICAR) మరియు ఇక్రిశాట్ (ICRISAT) మార్గదర్శకాల ప్రకారం తెలుగు, హిందీ, ఇంగ్లీష్ భాషల్లో చికిత్సా సలహాలు మరియు ఆడియో వినడం.'
                : (isHi
                    ? 'आईसीएआर और आईसीआरआईएसएटी वैज्ञानिक दिशानिर्देशों पर आधारित उपचार। हिंदी, तेलुगु और अंग्रेजी में वॉयस स्पीच समर्थन।'
                    : 'Empirical HSV severity rating, organic & chemical recommendations from ICAR-DGR/ICRISAT, with native text-to-speech audio in EN/TE/HI.'),
            icon: Volume2,
            color: 'var(--accent-amber)',
            bg: 'rgba(217, 119, 6, 0.15)'
        }
    ];

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

            {/* Hero Banner Grid */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '2.5rem',
                alignItems: 'center',
                padding: '2.5rem',
                borderRadius: 'var(--border-radius-lg)',
                background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(2,132,199,0.08) 100%)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
            }} className="hero-grid">
                <style>{`
          @media(max-width: 850px) {
            .hero-grid { grid-template-columns: 1fr !important; padding: 1.5rem !important; }
            .hero-image-box { display: none !important; }
          }
        `}</style>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                    <div className="badge badge-success" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={13} /> DeVert-A-Thon 2026 · DVPS07
                    </div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>
                        {isTe ? (
                            <>ఆకు ఫోటో తీయండి. <span style={{ color: 'var(--primary)' }}>తెగులును గుర్తించండి.</span> మీ భాషలో సలహా పొందండి.</>
                        ) : isHi ? (
                            <>पत्ती की फोटो खींचें। <span style={{ color: 'var(--primary)' }}>रोग पहचानें।</span> अपनी भाषा में सलाह पाएं।</>
                        ) : (
                            <>Snap a leaf. <span style={{ color: 'var(--primary)' }}>Know the problem.</span> Get the right guidance.</>
                        )}
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.55, maxWidth: '620px' }}>
                        {isTe
                            ? 'నిజమైన కంప్యూటర్ విజన్ మరియు డీప్ లెర్నింగ్ మోడల్ ద్వారా వివిధ పంటల తెగుళ్లు (బ్లాక్ స్పాట్, డౌనీ మిల్డో/మొజాయిక్, ఆకు మచ్చలు, తుప్పు, పోషక లోపాలు) ఖచ్చితంగా విశ్లేషించబడతాయి.'
                            : isHi
                            ? 'वास्तविक मोबाइल कम्प्यूटर विज़न और डीप लर्निंग मॉडल द्वारा विभिन्न फसलों के पर्ण रोगों (ब्लैक स्पॉट, डाउनी मिल्ड्यू, टिक्का, गेरुआ, पोषण कमी) का त्वरित व सटीक परीक्षण।'
                            : 'Authentic edge-ready AI diagnosis for multi-crop foliage. Powered by real PyTorch MobileNetV3 across 7 foliar disease classes with ICAR/ICRISAT treatment guidance in English, Telugu, and Hindi.'
                        }
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => navigateTo('analysis')} style={{ fontSize: '1.05rem', padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Camera size={18} /> {isTe ? 'ఆకును స్కాన్ చేయండి' : isHi ? 'पत्ती स्कैन करें' : 'Scan Crop Leaf'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigateTo('field_twin')} style={{ fontSize: '1.05rem', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Box size={18} /> {isTe ? '3D ఫీల్డ్ ట్విన్ చూడండి' : isHi ? '3D डिजिटल ट्विन' : 'Explore 3D Field Twin'}
                        </button>
                    </div>
                </div>

                {/* Hero Decorative Art Panel */}
                <div className="hero-image-box" style={{
                    position: 'relative',
                    height: '290px',
                    width: '100%',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--border-radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                            PYTORCH MOBILENETV3 INFERENCE
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 2s infinite' }}></span>
                            ACTIVE
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TARGET CROP PROFILE</div>
                        <div style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Multi-Crop Agricultural Foliage
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            7 Real Classes: Black Spot, Downy Mildew/Mosaic, ELS, LLS, Rust, Nutrition Deficiency, Healthy
                        </div>
                        <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--primary) 0%, rgba(16,185,129,0.1) 100%)', borderRadius: '2px', marginTop: '4px' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', textAlign: 'left' }}>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>AIR TEMP</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>28.5 °C</span>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>REL. HUMIDITY</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>84.0 %</span>
                        </div>
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '6px 8px', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>VPD INDICE</span>
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>0.62 kPa</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Numerical Stats Overview */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ textAlign: 'left', fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                    {isTe ? 'క్షేత్ర విశ్లేషణ స్థితి' : isHi ? 'फील्ड डायग्नोस्टिक्स स्थिति' : 'Field Diagnostics Real-Time Ledger'}
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                    textAlign: 'left'
                }}>
                    <div className="card">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                            {isTe ? 'విశ్లేషించిన ఆకులు' : isHi ? 'परीक्षित पत्तियां' : 'Leaves Evaluated'}
                        </span>
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>
                            {safeStats.totalCount}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {safeStats.totalCount === 0 ? 'Ready for first scan' : 'Stored genuine records'}
                        </span>
                    </div>
                    <div className="card">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                            {isTe ? 'తెగులు వ్యాప్తి రేటు' : isHi ? 'रोग संक्रमण दर' : 'Infection Rate'}
                        </span>
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-red)', display: 'block', margin: '4px 0' }}>
                            {safeStats.diseaseRate.toFixed(1)}%
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From genuine leaf tests</span>
                    </div>
                    <div className="card">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                            {isTe ? 'హెచ్చరిక స్థాయి' : isHi ? 'अलर्ट स्तर' : 'Bio-Risk Alert Level'}
                        </span>
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: safeStats.alertLevel === 'High' ? 'var(--accent-red)' : (safeStats.alertLevel === 'Medium' ? 'var(--accent-amber)' : 'var(--primary)'), display: 'block', margin: '4px 0' }}>
                            {safeStats.alertLevel}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on leaf + microclimate</span>
                    </div>
                    <div className="card">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                            {isTe ? 'శిక్షణ డేటాసెట్' : isHi ? 'प्रशिक्षण डेटासेट' : 'Training Dataset'}
                        </span>
                        <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'block', margin: '4px 0' }}>
                            10,361
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mendeley Authentic Images</span>
                    </div>
                </div>
            </section>

            {/* Core Tech Cards Section */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', alignItems: 'flex-start' }}>
                            <div style={{
                                backgroundColor: card.bg,
                                color: card.color,
                                padding: '10px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Icon size={22} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{card.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</p>
                        </div>
                    );
                })}
            </section>

            {/* Process Tutorial Map */}
            <section style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                padding: '2.5rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--border-radius-md)',
                textAlign: 'left'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
                        {isTe ? 'ఆగ్రోసెన్స్ AI ఎలా పనిచేస్తుంది?' : isHi ? 'AgroSense AI कैसे काम करता है?' : 'How AgroSense AI Operates'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isTe ? 'ఖచ్చితమైన ఫలితాల కోసం 3 సులభ దశలు' : isHi ? 'सटीक निदान के 3 आसान कदम' : '3 simple steps for real-world crop protection'}
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.75rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            1
                        </div>
                        <h4 style={{ fontWeight: 600 }}>
                            {isTe ? 'ఆకు ఫోటో తీయండి' : isHi ? 'पत्ती की तस्वीर लें' : '1. Capture Leaf Photo'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isTe
                                ? 'ఫోన్ కెమెరా లేదా అప్‌లోడ్ ద్వారా స్పష్టమైన వేరుశనగ ఆకును తీయండి. కంప్యూటర్ విజన్ ఆటోమేటిక్‌గా బ్లర్ మరియు కాంతిని పరీక్షిస్తుంది.'
                                : isHi
                                ? 'अपने कैमरे से मूंगफली की पत्ती की स्पष्ट फोटो लें। गुणवत्ता परीक्षक धुंधली या खराब तस्वीरों को तुरंत जांचता है।'
                                : 'Take a photo via phone camera or upload. Laplacian variance & foliar HSV masks reject blurry or non-leaf photos.'
                            }
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            2
                        </div>
                        <h4 style={{ fontWeight: 600 }}>
                            {isTe ? 'డీప్ లెర్నింగ్ విశ్లేషణ' : isHi ? 'डीप लर्निंग और सेवरिटी' : '2. PyTorch ML Inference'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isTe
                                ? 'మొబైల్‌నెట్ మోడల్ 6 తరగతులలో సంభావ్యతను గణిస్తుంది. HSV లీషన్ సెగ్మెంటేషన్ ద్వారా వ్యాధి తీవ్రత శాతం లెక్కించబడుతుంది.'
                                : isHi
                                ? 'MobileNetV3 मॉडल 6 प्रामाणिक वर्गों में सटीक पहचान करता है और HSV सेगमेंटेशन से वास्तविक क्षति प्रतिशत मापता है।'
                                : 'MobileNetV3 predicts disease class probabilities while HSV pixel segmentation measures actual necrotic lesion area %.'
                            }
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            3
                        </div>
                        <h4 style={{ fontWeight: 600 }}>
                            {isTe ? 'మీ భాషలో చికిత్స' : isHi ? 'स्थानीय भाषा में उपचार' : '3. Localized Guidance & Voice'}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {isTe
                                ? 'ఐకార్ & ఇక్రిశాట్ మార్గదర్శకాలతో సేంద్రీయ మరియు రసాయన చికిత్సలు పొందండి, వాయిస్ స్పీచ్ ద్వారా వినండి.'
                                : isHi
                                ? 'आईसीएआर और आईसीआरआईएसएटी समर्थित जैविक व रासायनिक उपचार सलाह पाएं और हिंदी आवाज में सुनें।'
                                : 'Receive ICAR-DGR/ICRISAT organic and chemical remedies in English, Telugu, or Hindi with built-in voice narration.'
                            }
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}
