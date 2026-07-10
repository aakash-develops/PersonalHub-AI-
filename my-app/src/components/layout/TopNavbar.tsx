// src/components/layout/TopNavbar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface TopNavbarProps {
  currentWeek?: number;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ currentWeek = 1 }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/daily', label: 'Daily Routine' },
    { path: '/projects', label: 'Projects' },
    { path: '/roadmap', label: 'ML Roadmap' },
    { path: '/notes', label: 'Learning Notes' },
    { path: '/jobs', label: 'Job Tracker' },
    { path: '/finnish', label: 'Finnish Hub' },
    { path: '/github', label: 'GitHub Details' },
  ];

  const isHistoryActive = location.pathname.startsWith('/history');

  return (
    <header style={{
      background: 'rgba(14, 14, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '0 40px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* BRAND Identity Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h1 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '1.2px', color: '#ffffff', margin: 0 }}>
          ML CAREER <span style={{ color: '#4f8cff', fontWeight: 800 }}>OS</span>
        </h1>
        <span style={{
          background: 'linear-gradient(135deg, rgba(79, 140, 255, 0.18), rgba(79, 140, 255, 0.04))',
          color: '#4f8cff',
          border: '1px solid rgba(79, 140, 255, 0.25)',
          padding: '3px 10px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          WEEK {currentWeek}
        </span>
      </div>

      {/* CORE Navigation Menu */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '100%' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHovered = hoveredPath === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              style={{
                color: isActive ? '#ffffff' : (isHovered ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.45)'),
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                padding: '8px 14px',
                borderRadius: '8px',
                position: 'relative',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'rgba(255, 255, 255, 0.05)'
                  : (isHovered ? 'rgba(255, 255, 255, 0.02)' : 'transparent')
              }}
            >
              {item.label}

              {/* Active Pill Underline */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-19px',
                  left: '14px',
                  right: '14px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #4f8cff, #a55eea)',
                  borderRadius: '2px',
                  boxShadow: '0 0 10px rgba(79, 140, 255, 0.5)'
                }} />
              )}
            </NavLink>
          );
        })}

        {/* Crisp Midline Separator */}
        <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 12px' }} />

        {/* Secondary Drops Ledger Container */}
        <div
          style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <span
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
            style={{
              color: (isHistoryActive || dropdownOpen || isMenuHovered) ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
              fontSize: '13px',
              fontWeight: isHistoryActive ? 600 : 500,
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              background: (dropdownOpen || isMenuHovered) ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            Logs Menu <span style={{ opacity: 0.4, fontSize: '10px' }}>▼</span>
          </span>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '54px',
              right: 0,
              background: '#0f111a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              width: '180px',
              padding: '6px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>

              <NavLink
                to="/history/general"
                style={dropdownItemStyle}
                onClick={() => setDropdownOpen(false)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ marginRight: '8px' }}>📊</span> System Archive
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.75)',
  padding: '10px 12px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'background 0.15s ease',
  display: 'flex',
  alignItems: 'center'
};

export default TopNavbar;