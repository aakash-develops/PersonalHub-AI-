// src/components/pages/MainEntrance.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MainEntrance: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Tracks cursor relative to the huge button for a dynamic spotlight glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: 'calc(100vh - 200px)', // Accounts for navbar clearance
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#090a0f',
      padding: '40px 20px',
      boxSizing: 'border-box',
    }}>

      {/* AMBIENT BACKGROUND ELEMENTS */}
      {/* Top-left Cyan Orb */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 255, 255, 0.03)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        animation: 'floatSlow 8s ease-in-out infinite'
      }} />

      {/* Bottom-right Magenta Orb */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '15%',
        width: '350px',
        height: '350px',
        background: 'rgba(255, 0, 153, 0.03)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        pointerEvents: 'none',
        animation: 'floatSlow 12s ease-in-out infinite alternate'
      }} />

      {/* INTRODUCTION HEADERS */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
        zIndex: 2,
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '14px',
          fontWeight: 700,
          color: '#00ffff',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          System Initialization
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.5)',
          lineHeight: '1.6',
          margin: 0
        }}>
          Welcome to the control hub. Access specialized modules, track developer roadmaps, and manage platform workflows below.
        </p>
      </div>

      {/* THE GATEWAY HUB BUTTON CARD */}
      <div
        onClick={() => navigate('/')} // Adjust this path if your main dashboard is routed elsewhere
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '540px',
          height: '220px',
          cursor: 'pointer',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.01)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '40px',
          boxSizing: 'border-box',
          zIndex: 5,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease',
          transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0)',
          borderColor: isHovered ? 'rgba(0, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
          boxShadow: isHovered
            ? '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px rgba(0, 255, 255, 0.05)'
            : '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Interactive Mouse Spotlight Tracking Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '23px',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 255, 255, 0.06), transparent 80%)`
        }} />

        {/* Dynamic Glowing Accent Corner Lines */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '12px',
          height: '12px',
          borderLeft: '2px solid',
          borderTop: '2px solid',
          borderColor: isHovered ? '#00ffff' : 'rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '12px',
          height: '12px',
          borderRight: '2px solid',
          borderBottom: '2px solid',
          borderColor: isHovered ? '#ff0099' : 'rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s'
        }} />

        {/* Button Content Text Layout */}
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '26px',
          fontWeight: 900,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          background: isHovered
            ? 'linear-gradient(90deg, #00ffff 0%, #ff0099 100%)'
            : 'linear-gradient(90deg, #ffffff 0%, #a5aab0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'all 0.3s'
        }}>
          Enter Dashboard
        </span>

        <span style={{
          fontSize: '11px',
          fontFamily: "'Orbitron', monospace",
          color: isHovered ? '#ff0099' : 'rgba(255, 255, 255, 0.3)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Launch core application interface
          <span style={{
            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.3s'
          }}>→</span>
        </span>
      </div>

      {/* Global CSS Styles injected dynamically for pure CSS floating animations */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MainEntrance;