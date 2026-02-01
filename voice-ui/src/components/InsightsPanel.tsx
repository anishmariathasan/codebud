import React, { useState } from 'react';
import { generateInsights, InsightData } from '../services/gemini';
import { TranscriptEntry } from './Transcript';
import { Sparkles, AlertTriangle, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';

interface InsightsPanelProps {
    transcript: TranscriptEntry[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ transcript }) => {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await generateInsights(transcript);
            setData(result);
        } catch (err) {
            setError('Failed to generate insights. Check your connection or API key.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        backgroundColor: '#161b22',
        borderRadius: '12px',
        border: '1px solid #30363d',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px',
        color: '#e6edf3',
        fontSize: '16px',
        fontWeight: 600
    };

    const listItemStyle: React.CSSProperties = {
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#c9d1d9',
        borderLeft: '3px solid transparent'
    };

    if (!data && !loading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                textAlign: 'center',
                padding: '40px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(88, 166, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#58a6ff'
                }}>
                    <Sparkles size={40} />
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#e6edf3', marginBottom: '8px' }}>
                        Generate AI Insights
                    </h2>
                    <p style={{ color: '#8b949e', maxWidth: '400px', lineHeight: '1.5' }}>
                        Analyze your coding session transcript to find common errors,
                        improvement areas, and personalized study suggestions.
                    </p>
                </div>
                {transcript.length === 0 && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(210,153,34,0.1)', borderRadius: '8px', color: '#d29922', fontSize: '13px' }}>
                        ⚠️ Start a voice session and chat with CodeBud to populate the transcript first.
                    </div>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={transcript.length === 0}
                    style={{
                        backgroundColor: '#238636',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: transcript.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: transcript.length === 0 ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'backgroundColor 0.2s'
                    }}
                >
                    <Sparkles size={18} />
                    Generate Insights
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: '#8b949e' }}>
                <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <p>Analyzing transcript with Gemini...</p>
                <style>{`
                    @keyframes spin { 
                        from { transform: rotate(0deg); } 
                        to { transform: rotate(360deg); } 
                    }
                 `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#f85149' }}>
                <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
                <p>{error}</p>
                <button onClick={() => setData(null)} style={{ marginTop: '16px', background: 'transparent', border: '1px solid #30363d', color: '#e6edf3', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#e6edf3', marginBottom: '8px' }}>
                        coding Insights
                    </h2>
                    <p style={{ color: '#8b949e', fontSize: '14px' }}>
                        Powered by Gemini 1.5 Flash
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    style={{
                        backgroundColor: '#1f6feb',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* User Stats */}
                <div style={{
                    ...cardStyle,
                    gridColumn: '1 / -1',
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '32px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#e6edf3' }}>{data?.userStats.sessionsCompleted}</div>
                        <div style={{ color: '#8b949e', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions Analyzed</div>
                    </div>
                    <div style={{ width: '1px', height: '40px', backgroundColor: '#30363d' }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#58a6ff' }}>{data?.userStats.creditsUsed}</div>
                        <div style={{ color: '#8b949e', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credits Used (Est.)</div>
                    </div>
                </div>

                {/* Common Errors */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <AlertTriangle size={20} color="#f85149" />
                        Common Errors
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.commonErrors.map((err, i) => (
                            <div key={i} style={{ ...listItemStyle, borderLeftColor: '#f85149' }}>
                                {err}
                            </div>
                        )) || <p style={{ color: '#8b949e' }}>No common errors detected.</p>}
                    </div>
                </div>

                {/* Areas to Improve */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <TrendingUp size={20} color="#d29922" />
                        Areas to Improve
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.codingAreasToImprove.map((area, i) => (
                            <div key={i} style={{ ...listItemStyle, borderLeftColor: '#d29922' }}>
                                {area}
                            </div>
                        )) || <p style={{ color: '#8b949e' }}>No specific areas identified.</p>}
                    </div>
                </div>

                {/* Suggestions */}
                <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                    <div style={headerStyle}>
                        <BookOpen size={20} color="#3fb950" />
                        Analysis & Suggestions
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {data?.suggestions.map((sug, i) => (
                            <div key={i} style={{
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <strong style={{ color: '#e6edf3', display: 'block', marginBottom: '8px' }}>{sug.title}</strong>
                                <p style={{ color: '#8b949e', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>{sug.description}</p>
                                {sug.codeSnippet && (
                                    <pre style={{
                                        backgroundColor: '#0d1117',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        overflowX: 'auto',
                                        fontSize: '12px',
                                        color: '#c9d1d9',
                                        border: '1px solid #30363d'
                                    }}>
                                        <code>{sug.codeSnippet}</code>
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
