import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import AnimatedLogo from '../logo/logo';
import './TopNavbar.css'; // Imports our style sheet code from step 1

interface TopNavbarProps {
  currentWeek?: number;
}

export default function TopNavbar({ currentWeek = 1 }: TopNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/daily', label: 'Daily Routine' },
    { path: '/projects', label: 'Projects' },
    { path: '/roadmap', label: 'ML Roadmap' },
    { path: '/notes', label: 'Learning Notes' },
    { path: '/jobs', label: 'Job Tracker' },
    { path: '/finnish', label: 'Finnish Hub' },
    { path: '/github', label: 'GitHub Details' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('sys_session_token');
    window.dispatchEvent(new Event('storage')); // Notifies AppContent security firewall instantly
    navigate('/', { replace: true });
  };

  const isHistoryActive = location.pathname.startsWith('/history');

  return (
    <div className="topnav-wrapper-outer">
      <header className="topnav-header">

        {/* BRAND IDENTITY BADGE BLOCK */}
        <div className="topnav-brand-group">
          <div className="logo-container-frame" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <AnimatedLogo size={75} />
          </div>

          <div className="brand-text-panel">
            <span className="brand-title-text">
              AAKASH_<span>SYS</span>
            </span>
            <span className="brand-cycle-badge">
              CYCLE W{currentWeek}
            </span>
          </div>
        </div>

        {/* CORE INTERFACE NAVIGATION TRACK */}
        <nav className="topnav-navigation-links">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path} className="topnav-link-item">
                {item.label}
                {isActive && <div className="active-neon-glow-bar" />}
              </NavLink>
            );
          })}

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 12px' }} />

          {/* SECURE SUB-SYSTEM LOG ARCHIVE DROPDOWN */}
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <span className={`topnav-link-item ${isHistoryActive ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
              Logs Menu <span style={{ fontSize: '9px', marginLeft: '4px' }}>▼</span>
            </span>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                width: '180px',
                padding: '6px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 1100
              }}>
                <NavLink
                  to="/history/general"
                  style={{
                    color: 'var(--text-main)',
                    padding: '10px 12px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => setDropdownOpen(false)}
                >
                  📊 System Archive
                </NavLink>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 12px' }} />

          {/* FIREWALL DE-AUTHORIZATION TERMINATION TRIGGER */}
          <button onClick={handleLogout} className="shutdown-action-trigger">
            Shutdown
          </button>
        </nav>

      </header>
    </div>
  );
}