import React from 'react';

const Logo = ({ size = 40, showText = true }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#glow-effect)">
          {/* Distinct 'C' Shape */}
          <path 
            d="M70 20 C40 10 10 30 10 50 C10 70 40 90 70 80" 
            stroke="url(#logo-grad)" 
            strokeWidth="10" 
            strokeLinecap="round" 
          />
          
          {/* Distinct 'M' Shape Interlocked */}
          <path 
            d="M35 75 V35 L55 60 L75 35 V75" 
            stroke="white" 
            strokeWidth="10" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Accent Point */}
          <circle cx="85" cy="50" r="6" fill="#f472b6">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
      
      {showText && (
        <span style={{ 
          fontSize: size * 0.55 + 'px', 
          fontWeight: '900', 
          letterSpacing: '-0.04em',
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'var(--font-inter)',
          textTransform: 'uppercase'
        }}>
          Campus<span style={{ color: 'var(--primary-color)', WebkitTextFillColor: 'var(--primary-color)' }}>Market</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
