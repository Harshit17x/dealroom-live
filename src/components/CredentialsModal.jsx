import React, { useState } from 'react';
import { Shield, Key, Globe, Terminal, ExternalLink, X, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { APP_ID, REGION, AUTH_KEY } from '../services/cometchat';

export default function CredentialsModal({ isOpen, onClose, onSaveAuthKey }) {
  const [authKeyInput, setAuthKeyInput] = useState(AUTH_KEY || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('npx @cometchat/skills-cli@3 auth login && npx @cometchat/skills-cli@3 provision run');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onSaveAuthKey) {
      onSaveAuthKey(authKeyInput.trim());
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '16px',
          padding: '24px',
          color: 'var(--text-main)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          animation: 'slideDown 0.2s ease-out'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--cc-purple-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--cc-purple)'
              }}
            >
              <Key size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              CometChat Dashboard Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dashboard Status Pill */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>App ID:</span>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cc-purple)' }}>
              {APP_ID || '16840002eaa643920'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Region:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cc-blue)' }}>
              {REGION?.toUpperCase() || 'IN (India)'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>App Name:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              yuvachat
            </span>
          </div>
        </div>

        {/* Auth Key Input */}
        <form onSubmit={handleSave} style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
            Paste Auth Key (from CometChat Overview / Credentials):
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. 5a1b2c3d4e5f6g7h8i9j..."
              value={authKeyInput}
              onChange={(e) => setAuthKeyInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'var(--cc-purple)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Save Key
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Saved locally in your project's <code style={{ color: 'var(--cc-purple)' }}>.env</code> file.
          </div>
        </form>

        {/* Alternative: Skills CLI command */}
        <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Or auto-pull via CometChat Skills CLI:
            </span>
            <button
              onClick={handleCopyCmd}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cc-purple)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <code
            style={{
              display: 'block',
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'var(--bg-app)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--cc-blue)',
              overflowX: 'auto'
            }}
          >
            npx @cometchat/skills-cli@3 auth login && npx @cometchat/skills-cli@3 provision run
          </code>
        </div>
      </div>
    </div>
  );
}
