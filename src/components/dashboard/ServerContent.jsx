import React, { useState, useEffect } from 'react';
import { FiServer, FiActivity, FiHardDrive, FiCpu, FiSettings, FiMaximize, FiMinimize } from 'react-icons/fi';

const ServerContent = ({ t }) => {
    const [configMode, setConfigMode] = useState(false);
    const [viewMode, setViewMode] = useState('widget'); // 'widget' or 'iframe'
    const [serverUrl, setServerUrl] = useState(localStorage.getItem('glances_url') || '');
    const [tempUrl, setTempUrl] = useState(serverUrl);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (!serverUrl || viewMode === 'iframe') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Remove trailing slash if present
                const cleanUrl = serverUrl.replace(/\/$/, '');

                // Fetch basic metrics
                const cpuRes = await fetch(`${cleanUrl}/api/3/cpu`);
                const memRes = await fetch(`${cleanUrl}/api/3/mem`);
                const loadRes = await fetch(`${cleanUrl}/api/3/load`);
                const fsRes = await fetch(`${cleanUrl}/api/3/fs`);

                if (!cpuRes.ok || !memRes.ok) throw new Error('API Error');

                const cpu = await cpuRes.json();
                const mem = await memRes.json();
                const load = await loadRes.json();
                const fs = await fsRes.json();

                setData({ cpu, mem, load, fs });
                setError(null);
                setLastUpdated(new Date());
            } catch (err) {
                console.error("Glances Fetch Error:", err);
                setError(t.dashboard.server.error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [serverUrl, viewMode, t.dashboard.server.error]);

    const handleSaveConfig = () => {
        let url = tempUrl.trim();
        // Basic validation/cleanup
        if (url && !url.startsWith('http')) {
            url = 'http://' + url;
        }
        localStorage.setItem('glances_url', url);
        setServerUrl(url);
        setConfigMode(false);
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'widget' ? 'iframe' : 'widget');
    };

    if (!serverUrl || configMode) {
        return (
            <div className="glass" style={{ padding: '3rem', borderRadius: '32px', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
                <div style={{ fontSize: '4rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                    <FiServer />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{t.dashboard.server.configure}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {t.dashboard.server.subtitle}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                    <label style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{t.dashboard.server.urlLabel}</label>
                    <input
                        type="text"
                        value={tempUrl}
                        onChange={(e) => setTempUrl(e.target.value)}
                        placeholder={t.dashboard.server.urlPlaceholder}
                        style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.1)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem'
                        }}
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,165,0,0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,165,0,0.2)' }}>
                        {t.dashboard.server.sslWarning}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={handleSaveConfig}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            {t.dashboard.server.save}
                        </button>
                        {serverUrl && (
                            <button
                                onClick={() => setConfigMode(false)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {t.dashboard.server.cancel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {t.dashboard.server.title}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: error ? '#ef4444' : (loading ? 'var(--text-secondary)' : '#10b981') }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: error ? '#ef4444' : (loading ? 'gray' : '#10b981') }}></span>
                        {error ? error : (loading ? 'Syncing...' : t.dashboard.server.connected)}
                        {lastUpdated && !loading && !error && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({lastUpdated.toLocaleTimeString()})</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={toggleViewMode}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        {viewMode === 'widget' ? <><FiMaximize /> {t.dashboard.server.iframeMode}</> : <><FiMinimize /> {t.dashboard.server.widgetMode}</>}
                    </button>
                    <button
                        onClick={() => setConfigMode(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}
                    >
                        <FiSettings /> {t.dashboard.server.configure}
                    </button>
                </div>
            </div>

            {viewMode === 'iframe' ? (
                <div className="glass" style={{ height: '80vh', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <iframe
                        src={serverUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Glances"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* CPU Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiCpu style={{ color: 'var(--accent-color)' }} /> {t.dashboard.server.cpu}
                            </h3>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {data?.cpu?.total ? `${data.cpu.total.toFixed(1)}%` : '--'}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${data?.cpu?.total || 0}%`,
                                height: '100%',
                                background: 'var(--accent-gradient)',
                                transition: 'width 0.5s ease-in-out'
                            }}></div>
                        </div>
                    </div>

                    {/* RAM Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiActivity style={{ color: '#10b981' }} /> {t.dashboard.server.memory}
                            </h3>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                {data?.mem?.percent ? `${data.mem.percent.toFixed(1)}%` : '--'}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${data?.mem?.percent || 0}%`,
                                height: '100%',
                                background: '#10b981',
                                transition: 'width 0.5s ease-in-out'
                            }}></div>
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Free: {data?.mem?.free ? (data.mem.free / 1024 / 1024 / 1024).toFixed(2) : '--'} GB /
                            Total: {data?.mem?.total ? (data.mem.total / 1024 / 1024 / 1024).toFixed(2) : '--'} GB
                        </div>
                    </div>

                    {/* Load Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiActivity style={{ color: '#f59e0b' }} /> {t.dashboard.server.load}
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data?.load?.min1?.toFixed(2) || '--'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 Min</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data?.load?.min5?.toFixed(2) || '--'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>5 Min</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{data?.load?.min15?.toFixed(2) || '--'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>15 Min</div>
                            </div>
                        </div>
                    </div>

                    {/* Disk Card */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiHardDrive style={{ color: '#3b82f6' }} /> {t.dashboard.server.disk}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {data?.fs?.map((disk, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{disk.mnt_point}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{disk.percent}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${disk.percent}%`,
                                            height: '100%',
                                            background: disk.percent > 90 ? '#ef4444' : '#3b82f6'
                                        }}></div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        Free: {(disk.free / 1024 / 1024 / 1024).toFixed(1)} GB
                                    </div>
                                </div>
                            ))}
                            {(!data?.fs || data.fs.length === 0) && <div style={{ color: 'var(--text-secondary)' }}>No disk data available</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServerContent;
