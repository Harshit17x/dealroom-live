import React from 'react';
import { DEMO_USERS } from '../services/cometchat';
import {
  ShieldAlert,
  Radio,
  UserCheck,
  ArrowLeftRight,
  Sparkles,
  Terminal,
  ExternalLink
} from 'lucide-react';

export default function DealNavbar({
  currentRole,
  onSwitchRole,
  onOpenCredentialsModal,
  isConnected,
  credentialsConfigured
}) {
  const activeUser = DEMO_USERS[currentRole];
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const otherUser = DEMO_USERS[otherRole];

  return (
    <header
      style={{
        height: '62px',
        width: '100%',
        background: '#090d16',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0,
        zIndex: 50
      }}
    >
      {/* Brand & Live status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
            }}
          >
            DR
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                DealRoom
              </span>
              <span style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.05rem' }}>Live</span>
              <span className="badge badge-emerald" style={{ padding: '2px 7px', fontSize: '0.68rem' }}>
                <Radio size={10} className="animate-pulse-glow" /> LIVE
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              CometChat Hackathon Edition
            </div>
          </div>
        </div>

        {/* MCP Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.73rem',
            color: '#94a3b8'
          }}
        >
          <Terminal size={12} color="#818cf8" />
          <span>MCP Connector: </span>
          <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Active</span>
        </div>
      </div>

      {/* Right controls: Persona Switcher & Config Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection indicator */}
        <div
          onClick={onOpenCredentialsModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: credentialsConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${credentialsConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: credentialsConfigured ? '#34d399' : '#fb7185'
          }}
          title="Click to view/update CometChat credentials"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: credentialsConfigured ? '#10b981' : '#f43f5e'
            }}
          />
          <span>{credentialsConfigured ? 'CometChat Ready' : 'Configure .env'}</span>
        </div>

        {/* Current Persona Badge & Fast Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 6px 4px 12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <img
            src={activeUser.avatar}
            alt={activeUser.name}
            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
              {activeUser.name}
            </span>
            <span style={{ fontSize: '0.68rem', color: currentRole === 'buyer' ? '#38bdf8' : '#fbbf24' }}>
              {activeUser.role}
            </span>
          </div>

          <button
            onClick={() => onSwitchRole(otherRole)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <ArrowLeftRight size={13} />
            <span>Switch to {otherUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
