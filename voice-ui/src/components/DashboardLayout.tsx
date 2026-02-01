import React from 'react';
import { LayoutDashboard, Mic, Settings } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentTab: 'live' | 'insights';
    onTabChange: (tab: 'live' | 'insights') => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentTab, onTabChange }) => {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#09090b', // Zinc-950
            color: '#e4e4e7', // Zinc-200
            fontFamily: '"Inter", sans-serif',
            overflow: 'hidden'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#0d1117', // Github Dark Dimmed
                borderRight: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
            }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #58a6ff, #3fb950)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '4px'
                    }}>CodeBud</h1>
                    <p style={{ fontSize: '13px', color: '#8b949e' }}>AI Pair Programmer</p>
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

                <div style={{ marginTop: 'auto', borderTop: '1px solid #30363d', paddingTop: '16px' }}>
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label="Settings"
                        isActive={false}
                        onClick={() => { }}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
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
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                border: 'none',
                color: isActive ? '#58a6ff' : '#8b949e',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500
            }}
            onMouseOver={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#e4e4e7';
                }
            }}
            onMouseOut={(e) => {
                if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#8b949e';
                }
            }}
        >
            {icon}
            {label}
        </button>
    );
};
