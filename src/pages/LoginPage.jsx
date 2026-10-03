import React, { useState } from 'react';
import CometChatLogo from '../components/CometChatLogo';
import { DEMO_USERS } from '../services/cometchat';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Video,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage({ onLogin, isInitializing }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setError('Please enter your username.');
      return;
    }
    if (!trimmedPass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await onLogin({ username: trimmedUser, password: trimmedPass });
    } catch (err) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (roleKey) => {
    const demo = DEMO_USERS[roleKey];
    setUsername(demo.uid);
    setPassword('demo123');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Subtle ambient light glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(104, 81, 214, 0.09) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(51, 153, 255, 0.08) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            <CometChatLogo size={32} showText={false} isDark={false} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.45rem',
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
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                LIVE
              </span>
            </div>
          </div>

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-main)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Sign in to DealRoom
          </h1>
          <p
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-sub)',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            Real-time luxury marketplace negotiation & live video inspection
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--cc-rose-light)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: 'var(--cc-rose)',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Username Field */}
          <div>
            <label
              htmlFor="dealroom-username"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '8px'
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <User size={17} />
              </div>
              <input
                id="dealroom-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. marcus_buyer)"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 38px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--cc-purple)';
                  e.target.style.background = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px var(--cc-purple-light)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.background = 'var(--bg-surface-elevated)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label
                htmlFor="dealroom-password"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-main)'
                }}
              >
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Lock size={17} />
              </div>
              <input
                id="dealroom-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 38px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--cc-purple)';
                  e.target.style.background = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px var(--cc-purple-light)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.background = 'var(--bg-surface-elevated)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 14px var(--cc-purple-glow)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div style={{ marginTop: '26px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={12} color="var(--cc-purple)" />
            <span>Or Quick Fill Demo Account:</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Buyer Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo('buyer')}
              style={{
                flex: 1,
                padding: '9px 10px',
                borderRadius: '9px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s'
              }}
            >
              <img
                src={DEMO_USERS.buyer.avatar}
                alt="Marcus"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  Marcus (Buyer)
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>marcus_buyer</div>
              </div>
            </button>

            {/* Seller Demo Button */}
            <button
              type="button"
              onClick={() => handleSelectDemo('seller')}
              style={{
                flex: 1,
                padding: '9px 10px',
                borderRadius: '9px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s'
              }}
            >
              <img
                src={DEMO_USERS.seller.avatar}
                alt="Elena"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  Elena (Seller)
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>elena_seller</div>
              </div>
            </button>
          </div>
        </div>

        {/* Feature Badges Footer */}
        <div
          style={{
            marginTop: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} color="var(--cc-emerald)" />
            <span>Escrow Verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Video size={13} color="var(--cc-purple)" />
            <span>Macro WebRTC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} color="var(--cc-blue)" />
            <span>CometChat v7</span>
          </div>
        </div>
      </div>

      {/* Subtle Copyright / Hackathon build */}
      <div
        style={{
          marginTop: '20px',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}
      >
        DealRoom Live — Built with CometChat UI Kit v7 & WebRTC
      </div>
    </div>
  );
}
