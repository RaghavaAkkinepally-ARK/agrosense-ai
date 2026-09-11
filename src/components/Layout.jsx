import React, { useState } from 'react';
import { Leaf, Camera, History, BarChart3, HelpCircle, Menu, X, RefreshCw, Box, Globe, Shield } from 'lucide-react';

export default function Layout({ children, activePage, navigateTo, hasLatestResult, backendStatus = 'checking', currentLang = 'en', onLangChange }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { id: 'landing', label: currentLang === 'te' ? 'హోమ్' : (currentLang === 'hi' ? 'होम' : 'Home'), icon: Leaf },
        { id: 'analysis', label: currentLang === 'te' ? 'ఆకు స్కాన్' : (currentLang === 'hi' ? 'पत्ती स्कैन' : 'Scan Leaf'), icon: Camera },
        { id: 'field_twin', label: currentLang === 'te' ? '3D ఫీల్డ్ ట్విన్' : (currentLang === 'hi' ? '3D फील्ड ट्विन' : '3D Field Twin'), icon: Box },
        ...(hasLatestResult ? [{ id: 'results', label: currentLang === 'te' ? 'ఫలితం' : (currentLang === 'hi' ? 'परिणाम' : 'Diagnosis'), icon: RefreshCw }] : []),
        { id: 'history', label: currentLang === 'te' ? 'చరిత్ర' : (currentLang === 'hi' ? 'इतिहास' : 'History'), icon: History },
        { id: 'dashboard', label: currentLang === 'te' ? 'డ్యాష్‌బోర్డ్' : (currentLang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'), icon: BarChart3 },
        { id: 'about', label: currentLang === 'te' ? 'సిస్టమ్ టెక్' : (currentLang === 'hi' ? 'सिस्टम तकनीक' : 'Model & Tech'), icon: HelpCircle }
    ];

    const handleNavClick = (id) => {
        navigateTo(id);
        setIsMenuOpen(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header Navigation */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                backdropFilter: 'blur(8px)',
                transition: 'background-color var(--transition-normal)'
            }}>
                <div className="app-container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '70px'
                }}>
                    {/* Logo Brand & Connection Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleNavClick('landing')}>
                            <div style={{
                                backgroundColor: 'var(--primary-glow)',
                                padding: '8px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary)'
                            }}>
                                <Leaf size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    AgroSense <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>AI</span>
                                </span>
                                <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', marginTop: '-3px' }}>
                                    PRODUCTION AI · DVPS07
                                </span>
                            </div>
                        </div>

                        {/* Connection Pill */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.7rem',
                            fontWeight: 650,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: backendStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : (backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'),
                            color: backendStatus === 'online' ? '#10b981' : (backendStatus === 'offline' ? '#ef4444' : '#f59e0b'),
                            border: `1px solid ${backendStatus === 'online' ? 'rgba(16, 185, 129, 0.2)' : (backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)')}`,
                            marginLeft: '0.5rem',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: backendStatus === 'online' ? '#10b981' : (backendStatus === 'offline' ? '#ef4444' : '#f59e0b'),
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}></span>
                            {backendStatus === 'online' ? 'PyTorch & API Online' : (backendStatus === 'offline' ? 'API Offline' : 'Connecting...')}
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav style={{ display: 'none', alignItems: 'center', gap: '0.35rem' }} className="desktop-nav-container">
                        <style>{`
              @media(min-width: 900px) {
                .desktop-nav-container { display: flex !important; }
                .mobile-toggle { display: none !important; }
              }
            `}</style>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.45rem',
                                        padding: '0.45rem 0.85rem',
                                        border: 'none',
                                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                        borderRadius: '8px',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.85rem',
                                        fontFamily: 'var(--font-heading)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                    className={`nav-btn-${item.id}`}
                                >
                                    <Icon size={15} />
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Language Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem', gap: '4px' }}>
                            <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                            <select
                                value={currentLang}
                                onChange={(e) => onLangChange && onLangChange(e.target.value)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-light)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="en">English</option>
                                <option value="te">తెలుగు (Telugu)</option>
                                <option value="hi">हिन्दी (Hindi)</option>
                            </select>
                        </div>
                    </nav>

                    {/* Mobile Menu Icon Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-toggle">
                        <select
                            value={currentLang}
                            onChange={(e) => onLangChange && onLangChange(e.target.value)}
                            style={{
                                padding: '3px 6px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-light)',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}
                        >
                            <option value="en">EN</option>
                            <option value="te">తెలుగు</option>
                            <option value="hi">हिन्दी</option>
                        </select>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '70px',
                        left: 0,
                        width: '100%',
                        backgroundColor: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-light)',
                        boxShadow: 'var(--shadow-md)',
                        animation: 'fadeIn 0.2s ease-out',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: isActive ? 'var(--primary-glow)' : 'transparent',
                                        color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                                        borderRadius: '8px',
                                        fontWeight: isActive ? 600 : 500,
                                        fontFamily: 'var(--font-heading)',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Main Workspace Frame */}
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="app-container">
                    {children}
                </div>
            </main>

            {/* Footer System Status */}
            <footer style={{
                marginTop: 'auto',
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-light)',
                padding: '1.5rem 0',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
            }}>
                <div className="app-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    textAlign: 'center'
                }}>
                    <div>
                        <strong>AgroSense AI</strong> · Real-World Groundnut Foliar Disease & Microclimate Analytics · DeVert-A-Thon 2026 (DVPS07)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                            PyTorch MobileNetV3 Core Active
                        </span>
                        <span>ICAR-DGR & ICRISAT Integrated Pathology Guidelines</span>
                        <span>Empirical HSV Severity Engine</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Trained on Authentic Mendeley Groundnut Dataset (10,361 images, DOI: 10.17632/22p2vcbxfk.3).
                    </div>
                </div>
            </footer>
        </div>
    );
}
