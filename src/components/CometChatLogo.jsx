import React from 'react';

export default function CometChatLogo({ size = 26, showText = true, isDark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', userSelect: 'none' }}>
      {/* DealRoom Minimalist Geometric Monogram (DR) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="dr-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "#28282c" : "#1e1e22"} />
            <stop offset="50%" stopColor={isDark ? "#141417" : "#121215"} />
            <stop offset="100%" stopColor="#08080a" />
          </linearGradient>
          <linearGradient id="dr-border" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isDark ? "rgba(255, 255, 255, 0.32)" : "rgba(255, 255, 255, 0.20)"} />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
          <linearGradient id="dr-metal" x1="8" y1="7" x2="24" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D4D4D8" />
          </linearGradient>
          <linearGradient id="dr-accent" x1="14" y1="16" x2="23" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#A1A1AA" />
          </linearGradient>
        </defs>

        {/* Squircle Bezel Housing */}
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="8"
          fill="url(#dr-bg)"
          stroke="url(#dr-border)"
          strokeWidth="1"
        />

        {/* Minimalist Geometric Monogram: 'D' outer loop & pillar */}
        <path
          d="M 8.5 7.5 V 24.5"
          stroke="url(#dr-metal)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 8.5 7.5 H 15 C 19.5 7.5 22.8 10.6 22.8 16 C 22.8 21.4 19.5 24.5 15 24.5 H 8.5"
          stroke="url(#dr-metal)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Horizontal waist seam */}
        <path
          d="M 8.5 16 H 17.5"
          stroke="url(#dr-metal)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Architectural 'R' kick in DealRoom silver steel */}
        <path
          d="M 14.5 16 L 22.5 24.5"
          stroke="url(#dr-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Precision Horology Jewel Hallmark Dot */}
        <circle cx="12.5" cy="11.8" r="1.2" fill={isDark ? "#FFFFFF" : "#171717"} />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span
          className="miniver-regular"
          style={{
            fontSize: '1.42rem',
            color: 'var(--text-main)',
            letterSpacing: '0.01em',
            display: 'inline-flex',
            alignItems: 'baseline',
            lineHeight: 1
          }}
        >
          dealroom
        </span>
      )}
    </div>
  );
}

export { CometChatLogo as DealRoomLogo };

