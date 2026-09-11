import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Activity, Calendar, Camera } from 'lucide-react';

export default function Dashboard({ logs = [], onNavigateTo, currentLang = 'en' }) {
    const isTe = currentLang === 'te';
    const isHi = currentLang === 'hi';

    const totalAnalyses = logs.length;
    const diseaseLogs = logs.filter(l => l.status !== 'Healthy');
    const healthyLogs = logs.filter(l => l.status === 'Healthy');
    const diseaseRate = totalAnalyses > 0 ? (diseaseLogs.length / totalAnalyses) * 100 : 0;

    // Disease counts breakdown
    const diseaseBreakdown = {};
    logs.forEach(l => {
        const name = l.diseaseName || 'Healthy';
        diseaseBreakdown[name] = (diseaseBreakdown[name] || 0) + 1;
    });

    return (
        <div className="animate-fade-in" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                    {isTe ? 'ఫీల్డ్ డ్యాష్‌బోర్డ్' : isHi ? 'फील्ड डैशबोर्ड' : 'Field Disease Surveillance Dashboard'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    {isTe 
                        ? 'నిల్వ చేయబడిన నిజమైన ఆకు పరీక్షల ఆధారంగా వ్యాధి విశ్లేషణ మరియు క్షేత్ర స్థితి.' 
                        : isHi 
                        ? 'वास्तविक पत्ती नमूनों से संकलित रोग ट्रैकिंग व विश्लेषणात्मक अवलोकन।' 
                        : 'Real-time telemetry and pathology distribution compiled from genuine leaf analyses.'
                    }
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="card">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Leaf Records</span>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', margin: '4px 0' }}>
                        {totalAnalyses}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {totalAnalyses > 0 ? 'Verified camera scans' : 'Awaiting first test'}
                    </span>
                </div>

                <div className="card">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pathogen Presence</span>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: diseaseRate > 30 ? 'var(--accent-red)' : 'var(--primary)', display: 'block', margin: '4px 0' }}>
                        {diseaseRate.toFixed(1)}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{diseaseLogs.length} confirmed cases</span>
                </div>

                <div className="card">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Healthy Ratio</span>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '4px 0' }}>
                        {totalAnalyses > 0 ? ((healthyLogs.length / totalAnalyses) * 100).toFixed(1) : 0}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{healthyLogs.length} healthy leaf scans</span>
                </div>

                <div className="card">
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Diagnostic Confidence</span>
                    <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'block', margin: '4px 0' }}>
                        {totalAnalyses > 0 ? (logs.reduce((acc, l) => acc + (l.confidence || 0), 0) / totalAnalyses).toFixed(1) : 0}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PyTorch Softmax probability</span>
                </div>
            </div>

            {/* Pathogen Breakdown & Recent Activity */}
            <div className="two-col-layout" style={{ alignItems: 'start', gap: '1.5rem' }}>
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} style={{ color: 'var(--primary)' }} />
                        Identified Pathogen Distribution
                    </h3>

                    {Object.keys(diseaseBreakdown).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No analysis data yet. Scan a leaf to populate live telemetry.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {Object.entries(diseaseBreakdown).map(([name, count]) => {
                                const pct = ((count / totalAnalyses) * 100).toFixed(1);
                                return (
                                    <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span>{name}</span>
                                            <span>{count} ({pct}%)</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                backgroundColor: name === 'Healthy' ? 'var(--primary)' : 'var(--accent-amber)',
                                                borderRadius: '4px'
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Camera size={18} style={{ color: 'var(--accent-blue)' }} />
                        Action Center
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Detect early asymptomatic lesions before defoliation spreads across your field.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button className="btn btn-primary" onClick={() => onNavigateTo('analysis')} style={{ width: '100%', justifyContent: 'center' }}>
                            <Camera size={18} /> New Leaf Scan
                        </button>
                        <button className="btn btn-secondary" onClick={() => onNavigateTo('field_twin')} style={{ width: '100%', justifyContent: 'center' }}>
                            View 3D Sensor Layer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
