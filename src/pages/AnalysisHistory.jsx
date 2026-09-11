import React from 'react';
import { History, Trash2, ExternalLink, Calendar, AlertCircle, Camera, CheckCircle2 } from 'lucide-react';

export default function AnalysisHistory({ logs = [], onViewResult, onDeleteLog, onNavigateTo, currentLang = 'en' }) {
    const isTe = currentLang === 'te';
    const isHi = currentLang === 'hi';

    return (
        <div className="animate-fade-in" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                        {isTe ? 'నిర్ధారణ చరిత్ర' : isHi ? 'निदान इतिहास' : 'Diagnostic History'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isTe 
                            ? 'గతంలో విశ్లేషించిన వేరుశనగ ఆకుల రికార్డులు.' 
                            : isHi 
                            ? 'पूर्व में जांची गई मूंगफली पत्तियों का प्रामाणिक रिकॉर्ड।' 
                            : 'Chronological log of verified leaf diagnoses and treatment records.'
                        }
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigateTo('analysis')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={16} /> {isTe ? 'కొత్త స్కాన్' : isHi ? 'नया स्कैन' : 'New Scan'}
                </button>
            </div>

            {logs.length === 0 ? (
                <div className="card text-center" style={{ padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <History size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Leaf Diagnoses Logged</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '450px' }}>
                        Every scan processed by the real PyTorch model will be recorded here with empirical severity and treatment advice.
                    </p>
                    <button className="btn btn-primary" onClick={() => onNavigateTo('analysis')} style={{ marginTop: '0.5rem' }}>
                        Start First Scan
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {logs.map((log) => {
                        const isHealthy = log.status === 'Healthy';
                        const formattedDate = new Date(log.timestamp).toLocaleString();
                        return (
                            <div key={log.id} className="card" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.25rem',
                                borderLeft: `5px solid ${isHealthy ? 'var(--primary)' : 'var(--accent-red)'}`,
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: '240px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                                            {log.status}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {formattedDate}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                        {log.diseaseName}
                                    </h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {log.scientificName && log.scientificName !== 'N/A' && <i>{log.scientificName} · </i>}
                                        Confidence: <strong>{log.confidence}%</strong>
                                        {log.severity && <span> · Affected Area: <strong>{log.severity.affectedPercentage}%</strong></span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => onViewResult(log)}
                                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <ExternalLink size={14} /> View Details
                                    </button>
                                    <button
                                        onClick={() => onDeleteLog(log.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            borderRadius: '6px',
                                            transition: 'color var(--transition-fast)'
                                        }}
                                        title="Delete log"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
