import React from 'react';
import CometChatLogo from './CometChatLogo';
import { DEMO_USERS } from '../services/cometchat';
import {
  ArrowLeftRight,
  ShoppingBag,
  MessageSquare,
  Lock,
  Video,
  Key,
  LogOut
} from 'lucide-react';

export default function DealNavbar({
  currentRole,
  onSwitchRole,
  onOpenCredentialsModal,
  activeTab,
  onSelectTab,
  onLogout
}) {
  const activeUser = DEMO_USERS[currentRole];
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const otherUser = DEMO_USERS[otherRole];
  const isDark = false;

  return (
    <header
      style={{
        height: '62px',
        width: '100%',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 40,
        transition: 'background 0.2s, border-color 0.2s'
      }}
    >
      {/* Brand: CometChat Emblem + DealRoom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <div
          onClick={() => onSelectTab('marketplace')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <CometChatLogo size={26} showText={false} isDark={isDark} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.15rem',
                color: 'var(--text-main)',
                letterSpacing: '-0.03em'
              }}
            >
              DealRoom
            </span>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'var(--cc-purple)',
                color: '#FFFFFF',
                fontSize: '0.66rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              LIVE
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => onSelectTab('marketplace')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: activeTab === 'marketplace' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'marketplace' ? '1px solid var(--border-strong)' : '1px solid transparent',
              color: activeTab === 'marketplace' ? 'var(--cc-purple)' : 'var(--text-sub)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <ShoppingBag size={15} />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => onSelectTab('deals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: activeTab === 'deals' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'deals' ? '1px solid var(--border-strong)' : '1px solid transparent',
              color: activeTab === 'deals' ? 'var(--cc-purple)' : 'var(--text-sub)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative'
            }}
          >
            <MessageSquare size={15} />
            <span>Live DealRooms</span>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--cc-purple)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '2px'
              }}
            >
              1
            </span>
          </button>

          <button
            onClick={() => onSelectTab('escrow')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: activeTab === 'escrow' ? 'var(--bg-surface-elevated)' : 'transparent',
              border: activeTab === 'escrow' ? '1px solid var(--border-strong)' : '1px solid transparent',
              color: activeTab === 'escrow' ? 'var(--cc-purple)' : 'var(--text-sub)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Lock size={15} />
            <span>Escrow Vault</span>
          </button>
        </nav>
      </div>

      {/* Right Controls: Role Switcher & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Persona Switcher Pill */}
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
            title={`Switch to ${otherUser.name}`}
          >
            <ArrowLeftRight size={13} />
            <span>Switch to {otherUser.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Config Modal Shortcut */}
        <button
          onClick={onOpenCredentialsModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          title="CometChat API Settings"
        >
          <Key size={16} />
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--cc-rose)',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s'
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
