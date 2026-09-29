import React from 'react';
import CometChatLogo from './CometChatLogo';
import { DEMO_USERS } from '../services/cometchat';
import {
  Sun,
  Moon,
  ArrowLeftRight,
  ShieldCheck,
  Radio,
  Key,
  Sparkles,
  Layers
} from 'lucide-react';

export default function DealNavbar({
  currentRole,
  onSwitchRole,
  onOpenCredentialsModal,
  isConnected,
  credentialsConfigured,
  theme,
  onToggleTheme,
  appId,
  region
}) {
  const activeUser = DEMO_USERS[currentRole];
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const otherUser = DEMO_USERS[otherRole];
  const isDark = theme === 'dark';

  return (
    <header
      style={{
        height: '60px',
        width: '100%',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        zIndex: 40,
        transition: 'background 0.2s, border-color 0.2s'
      }}
    >
      {/* Brand: Official CometChat Logo + DealRoom Live Extension */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <CometChatLogo size={28} showText={true} isDark={isDark} />

        <div style={{ height: '20px', width: '1px', background: 'var(--border-strong)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            DealRoom
          </span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            LIVE
          </span>
        </div>

        {/* Dashboard Connected App Pill */}
        <div
          onClick={onOpenCredentialsModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            background: credentialsConfigured ? 'var(--cc-purple-light)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${credentialsConfigured ? 'rgba(104, 81, 214, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: credentialsConfigured ? 'var(--cc-purple)' : 'var(--cc-rose)'
          }}
          title="Click to view/manage CometChat dashboard keys"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: credentialsConfigured ? 'var(--cc-purple)' : 'var(--cc-rose)'
            }}
            className="cc-pulse"
          />
          <span>
            {appId ? `yuvachat (${region?.toUpperCase()})` : 'Connect Dashboard'}
          </span>
        </div>
      </div>

      {/* Right side: Light/Dark theme toggle + Persona Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={onToggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-sub)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6851D6" />}
        </button>

        {/* Current Active Persona Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 8px 4px 12px',
            borderRadius: '10px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)'
          }}
        >
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {activeUser.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--cc-purple)', fontWeight: 600 }}>
              {activeUser.role}
            </span>
          </div>

          {/* Quick 1-click Switch */}
          <button
            onClick={() => onSwitchRole(otherRole)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '6px',
              padding: '6px 11px',
              borderRadius: '7px',
              background: 'var(--cc-purple)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(104, 81, 214, 0.3)',
              transition: 'background 0.15s'
            }}
            title={`Switch view to ${otherUser.name}`}
          >
            <ArrowLeftRight size={13} />
            <span>Switch to {otherUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
