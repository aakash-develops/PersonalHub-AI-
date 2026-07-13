// src/components/layout/TopNavbar.tsx
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import AnimatedLogo from '../logo/logo';

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
    <div style={{
      position: 'sticky',
      top: '20px',
      zIndex: 1000,
      padding: '0 32px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <header style={{
        background: 'rgba(255, 255, 255, 0.015)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '0 40px',

        /* MATCHED TO LOGO: Seamlessly houses your 150px asset without clipping */
        height: '160px',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>

        {/* BRAND IDENTITY BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          height: '100%'
        }}>
          {/* Unclipped sizing wrapper for the logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '150px',
            width: '150px'
          }}>
            <AnimatedLogo size={150} />
          </div>

          {/* TEXT BESIDE THE LOGO MATCHING LOGO COLORS & FONT */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            justifyContent: 'center'
          }}>
            {/* Portfolio text with the sharp dual-color gradient blend from the logo */}
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #00ffff 0%, #ff0099 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Portfolio
            </span>

            {/* Week text with matching sharp layout */}
            <span style={{
              alignSelf: 'flex-start',
              background: 'linear-gradient(135deg, rgba(255, 0, 153, 0.15), rgba(255, 0, 153, 0.04))',
              color: '#ff0099',
              border: '1px solid rgba(255, 0, 153, 0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontFamily: "'Orbitron', monospace",
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              WEEK {currentWeek}
            </span>
          </div>
        </div>

        {/* CORE NAVIGATION MENU */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}>
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
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  padding: '12px 18px',
                  borderRadius: '10px',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  background: isActive
                    ? 'rgba(255, 255, 255, 0.06)'
                    : (isHovered ? 'rgba(255, 255, 255, 0.02)' : 'transparent')
                }}
              >
                {item.label}

                {/* Underline Track aligned accurately to the deeper layout frame */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-48px',
                    left: '18px',
                    right: '18px',
                    height: '2px',
                    background: 'linear-gradient(90deg, #4f8cff, #a55eea)',
                    borderRadius: '2px',
                    boxShadow: '0 0 16px rgba(79, 140, 255, 0.8)'
                  }} />
                )}
              </NavLink>
            );
          })}

          {/* Crisp Divider */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)', margin: '0 16px' }} />

          {/* Logs Menu Dropdown */}
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
                fontSize: '14px',
                fontWeight: isHistoryActive ? 600 : 500,
                cursor: 'pointer',
                padding: '12px 18px',
                borderRadius: '10px',
                background: (dropdownOpen || isMenuHovered) ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              Logs Menu <span style={{ opacity: 0.4, fontSize: '10px', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </span>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '105px',
                right: 0,
                background: 'rgba(15, 17, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                width: '200px',
                padding: '6px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <NavLink
                  to="/history/general"
                  style={dropdownItemStyle}
                  onClick={() => setDropdownOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }}
                >
                  <span style={{ marginRight: '10px', fontSize: '14px' }}>📊</span> System Archive
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </header>
    </div>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.75)',
  padding: '10px 12px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  borderRadius: '8px',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center'
};

export default TopNavbar;