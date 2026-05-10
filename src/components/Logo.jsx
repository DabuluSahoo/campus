import React from 'react';

const Logo = ({ size = 40, showText = true, variant = 2 }) => {
  const isVariant2 = variant === 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="logo-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id="ultra-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {isVariant2 ? (
          /* VARIANT 2: THE GEOMETRIC LINK (Ultra Sharp) */
          <g filter="url(#ultra-glow)">
            {/* Outer Abstract C */}
            <path 
              d="M75 25 C85 35 85 65 75 75 L55 55 C60 50 60 40 55 35 L75 25Z" 
              fill="url(#logo-grad-accent)" 
            />
            {/* Inner Prism M */}
            <path 
              d="M15 75 L45 25 L55 45 L65 25 L95 75 H80 L65 45 L55 65 L45 45 L25 75 H15Z" 
              fill="url(#logo-grad-primary)" 
            />
            {/* Accent Dot */}
            <circle cx="55" cy="15" r="5" fill="white">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ) : (
          /* VARIANT 1: THE HEXA-SHIELD (Modified for better lines) */
          <g filter="url(#ultra-glow)">
            <path 
              d="M50 5 L90 27.5 V72.5 L50 95 L10 72.5 V27.5 L50 5Z" 
              fill="rgba(255,255,255,0.03)" 
              stroke="url(#logo-grad-primary)" 
              strokeWidth="4"
            />
            <path 
              d="M35 35 V65 H45 V45 L55 65 L65 45 V65 H75 V35" 
              stroke="white" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </g>
        )}
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
