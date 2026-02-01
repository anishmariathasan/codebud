import React from 'react';
import { LayoutDashboard, Mic, Settings } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentTab: 'live' | 'insights';
    onTabChange: (tab: 'live' | 'insights') => void;
}

// Pale color palette
const colors = {
    background: '#f8fafc',       // Slate-50
    sidebar: '#ffffff',          // Pure white
    sidebarBorder: '#e2e8f0',    // Slate-200
    text: '#1e293b',             // Slate-800
    textMuted: '#64748b',        // Slate-500
    primary: '#6366f1',          // Indigo-500
    primaryLight: '#eef2ff',     // Indigo-50
    accent: '#8b5cf6',           // Violet-500
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentTab, onTabChange }) => {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: colors.background,
            color: colors.text,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            overflow: 'hidden'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: colors.sidebar,
                borderRight: `1px solid ${colors.sidebarBorder}`,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
                boxShadow: '2px 0 8px rgba(0,0,0,0.03)'
            }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '4px'
                    }}>CodeBud</h1>
                    <p style={{ fontSize: '13px', color: colors.textMuted }}>AI Pair Programmer</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <SidebarItem
                        icon={<Mic size={20} />}
                        label="Live Session"
                        isActive={currentTab === 'live'}
                        onClick={() => onTabChange('live')}
                    />
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Insights"
                        isActive={currentTab === 'insights'}
                        onClick={() => onTabChange('insights')}
                    />
                </nav>

                <div style={{ marginTop: 'auto', borderTop: `1px solid ${colors.sidebarBorder}`, paddingTop: '16px' }}>
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        isActive={false}
                        onClick={() => { }}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '0', backgroundColor: colors.background }}>
                {children}
            </main>
        </div>
    );
};

const SidebarItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                width: '100%',
                borderRadius: '10px',
                backgroundColor: isActive ? colors.primaryLight : 'transparent',
                border: 'none',
                color: isActive ? colors.primary : colors.textMuted,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500
            }}
            onMouseOver={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = colors.text;
                }
            }}
            onMouseOut={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.textMuted;
                }
            }}
        >
            {icon}
            {label}
        </button>
    );
};
