import React, { useState } from 'react';
import { Shield, Key, Globe, Terminal, ExternalLink, X, CheckCircle, AlertCircle } from 'lucide-react';
import { APP_ID, REGION, AUTH_KEY } from '../services/cometchat';

export default function CredentialsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(5, 8, 15, 0.8)',
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
          maxWidth: '560px',
          background: '#0e1424',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '24px',
          color: '#f8fafc',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          animation: 'slideDown 0.25s ease-out'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}
            >
              <Key size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              CometChat Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Status */}
        <div
          style={{
            padding: '14px',
            borderRadius: '10px',
            background: APP_ID ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            border: `1px solid ${APP_ID ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>
            {APP_ID ? (
              <>
                <CheckCircle size={16} color="#34d399" />
                <span style={{ color: '#34d399' }}>Credentials Loaded from .env</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} color="#fb7185" />
                <span style={{ color: '#fb7185' }}>Awaiting Credentials in .env</span>
              </>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {APP_ID
              ? `Connected to App ID: ${APP_ID.substring(0, 8)}... (${REGION?.toUpperCase()})`
              : 'Add your CometChat App ID, Region, and Auth Key to your local .env file to enable live messaging.'}
          </div>
        </div>

        {/* Instructions */}
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>Option A: Fast CLI Sync</div>
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#060911',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#38bdf8',
              marginBottom: '12px'
            }}
          >
            npx @cometchat/skills-cli@3 auth login && npx @cometchat/skills-cli@3 provision run
          </div>

          <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>Option B: Manual .env file</div>
          <div style={{ fontSize: '0.78rem' }}>
            Grab your credentials from{' '}
            <a
              href="https://app.cometchat.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#818cf8', textDecoration: 'underline' }}
            >
              app.cometchat.com
            </a>{' '}
            and paste them into <code style={{ color: '#38bdf8' }}>.env</code> in your project root:
          </div>
          <pre
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#060911',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#a7f3d0',
              marginTop: '6px'
            }}
          >
{`VITE_COMETCHAT_APP_ID=your_app_id
VITE_COMETCHAT_REGION=us
VITE_COMETCHAT_AUTH_KEY=your_auth_key`}
          </pre>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '8px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          Got It
        </button>
      </div>
    </div>
  );
}
