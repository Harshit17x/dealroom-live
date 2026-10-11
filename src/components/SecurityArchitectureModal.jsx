import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Server,
  Key,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Code2,
  Terminal,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { IS_DEMO_MODE, getSecurityArchitectureDetails } from '../services/cometchat';

export default function SecurityArchitectureModal({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onSwitchPersona,
  theme = 'light'
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'server-code' | 'checklist'
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const securityInfo = getSecurityArchitectureDetails();

  const serverSampleCode = `// -------------------------------------------------------------
// PRODUCTION COMETCHAT AUTH TOKEN ENDPOINT (e.g. /api/cometchat-token)
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
      \`https://\${process.env.COMETCHAT_APP_ID}.api-\${process.env.COMETCHAT_REGION}.cometchat.io/v3/users/\${uid}/auth_tokens\`,
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
    return res.json({ authToken: data.data.authToken });
  } catch (err) {
    console.error('CometChat Token Minting Error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Client-side call:
// const res = await fetch('/api/cometchat-token', { credentials: 'include' });
// const { authToken } = await res.json();
// await CometChatUIKit.loginWithAuthToken(authToken);`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(serverSampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  DEMO EVALUATION MODE
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
                Comparing hackathon zero-friction evaluation bypass against production token-minting architecture.
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
            <span>Server-Minted Token Endpoint</span>
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
            Production Checklist
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
                  <strong>Why does the app auto-enter as Marcus Vance?</strong>
                  <br />
                  For hackathon review, requiring reviewers to manually sign up or supply credentials creates unnecessary friction.
                  DealRoom Live includes an automatic demo bypass (<code style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 4px', borderRadius: '4px' }}>HACKATHON_DEMO_SESSION</code>)
                  and client user provisioning (<code style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 4px', borderRadius: '4px' }}>ensureDevUser</code>).
                  In production, this bypass is disabled and CometChat production guidelines are enforced.
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
                      Hackathon Demo Mode (Active)
                    </span>
                    <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                      Evaluator Convenience
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Auto-login:</strong> Automatically lands as <code>marcus_buyer</code> with zero login barriers.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Dev User Provisioning:</strong> <code>ensureDevUser()</code> creates Elena, Marcus, and Henri client-side.
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
                      Production Hardening (CometChat v7)
                    </span>
                    <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      Enterprise Safe
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Server Auth Tokens:</strong> Authenticates via <code>loginWithAuthToken(token)</code> minted per authenticated user.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Zero Key Leakage:</strong> Auth Key is completely omitted from the client bundle (verified via CI grep).
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: 'var(--text-main)' }}>
                        <strong>Server-Side Provisioning:</strong> Users created on signup via backend REST API (<code>POST /v3/users</code>) with REST API Key.
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
                  {onSwitchPersona && (
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
                  Production server endpoint pattern from <code>cometchat-react-v7-production</code> skill:
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
                Official CometChat React v7 Pre-Launch Production Security Checklist:
              </div>

              {[
                { label: 'Auth Key absent from production client bundle', desc: 'Verified via CI command: npm run build && grep -rll "<AUTH_KEY>" dist/', status: 'documented' },
                { label: 'loginWithAuthToken(token) used in production', desc: 'src/services/cometchat.js exports loginWithAuthToken ready for server endpoint integration', status: 'ready' },
                { label: 'UID derived from server session', desc: 'Never accept client-supplied ?uid= query parameter on token minting endpoints', status: 'ready' },
                { label: 'Users created server-side', desc: 'Registration handled via POST /v3/users with REST API Key; no client createUser with Auth Key', status: 'ready' },
                { label: 'HTTPS enforced for WebRTC calls', desc: 'Required by browser mediaDevices.getUserMedia() and CometChat Calls SDK', status: 'ready' },
                { label: 'Safe Sequential Logout', desc: 'CometChatUIKit.logout() invoked to tear down session, call channels, and listeners', status: 'ready' }
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
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
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
