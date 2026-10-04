import React from 'react';

export default function CometChatLogo({ size = 26, showText = true, isDark = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', userSelect: 'none' }}>
      {/* CometChat Official Bubble Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="32" height="32" rx="9" fill="url(#cc-gradient)" />
        <path
          d="M8.5 16C8.5 11.8579 11.8579 8.5 16 8.5C20.1421 8.5 23.5 11.8579 23.5 16C23.5 20.1421 20.1421 23.5 16 23.5C14.4756 23.5 13.053 23.0454 11.8624 22.2647L8.5 23.5L9.73527 20.1376C8.95462 18.947 8.5 17.5244 8.5 16Z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="16" r="2.2" fill="#f44336" />
        <defs>
          <linearGradient id="cc-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff7961" />
            <stop offset="1" stopColor="#ffa4a2" />
          </linearGradient>
        </defs>
      </svg>

      {/* CometChat Wordmark */}
      {showText && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: '1.18rem',
            letterSpacing: '-0.03em',
            color: isDark ? '#FFFFFF' : '#0F172A',
            display: 'inline-flex',
            alignItems: 'baseline'
          }}
        >
          cometchat
        </span>
      )}
    </div>
  );
}
