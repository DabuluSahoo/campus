import React from 'react';

const Logo = ({ size = 40, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        
        {/* Minimalist Geometric C & M */}
        <path 
          d="M30 20 H70 V35 H45 V65 H70 V80 H30 V20Z" 
          fill="url(#logo-grad)" 
        />
        <path 
          d="M50 35 L70 65 L90 35 V80 H75 V55 L60 75 L45 55 V80 H30 V35" 
          fill="white" 
          style={{ mixBlendMode: 'difference' }}
        />
      </svg>
      
      {showText && (
        <span style={{ 
          fontSize: size * 0.5 + 'px', 
          fontWeight: '800', 
          letterSpacing: '0.05em',
          color: 'white',
          fontFamily: 'var(--font-inter)',
          textTransform: 'uppercase'
        }}>
          Campus<span style={{ color: '#8b5cf6' }}>Market</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
