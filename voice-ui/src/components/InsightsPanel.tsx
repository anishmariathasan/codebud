import React, { useState } from 'react';
import { generateInsights, InsightData } from '../services/gemini';
import { TranscriptEntry } from './Transcript';
import { Sparkles, AlertTriangle, TrendingUp, BookOpen, RefreshCw } from 'lucide-react';

// Pale color palette
const colors = {
    background: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b',
    primary: '#6366f1',
    primaryLight: '#eef2ff',
    success: '#10b981',
    successLight: '#ecfdf5',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    error: '#ef4444',
    errorLight: '#fef2f2',
};

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
        backgroundColor: colors.card,
        borderRadius: '16px',
        border: `1px solid ${colors.cardBorder}`,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px',
        color: colors.text,
        fontSize: '16px',
        fontWeight: 600
    };

    const listItemStyle: React.CSSProperties = {
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        fontSize: '14px',
        color: colors.text,
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
                    backgroundColor: colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.primary
                }}>
                    <Sparkles size={40} />
                </div>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: colors.text, marginBottom: '8px' }}>
                        Generate AI Insights
                    </h2>
                    <p style={{ color: colors.textMuted, maxWidth: '400px', lineHeight: '1.6' }}>
                        Analyze your coding session transcript to find common errors,
                        improvement areas, and personalized study suggestions.
                    </p>
                </div>
                {transcript.length === 0 && (
                    <div style={{ padding: '12px 16px', backgroundColor: colors.warningLight, borderRadius: '10px', color: colors.warning, fontSize: '13px' }}>
                        ⚠️ Start a voice session and chat with CodeBud to populate the transcript first.
                    </div>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={transcript.length === 0}
                    style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: transcript.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: transcript.length === 0 ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
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
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: colors.textMuted }}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Analyzing transcript with Gemini...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.error }}>
                <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
                <p>{error}</p>
                <button onClick={() => setData(null)} style={{ marginTop: '16px', background: colors.card, border: `1px solid ${colors.cardBorder}`, color: colors.text, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 500 }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, color: colors.text, marginBottom: '8px' }}>
                        Coding Insights
                    </h2>
                    <p style={{ color: colors.textMuted, fontSize: '14px' }}>
                        Powered by Gemini 1.5 Flash
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    style={{
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
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
                    padding: '32px',
                    background: `linear-gradient(135deg, ${colors.primaryLight} 0%, #faf5ff 100%)`
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text }}>{data?.userStats.sessionsCompleted}</div>
                        <div style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sessions Analyzed</div>
                    </div>
                    <div style={{ width: '1px', height: '40px', backgroundColor: colors.cardBorder }} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: colors.primary }}>{data?.userStats.creditsUsed}</div>
                        <div style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credits Used (Est.)</div>
                    </div>
                </div>

                {/* Common Errors */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: colors.errorLight }}>
                            <AlertTriangle size={20} color={colors.error} />
                        </div>
                        Common Errors
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.commonErrors.map((err, i) => (
                            <div key={i} style={{ ...listItemStyle, borderLeftColor: colors.error }}>
                                {err}
                            </div>
                        )) || <p style={{ color: colors.textMuted }}>No common errors detected.</p>}
                    </div>
                </div>

                {/* Areas to Improve */}
                <div style={cardStyle}>
                    <div style={headerStyle}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: colors.warningLight }}>
                            <TrendingUp size={20} color={colors.warning} />
                        </div>
                        Areas to Improve
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.codingAreasToImprove.map((area, i) => (
                            <div key={i} style={{ ...listItemStyle, borderLeftColor: colors.warning }}>
                                {area}
                            </div>
                        )) || <p style={{ color: colors.textMuted }}>No specific areas identified.</p>}
                    </div>
                </div>

                {/* Suggestions */}
                <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                    <div style={headerStyle}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: colors.successLight }}>
                            <BookOpen size={20} color={colors.success} />
                        </div>
                        Analysis & Suggestions
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                        {data?.suggestions.map((sug, i) => (
                            <div key={i} style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                padding: '20px',
                                border: `1px solid ${colors.cardBorder}`
                            }}>
                                <strong style={{ color: colors.text, display: 'block', marginBottom: '8px', fontSize: '15px' }}>{sug.title}</strong>
                                <p style={{ color: colors.textMuted, fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>{sug.description}</p>
                                {sug.codeSnippet && (
                                    <pre style={{
                                        backgroundColor: '#1e293b',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        overflowX: 'auto',
                                        fontSize: '12px',
                                        color: '#e2e8f0',
                                        border: 'none'
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
