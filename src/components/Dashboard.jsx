import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import {
    FiHome, FiBox, FiLifeBuoy, FiSettings, FiLogOut,
    FiActivity, FiFileText, FiUser, FiMenu, FiX, FiShield, FiPlus, FiMessageSquare,
    FiSun, FiMoon, FiArrowLeft, FiLayers
} from 'react-icons/fi';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { createTicket, getUserTickets, getAllUsers, getAllTickets } from '../services/db';

export default function Dashboard() {
    const { t, language, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const pathParts = location.pathname.split('/');
    // Example: ['', 'dashboard', 'services'] -> length 3
    const activeTabRaw = pathParts.length > 2 ? pathParts[2] : 'overview';

    // Ensure activeTab is a valid known tab to prevent crashes if user types random URL
    const validTabs = ['overview', 'support', 'settings', 'admin'];
    const activeTab = validTabs.includes(activeTabRaw) ? activeTabRaw : 'overview';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Settings State
    const [displayName, setDisplayName] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    // Ticket Modal State
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketContent, setTicketContent] = useState('');
    const [tickets, setTickets] = useState([]);

    // Admin Data State
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminTickets, setAdminTickets] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser, navigate]);

    // Fetch Data based on Tab
    useEffect(() => {
        async function fetchData() {
            if (activeTab === 'support') {
                const userTickets = await getUserTickets(currentUser.uid);
                setTickets(userTickets);
            } else if (activeTab === 'admin' && isAdmin) {
                const users = await getAllUsers();
                const allTickets = await getAllTickets();
                setAdminUsers(users);
                setAdminTickets(allTickets);
            }
        }
        fetchData();
    }, [activeTab, currentUser, isAdmin, showTicketModal]); // Refresh when modal closes too

    if (!currentUser) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className="loading-spinner"></div>
            Loading...
        </div>
    );

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch {
            console.error("Failed to log out");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName });
            setStatusMsg({ type: 'success', msg: t.dashboard.settings.success });
        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
        }
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            setStatusMsg({ type: 'success', msg: t.dashboard.settings.success });
        } catch (error) {
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
        }
        setLoading(false);
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(currentUser.uid, currentUser.email, ticketSubject, ticketContent);
            setShowTicketModal(false);
            setTicketSubject('');
            setTicketContent('');
            // Refresh list happens via effect dependency
        } catch (error) {
            console.error("Ticket error:", error);
            alert('Failed to submit ticket');
        }
        setLoading(false);
    };

    const SidebarItem = ({ id, icon, label, danger = false }) => (
        <button
            onClick={() => {
                if (id === 'logout') handleLogout();
                else {
                    const path = id === 'overview' ? '/dashboard' : `/dashboard/${id}`;
                    navigate(path);
                    setMobileMenuOpen(false);
                }
            }}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === id ? 'var(--accent-gradient)' : 'transparent',
                color: danger ? '#ef4444' : (activeTab === id ? 'white' : 'var(--text-secondary)'),
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === id ? '600' : '500',
                marginTop: id === 'logout' ? 'auto' : '0',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const StatCard = ({ title, value, icon, color }) => (
        <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `rgba(${color}, 0.1)`,
                color: `rgb(${color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
            </div>
        </div>
    );

    // Content Components
    const Overview = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard title={t.dashboard.overview.openTickets} value={tickets.length} icon={<FiLifeBuoy />} color="59, 130, 246" />
                <StatCard title={t.dashboard.overview.totalInvoices} value="$0.00" icon={<FiFileText />} color="245, 158, 11" />
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.overview.quickActions}</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { navigate('/dashboard/support'); setShowTicketModal(true); }} style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        + {t.dashboard.overview.newTicket}
                    </button>
                </div>
            </div>
        </div>
    );

    // n8n State
    const [showN8nConfig, setShowN8nConfig] = useState(false);
    const [selectedService, setSelectedService] = useState('Integration'); // New state for dynamic title
    const [telegramConfig, setTelegramConfig] = useState({
        botToken: '',
        chatId: '',
        notifications: true,
        autoReply: false,
        channelMonitor: false
    });

    const handleConfigure = (serviceName) => {
        setSelectedService(serviceName);
        setShowN8nConfig(true);
    };

    const handleN8nSave = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate save
        setTimeout(() => {
            setLoading(false);
            setShowN8nConfig(false);

            // Activate the service
            setServicesData(prev => prev.map(s =>
                s.configName === selectedService ? { ...s, status: 'Active' } : s
            ));

            alert(`${selectedService} Activated & Saved!`);
        }, 1000);
    };

    // Services logic with useState for updates
    const [servicesData, setServicesData] = useState([
        {
            id: 'hosting',
            name: 'Premium Hosting',
            desc: 'mysite.com',
            status: 'Active',
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.1)',
            icon: <FiBox />,
            action: 'Manage',
            isNew: false,
            isPopular: false,
            category: 'hosting'
        },
        {
            id: 'telegram',
            name: 'n8n Telegram Bot',
            desc: 'Free Games Channel Automation',
            status: 'Inactive',
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.1)',
            icon: <FiActivity />,
            configName: 'Telegram Free Games',
            isNew: false,
            isPopular: true,
            category: 'services'
        },
        {
            id: 'instagram',
            name: 'n8n Instagram Auto',
            desc: 'Content Scheduler & Auto-Reply',
            status: 'Inactive',
            color: '#e1306c',
            bg: 'rgba(225, 48, 108, 0.1)',
            icon: <FiBox />, // Will fix icon later if needed
            configName: 'Instagram Content Scheduler',
            isNew: true,
            isPopular: false,
            category: 'services'
        },
        {
            id: 'discord',
            name: 'n8n Discord Bot',
            desc: 'Community Management Helper',
            status: 'Inactive',
            color: '#5865F2',
            bg: 'rgba(88, 101, 242, 0.1)',
            icon: <FiMessageSquare />,
            configName: 'Discord Bot',
            isNew: false,
            isPopular: false,
            isBeta: true,
            category: 'services'
        },
        {
            id: 'x',
            name: 'n8n X / Twitter',
            desc: 'Viral Trend Monitor',
            status: 'Inactive',
            color: 'white',
            bg: 'rgba(255, 255, 255, 0.05)',
            icon: <FiActivity />,
            configName: 'X Viral Monitor',
            isNew: false,
            isPopular: false,
            category: 'services'
        }
    ]);

    const [servicesView, setServicesView] = useState('root'); // root, n8n

    const handleServiceActivation = (serviceId) => {
        setServicesData(prev => prev.map(s =>
            s.id === serviceId ? { ...s, status: 'Active' } : s
        ));
    };

    const Services = () => {
        // Filter logic
        let displayServices = [];

        if (activeTab === 'hosting') {
            displayServices = servicesData.filter(s => s.category === 'hosting');
        } else {
            // If in Services tab
            if (servicesView === 'root') {
                // Show the "Bundle" folder
                displayServices = [{
                    id: 'n8n-bundle',
                    name: 'n8n Automation Station',
                    desc: 'Manage all your social media bots and automations in one place.',
                    status: 'Bundle',
                    color: '#FF6D5A',
                    bg: 'rgba(255, 109, 90, 0.1)',
                    icon: <FiLayers />,
                    action: 'Open',
                    isFolder: true
                }];
            } else if (servicesView === 'n8n') {
                displayServices = servicesData.filter(s => s.category === 'services');
            }
        }

        return (
            <div>
                {/* Header Area with Toggles */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {servicesView !== 'root' && activeTab === 'services' && (
                            <button
                                onClick={() => setServicesView('root')}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <FiArrowLeft />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: '700', margin: 0 }}>
                            {activeTab === 'hosting' ? 'Web Hosting' : (servicesView === 'root' ? t.dashboard.services.title : 'n8n Automations')}
                        </h2>
                    </div>

                    {/* Lang & Theme Toggles */}
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={toggleLanguage} style={{
                            padding: '0.5rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            {language === 'tr' ? 'EN' : 'TR'}
                        </button>
                        <button onClick={toggleTheme} style={{
                            width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: theme === 'light' ? '#fbbf24' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem'
                        }}>
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    paddingBottom: '2rem'
                }}>
                    {displayServices.map((service) => (
                        <div
                            key={service.id}
                            className="service-card glass"
                            onClick={() => service.isFolder ? setServicesView('n8n') : null}
                            style={{
                                padding: '1.8rem',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.2rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: service.isFolder ? 'pointer' : 'default'
                            }}
                        >
                            {/* Badges */}
                            <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', display: 'flex', gap: '0.5rem' }}>
                                {service.isNew && <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: '#FF6D5A', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(255, 109, 90, 0.3)' }}>NEW</span>}
                                {service.isPopular && <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: '#3b82f6', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }}>POPULAR</span>}
                                {service.isBeta && <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: '#8b5cf6', color: 'white', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)' }}>BETA</span>}
                            </div>

                            {/* Header */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: service.bg,
                                    color: service.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.8rem',
                                    boxShadow: `0 8px 20px -6px ${service.bg}`
                                }}>
                                    {service.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{service.name}</h3>
                                    {!service.isFolder && (
                                        <span style={{
                                            fontSize: '0.8rem',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: service.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: service.status === 'Active' ? '#10b981' : '#ef4444',
                                            fontWeight: '600'
                                        }}>
                                            {service.status === 'Active' ? t.dashboard.services.active : 'Inactive'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', minHeight: '3rem' }}>
                                {service.desc}
                            </p>

                            {/* Action Area */}
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {service.isFolder ? (
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem',
                                            borderRadius: '14px',
                                            background: 'var(--accent-gradient)', // Folder action always distinct
                                            border: 'none',
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        View Services <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfigure(service.configName);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.9rem',
                                            borderRadius: '14px',
                                            background: service.status === 'Active' ? 'var(--bg-secondary)' : 'var(--accent-gradient)', // Inactive = Gradient (Call to Action)
                                            border: service.status === 'Active' ? '1px solid var(--border-color)' : 'none',
                                            color: service.status === 'Active' ? 'var(--text-primary)' : 'white',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {service.status === 'Active' ? (
                                            <>
                                                <FiSettings /> Manage
                                            </>
                                        ) : (
                                            <>
                                                <FiPlus /> Activate
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <style>{`
                    .service-card:hover {
                        transform: translateY(-5px);
                        border-color: rgba(255,255,255,0.15) !important;
                        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
                    }
                `}</style>
            </div>
        );
    };

    const Support = () => (
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.support.title}</h2>
                <button onClick={() => setShowTicketModal(true)} style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '12px',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <FiPlus />
                    {t.dashboard.support.createTicket}
                </button>
            </div>

            {tickets.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tickets.map(ticket => (
                        <div key={ticket.id} style={{
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{ticket.subject}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{ticket.content.substring(0, 100)}...</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    {ticket.createdAt ? new Date(ticket.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </div>
                            </div>
                            <span style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}>
                                {ticket.status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    padding: '3rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <FiLifeBuoy size={48} style={{ opacity: 0.3 }} />
                    <p>{t.dashboard.support.noTickets}</p>
                </div>
            )}
        </div>
    );

    const AdminPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Total Users" value={adminUsers.length} icon={<FiUser />} color="139, 92, 246" />
                <StatCard title="Total Tickets" value={adminTickets.length} icon={<FiLifeBuoy />} color="236, 72, 153" />
            </div>

            {/* Users Table */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>All Users</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>User</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Email</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Last Login</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminUsers.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>{u.displayName || 'No Name'}</td>
                                    <td style={{ padding: '1rem' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>{u.lastLogin ? new Date(u.lastLogin.seconds * 1000).toLocaleString() : 'N/A'}</td>
                                    <td style={{ padding: '1rem' }}>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tickets Table */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Recent Tickets</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {adminTickets.map(ticket => (
                        <div key={ticket.id} style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>{ticket.subject} <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>by {ticket.userEmail}</span></div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{ticket.content}</div>
                            </div>
                            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                                {ticket.status}
                            </span>
                        </div>
                    ))}
                    {adminTickets.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No tickets found.</p>}
                </div>
            </div>
        </div>
    );

    // ... Settings Component (Existing) ...
    const Settings = () => (
        <div style={{ maxWidth: '600px' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.settings.profile}</h2>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.dashboard.settings.email}</label>
                        <input type="email" value={currentUser.email} disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.dashboard.settings.displayName}</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '700',
                        cursor: loading ? 'wait' : 'pointer'
                    }}>
                        {t.dashboard.settings.updateProfile}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.settings.security}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.dashboard.settings.passwordResetTo} <strong>{currentUser.email}</strong></p>
                <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        cursor: loading ? 'wait' : 'pointer'
                    }}>
                    {t.dashboard.settings.sendResetLink}
                </button>
            </div>

            {statusMsg.msg && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                    textAlign: 'center'
                }}>
                    {statusMsg.msg}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
            {/* n8n Config Modal */}
            {showN8nConfig && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#FF6D5A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>n8n</div>
                                <h2 style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>{selectedService} Setup</h2>
                            </div>
                            <button onClick={() => setShowN8nConfig(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FiX size={24} /></button>
                        </div>

                        <form onSubmit={handleN8nSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Credentials</h3>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Telegram Bot Token</label>
                                    <input
                                        type="password"
                                        placeholder="123456789:ABCdefGHIjklMNOpqRstUVwxyZ"
                                        value={telegramConfig.botToken}
                                        onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
                                    />
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Obtain from @BotFather</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Chat ID / Channel ID</label>
                                    <input
                                        type="text"
                                        placeholder="@my_channel or -100123456789"
                                        value={telegramConfig.chatId}
                                        onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px' }}>
                                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Automation Options</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={telegramConfig.notifications}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, notifications: e.target.checked })}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                        Receive Notifications
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={telegramConfig.autoReply}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, autoReply: e.target.checked })}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                        Auto-Reply Bot
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={telegramConfig.channelMonitor}
                                            onChange={(e) => setTelegramConfig({ ...telegramConfig, channelMonitor: e.target.checked })}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                        />
                                        Channel Monitor
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowN8nConfig(false)}
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        background: 'transparent',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        background: 'var(--accent-gradient)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        cursor: loading ? 'wait' : 'pointer',
                                        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                                    }}>
                                    {loading ? 'Saving Integration...' : 'Save Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showTicketModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'white' }}>{t.dashboard.support.createTicket}</h2>
                            <button onClick={() => setShowTicketModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FiX size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.dashboard.support.subject}</label>
                                <input required type="text" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Message</label>
                                <textarea required rows={5} value={ticketContent} onChange={(e) => setTicketContent(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontFamily: 'inherit' }} />
                            </div>
                            <button type="submit" disabled={loading} style={{ padding: '1rem', borderRadius: '12px', background: 'var(--accent-gradient)', color: 'white', border: 'none', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}>
                                {loading ? 'Sending...' : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Background Gradients */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
                pointerEvents: 'none', zIndex: 0
            }}></div>

            {/* Mobile Header */}
            <div style={{
                display: 'none',
                width: '100%', padding: '1rem', alignItems: 'center', justifyContent: 'space-between',
                position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)'
            }} className="mobile-header">
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Client Portal</div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
                width: '280px',
                height: '100vh',
                position: 'fixed',
                left: 0, top: 0,
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRight: '1px solid var(--border-color)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 90,
                transition: 'transform 0.3s ease, background 0.3s'
            }}>
                {/* Logo Area */}
                <div style={{
                    marginBottom: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                }} onClick={() => navigate('/')}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold'
                    }}>YD</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{t.dashboard.title}</span>
                </div>

                {/* User Mini Profile */}
                <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '16px', background: theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <FiUser />
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.displayName || 'User'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <SidebarItem id="overview" icon={<FiHome />} label={t.dashboard.tabs.overview} />
                    {isAdmin && <SidebarItem id="admin" icon={<FiShield />} label="Admin Panel" />}
                    <SidebarItem id="support" icon={<FiLifeBuoy />} label={t.dashboard.tabs.support} />
                    <SidebarItem id="settings" icon={<FiSettings />} label={t.dashboard.tabs.settings} />
                </div>

                <SidebarItem id="logout" icon={<FiLogOut />} label={t.dashboard.tabs.logout} danger />
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '3rem',
                paddingTop: '3rem', // Add top padding for mobile header
                minHeight: '100vh',
                transition: 'margin 0.3s ease'
            }} className="main-content">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {activeTab === 'admin' ? 'Admin Panel' : t.dashboard.tabs[activeTab]}
                    </h1>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={toggleLanguage} style={{
                            padding: '0.5rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            {language === 'tr' ? 'EN' : 'TR'}
                        </button>
                        <button onClick={toggleTheme} style={{
                            width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: theme === 'light' ? '#fbbf24' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem'
                        }}>
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </div>
                </header>

                {activeTab === 'overview' && <Overview />}
                {activeTab === 'support' && <Support />}
                {activeTab === 'settings' && <Settings />}
                {activeTab === 'admin' && isAdmin && <AdminPanel />}
            </main>

            <style>{`
            @media (max-width: 900px) {
                .sidebar { transform: translateX(-100%); width: 260px; }
                .sidebar.open { transform: translateX(0); }
                .main-content { margin-left: 0; padding: 1.5rem; padding-top: 6rem; }
                .mobile-header { display: flex !important; }
                
                /* Dashboard Header Responsive */
                .dashboard-header {
                    flex-direction: column;
                    align-items: flex-start !important;
                    gap: 1rem;
                    margin-bottom: 2rem !important;
                }
                .dashboard-header h1 {
                    font-size: 1.75rem !important;
                }
                .dashboard-header > div {
                    width: 100%;
                    justify-content: flex-start;
                }
            }
        `}</style>
        </div>
    );
}
