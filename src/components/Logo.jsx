import React from 'react';

const Logo = ({ size = 40, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Main Hexagon Shape */}
        <path 
          d="M50 5 L90 27.5 V72.5 L50 95 L10 72.5 V27.5 L50 5Z" 
          fill="rgba(255,255,255,0.05)" 
          stroke="url(#logo-gradient)" 
          strokeWidth="4"
          filter="url(#glow)"
        />
        
        {/* Stylized 'C' and 'M' combined */}
        <path 
          d="M35 35 C30 40 30 60 35 65 M45 35 L55 65 L65 35 L75 65" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Accent Sparkle */}
        <circle cx="75" cy="25" r="4" fill="#f472b6">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      
      {showText && (
        <span style={{ 
          fontSize: size * 0.6 + 'px', 
          fontWeight: '900', 
          letterSpacing: '-0.04em',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-inter)'
        }}>
          CAMPUS<span style={{ color: 'var(--primary-color)', WebkitTextFillColor: 'var(--primary-color)' }}>MARKET</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
