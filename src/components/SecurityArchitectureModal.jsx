import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  X,
  Code2,
  LogOut
} from 'lucide-react';
import { IS_DEMO_MODE } from '../services/cometchat';

export default function SecurityArchitectureModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onSwitchPersona,
  theme = 'light'
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'server-code' | 'checklist'
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const serverSampleCode = `// -------------------------------------------------------------
// ILLUSTRATIVE ONLY: this endpoint is NOT implemented in DealRoom.
// Requires authentication middleware, user provisioning, CSRF protection,
// rate limiting, and deployment configuration before use.
// EXAMPLE COMETCHAT AUTH TOKEN ENDPOINT (e.g. /api/cometchat-token)
// Server-side only: uses COMETCHAT_REST_API_KEY (never in client bundle)
// -------------------------------------------------------------
import express from 'express';
const router = express.Router();

router.post('/api/cometchat-token', async (req, res) => {
  // 1. Verify user session from cookie / JWT (NEVER trust client-provided UID query param)
  const sessionUser = req.user; // e.g. from passport, NextAuth, or Supabase
  if (!sessionUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const uid = sessionUser.id; // Server-verified identity

  try {
    // 2. Mint CometChat Auth Token using private server REST API Key
    const response = await fetch(
      \`https://\${process.env.COMETCHAT_APP_ID}.api-\${process.env.COMETCHAT_REGION}.cometchat.io/v3/users/\${encodeURIComponent(uid)}/auth_tokens\`,
      {
        method: 'POST',
        headers: {
          'apiKey': process.env.COMETCHAT_REST_API_KEY, // SERVER SECRET
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mint auth token');
    }

    // 3. Return the single-user auth token to the client
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ authToken: data.data.authToken });
  } catch (err) {
    console.error('CometChat Token Minting Error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Client-side call:
// const res = await fetch('/api/cometchat-token', { method: 'POST', credentials: 'include' });
// if (!res.ok) throw new Error('Authentication failed');
// const { authToken } = await res.json();
// await CometChatUIKit.loginWithAuthToken(authToken);`;

  const handleCopyCode = async () => {
    setCopied(false);
    setCopyError('');
    try {
      await navigator.clipboard.writeText(serverSampleCode);
      setCopied(true);
    } catch {
      setCopyError('Clipboard unavailable. Select the example below to copy it manually.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          background: isDark ? '#0b0f19' : '#FFFFFF',
          borderRadius: '16px',
          border: '1px dashed var(--border-strong)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.65)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crosshair accents */}
        <span className="crosshair-plus crosshair-tl" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
        <span className="crosshair-plus crosshair-tr" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
        <span className="crosshair-plus crosshair-bl" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
        <span className="crosshair-plus crosshair-br" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>

        {/* Modal Header */}
        <div
          style={{
            padding: '22px 24px 18px',
            borderBottom: '1px dashed var(--border-default)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.24rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  CometChat Security & Architecture
                </h2>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                  }}
                >
                  {IS_DEMO_MODE ? 'DEVELOPMENT DEMO ENABLED' : 'TOKEN SIGN-IN MODE'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  React v7 UI Kit
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.80rem', color: 'var(--text-sub)' }}>
                Current client authentication options and an illustrative backend design. This is not a security certification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-sub)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px 0',
            borderBottom: '1px solid var(--border-default)',
            background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'overview' ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Architecture Comparison
          </button>
          <button
            onClick={() => setActiveTab('server-code')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'server-code' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'server-code' ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Code2 size={13} />
            <span>Example Token Endpoint</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            style={{
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'checklist' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'checklist' ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Deployment Requirements
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Context Notice Alert */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.80rem', color: isDark ? '#fde68a' : '#92400e', lineHeight: 1.5 }}>
                  <strong>What is implemented?</strong>
                  <br />
                  The client accepts a server-minted CometChat auth token. Demo personas are available only in development when VITE_DEMO_MODE is explicitly true.
                  No account backend or token-minting endpoint is included. Escrow uses local simulated state, with no financial custody or cryptographic multi-signature implementation.
                </div>
              </div>

              {/* Side by Side Comparison Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* Hackathon Demo Mode Column */}
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1px dashed rgba(245, 158, 11, 0.4)',
                    background: isDark ? '#111625' : '#fcfbf8',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Development Demo ({IS_DEMO_MODE ? 'Enabled' : 'Disabled'})
                    </span>
                    <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      Evaluator Convenience
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Sample personas:</strong> Explicit development demo mode permits login as sample buyer and seller UIDs.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Dev User Provisioning:</strong> Demo helpers may create sample CometChat users using the local development Auth Key.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-sub)' }}>
                        <strong>Auth Key:</strong> Uses <code>VITE_COMETCHAT_AUTH_KEY</code> in local env for development velocity.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Production Architecture Column */}
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    background: isDark ? '#0c161c' : '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Production Integration Requirements
                    </span>
                    <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      Backend Required
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Client token support:</strong> Uses <code>loginWithAuthToken(token)</code>. Your backend must authenticate the user and issue that token.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Build configuration:</strong> Development Auth Key access is gated out of production. Verify your deployed bundle and environment separately; this view does not run a security audit.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Server-Side Provisioning:</strong> Your backend must create users with the REST API. No signup or provisioning backend is included here.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Session Status */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current Active Session
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    {currentUser?.name} <span style={{ color: '#10b981', fontSize: '0.78rem' }}>({currentUser?.uid})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {IS_DEMO_MODE && onSwitchPersona && (
                    <button
                      onClick={() => {
                        onSwitchPersona();
                        onClose();
                      }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '7px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-main)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Switch Demo Persona
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '7px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={13} />
                      <span>Log Out to View Sign-in / Token Form</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server-code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.80rem', color: 'var(--text-sub)' }}>
                  Illustrative server pattern only — not a deployed endpoint or a complete authentication backend:
                </span>
                <button
                  onClick={handleCopyCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-main)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Endpoint Code'}</span>
                </button>
              </div>

              {copyError && <p role="status" style={{ color: '#f59e0b', fontSize: '0.78rem' }}>{copyError}</p>}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '10px',
                  background: isDark ? '#050811' : '#1e293b',
                  color: '#e2e8f0',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <pre style={{ margin: 0 }}>{serverSampleCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.80rem', color: 'var(--text-sub)', marginBottom: '4px' }}>
                Deployment guidance, not completed audit results. These requirements must be validated for your backend and environment:
              </div>

              {[
                { label: 'Inspect the production bundle for secrets', desc: 'Confirm Auth Keys and REST API Keys are absent from the deployed assets.' },
                { label: 'Connect server-issued auth tokens', desc: 'Client token sign-in exists; implement and verify the authenticated backend separately.' },
                { label: 'Derive UID from the server session', desc: 'Never trust a client-supplied UID on the token endpoint; no such endpoint is included here.' },
                { label: 'Provision users on your backend', desc: 'Create users through the REST API after your own signup and identity checks.' },
                { label: 'Deploy over HTTPS', desc: 'Verify secure-context access to camera and microphone on the actual deployment.' },
                { label: 'Verify session teardown', desc: 'Test logout, call cleanup, and switching accounts against the configured CometChat app.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px dashed var(--border-default)',
            background: isDark ? '#080c14' : '#f9fafb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--text-muted)'
          }}
        >
          <span>DealRoom Live • CometChat Hackathon 2026</span>
          <button
            onClick={onClose}
            className="ossium-btn-primary"
            style={{ padding: '7px 18px', fontSize: '0.78rem' }}
          >
            <span>Close Overview</span>
          </button>
        </div>
      </div>
    </div>
  );
}
