import React, { useState } from 'react';
import CometChatLogo from '../components/CometChatLogo';
import GraphPaperCanvas from '../components/GraphPaperCanvas';
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
  AlertCircle,
  Zap,
  Layers,
  Search,
  Clock,
  Award,
  Globe,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function LoginPage({ onLogin, isInitializing, theme = 'light', onToggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback local theme if onToggleTheme isn't supplied
  const [localTheme, setLocalTheme] = useState(() => {
    return theme || (typeof window !== 'undefined' ? localStorage.getItem('dealroom_theme') : 'light') || 'light';
  });

  const currentTheme = onToggleTheme ? theme : localTheme;

  const handleToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'ramx' : 'light';
      setLocalTheme(next);
      document.body.className = `theme-${next}`;
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('dealroom_theme', next);
      } catch {}
    }
  };

  const getThemeLabel = (t) => {
    if (t === 'dark') return 'Dark Mode';
    if (t === 'ramx') return 'Minimalist Ramx';
    return 'Light Mode';
  };

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

  const handleSelectDemo = (roleKey, autoSubmit = false) => {
    const demo = DEMO_USERS[roleKey];
    setUsername(demo.uid);
    setPassword('demo123');
    setError('');
    if (autoSubmit) {
      setLoading(true);
      onLogin({ username: demo.uid, password: 'demo123' })
        .catch((err) => setError(err?.message || 'Login failed.'))
        .finally(() => setLoading(false));
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById('login-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden',
        overflowY: 'visible'
      }}
    >
      {/* 1. INTERACTIVE GRAPH PAPER CANVAS BACKGROUND WITH COLOR MOVEMENT */}
      <GraphPaperCanvas theme={currentTheme} />

      {/* FOREGROUND CONTENT WRAPPER */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        
        {/* =========================================================================
            DIVISION 1: TOP ANNOUNCEMENT BANNER
            ========================================================================= */}
        <div
          style={{
            width: '100%',
            padding: '8px 16px',
            background: currentTheme === 'dark'
              ? 'linear-gradient(90deg, rgba(255, 121, 97, 0.15) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(56, 189, 248, 0.15) 100%)'
              : 'linear-gradient(90deg, rgba(255, 121, 97, 0.1) 0%, rgba(168, 85, 247, 0.08) 50%, rgba(56, 189, 248, 0.1) 100%)',
            borderBottom: '1px solid var(--border-default)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-main)'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="var(--cc-purple)" />
            <span>Introducing DealRoom Live — High-Trust Luxury Watch Escrow & Live Macro Video Suite</span>
          </span>
          <button
            onClick={scrollToFeatures}
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--cc-purple)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Learn More</span>
            <ArrowRight size={10} />
          </button>
        </div>

        {/* =========================================================================
            DIVISION 2: FULL-WIDTH NAVIGATION BAR WITH WHITE DOT THEME SWITCHER
            ========================================================================= */}
        <header
          style={{
            height: '68px',
            width: '100%',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-default)',
            background: currentTheme === 'dark' ? 'rgba(11, 14, 23, 0.8)' : 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}
        >
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <CometChatLogo size={30} showText={false} isDark={currentTheme === 'dark'} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.3rem',
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

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: 'var(--text-sub)'
            }}
          >
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-sub)')}
            >
              Overview
            </a>
            <a
              href="#macro-video"
              onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-sub)')}
            >
              Macro Video
            </a>
            <a
              href="#smart-offers"
              onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-sub)')}
            >
              Smart Offers
            </a>
            <a
              href="#escrow-vault"
              onClick={(e) => { e.preventDefault(); scrollToFeatures(); }}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-sub)')}
            >
              Escrow Custody
            </a>
          </nav>

          {/* Right Controls: White Dot Theme Switcher + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* THE WHITE DOT THEME SWITCHER */}
            <button
              type="button"
              onClick={handleToggle}
              title={`Click white dot to toggle theme: Light → Dark → Minimalist Ramx (Current: ${getThemeLabel(currentTheme)})`}
              aria-label="Change theme"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px 6px 10px',
                borderRadius: '999px',
                background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                border: currentTheme === 'dark' ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid var(--border-strong)',
                boxShadow: currentTheme === 'dark'
                  ? '0 4px 16px rgba(0, 0, 0, 0.45)'
                  : '0 2px 10px rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Animated White Dot */}
              <div style={{ position: 'relative', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                  className="white-dot-ping"
                  style={{
                    position: 'absolute',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    pointerEvents: 'none'
                  }}
                />
                <span
                  className="white-dot-glow"
                  style={{
                    position: 'relative',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 1)',
                    display: 'block'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', userSelect: 'none' }}>
                {getThemeLabel(currentTheme)}
              </span>
            </button>

            {/* Jump to sign-in */}
            <button
              onClick={scrollToLogin}
              style={{
                padding: '8px 18px',
                borderRadius: '9px',
                background: 'var(--cc-purple)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--cc-purple-glow)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'none')}
            >
              Sign In
            </button>
          </div>
        </header>

        {/* =========================================================================
            DIVISION 3: EXPANSIVE HERO SECTION (Bold Typography & Project Pitch)
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '70px 24px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Badge pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'var(--cc-purple-light)',
              border: '1px solid rgba(255, 121, 97, 0.25)',
              marginBottom: '28px'
            }}
          >
            <ShieldCheck size={16} color="var(--cc-purple)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cc-purple)', letterSpacing: '0.02em' }}>
              Zero to Chat Hackathon 2026 • CometChat UI Kit v7 & WebRTC
            </span>
          </div>

          {/* Large Bold Hero Headline (Spread out like GenV UI) */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: '0 0 24px 0',
              maxWidth: '960px',
              color: 'var(--text-main)'
            }}
          >
            We Build for <span style={{ color: 'var(--cc-purple)' }}>Trust and Trade</span> to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Stay Fraud-Free.
            </span>
          </h1>

          {/* Project Explanation Pitch */}
          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.22rem)',
              color: 'var(--text-sub)',
              maxWidth: '780px',
              lineHeight: 1.6,
              margin: '0 0 36px 0',
              fontWeight: 400
            }}
          >
            <strong>DealRoom Live</strong> is a high-trust luxury timepiece marketplace negotiation suite.
            Equipped with <strong>live WebRTC macro-video inspection</strong>, binding <strong>smart offers</strong> in chat,
            and cryptographic <strong>smart escrow custody</strong>, buyers and sellers settle six-figure deals with absolute certainty.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
            <button
              onClick={scrollToLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
                color: '#FFFFFF',
                fontSize: '0.96rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px var(--cc-purple-glow)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'none')}
            >
              <span>Access DealRoom Below</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => handleSelectDemo('buyer', true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: '12px',
                background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.94rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'none')}
            >
              <Zap size={16} color="var(--cc-purple)" />
              <span>1-Click Buyer Demo</span>
            </button>
          </div>

          {/* Social Proof Avatar Row (Matching screenshot's "Trusted by Founders") */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Trusted by Verified Collectors, Geneva Vaults & Watchmakers
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
                ].map((avatarUrl, idx) => (
                  <img
                    key={idx}
                    src={avatarUrl}
                    alt="Verified Member"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginLeft: idx > 0 ? '-10px' : '0',
                      border: '2px solid var(--bg-surface)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                <CheckCircle2 size={16} color="var(--cc-emerald)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  100% Identity & Escrow Verified
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DIVISION 4: INTERACTIVE ACCESS HUB (Spread into Dual Wide Divisions)
            ========================================================================= */}
        <section
          id="login-section"
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '20px 24px 60px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            alignItems: 'stretch'
          }}
        >
          {/* DIVISION 4A: DIRECT CREDENTIALS AUTHENTICATION FORM */}
          <div
            style={{
              background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.85)' : 'rgba(255, 255, 255, 0.88)',
              border: '1px solid var(--border-default)',
              borderRadius: '20px',
              padding: '36px 32px',
              backdropFilter: 'blur(16px)',
              boxShadow: currentTheme === 'dark'
                ? '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
                : '0 20px 50px -10px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
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
                    <Lock size={16} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      Member Authentication
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                      Sign in with your collector or vault credentials
                    </p>
                  </div>
                </div>

                <span className="cc-badge cc-badge-purple">
                  <ShieldCheck size={11} /> 256-bit SSL
                </span>
              </div>

              {/* Error Message */}
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
                    marginBottom: '18px'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Username */}
                <div>
                  <label
                    htmlFor="dealroom-input-username"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}
                  >
                    Username / Member ID
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <User size={16} />
                    </div>
                    <input
                      id="dealroom-input-username"
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. marcus_buyer or elena_seller"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 36px',
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
                        e.target.style.background = 'var(--bg-surface)';
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

                {/* Password */}
                <div>
                  <label
                    htmlFor="dealroom-input-password"
                    style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Lock size={16} />
                    </div>
                    <input
                      id="dealroom-input-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (e.g. demo123)"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '11px 38px 11px 36px',
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
                        e.target.style.background = 'var(--bg-surface)';
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
                        padding: '2px'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '8px',
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
                    boxShadow: '0 4px 14px var(--cc-purple-glow)',
                    transition: 'transform 0.15s'
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'none')}
                >
                  {loading ? (
                    <span>Entering DealRoom...</span>
                  ) : (
                    <>
                      <span>Sign In & Open DealRoom</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-default)', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              🔒 Protected by CometChat WebRTC & Encrypted Escrow Vault Protocols
            </div>
          </div>

          {/* DIVISION 4B: FAST-TRACK DEMO PERSONAS PANEL */}
          <div
            style={{
              background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.85)' : 'rgba(255, 255, 255, 0.88)',
              border: '1px solid var(--border-default)',
              borderRadius: '20px',
              padding: '36px 32px',
              backdropFilter: 'blur(16px)',
              boxShadow: currentTheme === 'dark'
                ? '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)'
                : '0 20px 50px -10px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--cc-blue-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--cc-purple)'
                    }}
                  >
                    <Zap size={16} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      Fast-Track Demo Personas
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                      Test the dual buyer & seller roles in 1 click
                    </p>
                  </div>
                </div>

                <span className="cc-badge cc-badge-emerald">
                  <CheckCircle2 size={11} /> Ready to Test
                </span>
              </div>

              {/* Persona 1: Marcus Vance (Buyer) */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={DEMO_USERS.buyer.avatar}
                    alt="Marcus Vance"
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cc-purple)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Marcus Vance (Buyer)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="cc-badge cc-badge-purple" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                        Tier 1 Collector
                      </span>
                      <span>UID: marcus_buyer</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('buyer', true)}
                  disabled={loading}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--cc-purple)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px var(--cc-purple-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>1-Click Sign In</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {/* Persona 2: Elena Rostova (Seller) */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={DEMO_USERS.seller.avatar}
                    alt="Elena Rostova"
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--cc-blue)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Elena Rostova (Seller)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="cc-badge cc-badge-blue" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                        Geneva Vault Dealer
                      </span>
                      <span>UID: elena_seller</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectDemo('seller', true)}
                  disabled={loading}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--cc-blue)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px var(--cc-blue-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>1-Click Sign In</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} color="var(--cc-purple)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                <strong>Tip:</strong> Open a second browser window in incognito with Elena to test real-time WebRTC calling and offer counters!
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DIVISION 5: WHAT IS THE PROJECT ABOUT? (Deep-Dive Explainer Showcase)
            ========================================================================= */}
        <section
          id="features-section"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            width: '100%',
            padding: '40px 24px 80px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="cc-badge cc-badge-purple" style={{ marginBottom: '12px' }}>
              <Layers size={12} /> What Is DealRoom Live About?
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                margin: '8px 0 16px 0',
                color: 'var(--text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Solving The $4.8B Counterfeit & Trust Problem in Luxury Horology
            </h2>
            <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '1rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
              Secondary luxury watch trading suffers from sight-unseen risk, ghost bezels, counterfeit movements, and dispute fraud.
              DealRoom Live solves this through 4 integrated pillars built on top of <strong>CometChat UI Kit v7</strong>:
            </p>
          </div>

          {/* 4 Feature Columns Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: '28px 24px',
                borderRadius: '16px',
                background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--cc-purple-light)',
                  color: 'var(--cc-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Video size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                1. WebRTC Macro Video Inspection
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.55, margin: 0 }}>
                Powered by the <strong>CometChat Calls SDK</strong>. Buyers initiate 1080p macro video streams to inspect serial stamps, movement hallmarks, ghost bezels, and balance wheels before releasing escrow.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: '28px 24px',
                borderRadius: '16px',
                background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'var(--cc-blue-light)',
                  color: 'var(--cc-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Zap size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                2. Real-Time Smart Deal Offers
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.55, margin: 0 }}>
                Structured custom CometChat message types allow buyers to create binding offers. Sellers can counter-offer or accept in real time, triggering audit-proof milestones in chat history.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: '28px 24px',
                borderRadius: '16px',
                background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--cc-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                3. Cryptographic Escrow Vault
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.55, margin: 0 }}>
                Buyer funds ($13,800+) are locked in cryptographic custody. Funds are released exclusively upon dual buyer & seller sign-off after completing live video verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: '28px 24px',
                borderRadius: '16px',
                background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)',
                border: '1px solid var(--border-default)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(238, 102, 102, 0.12)',
                  color: 'var(--cc-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
                4. Native CometChat UI Kit v7
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.55, margin: 0 }}>
                Strict adherence to UI Kit v7 standards: reflow-free columns, CometChatProvider theme synchronization, CometChatErrorBoundary safety, and real-time user presence.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DIVISION 6: STEP-BY-STEP WORKFLOW TIMELINE
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '0 24px 70px'
          }}
        >
          <div
            style={{
              padding: '36px 32px',
              borderRadius: '20px',
              background: currentTheme === 'dark' ? 'rgba(16, 21, 36, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              border: '1px solid var(--border-default)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span className="cc-badge cc-badge-blue">End-To-End Architecture</span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '8px 0 6px 0', color: 'var(--text-main)' }}>
                How A Luxury Watch Deal Closes in DealRoom Live
              </h3>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-sub)' }}>
                3-stage cryptographic protocol protecting both collector and dealer
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--cc-purple)', marginBottom: '6px' }}>STEP 01</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Discovery & Smart Offer</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Marcus spots Elena's 1984 Rolex Submariner Ref. 5513 in the Marketplace and submits an initial offer of $13,800.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--cc-blue)', marginBottom: '6px' }}>STEP 02</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Live WebRTC Macro Call</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  They launch a live video inspection call inside DealRoom to examine reference stamp #8.4M and original ghost bezel under macro zoom.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: '12px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--cc-emerald)', marginBottom: '6px' }}>STEP 03</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Escrow Vault Payout</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Condition confirmed. Elena signs off, the Escrow Vault triggers payout release, and insured overnight courier is dispatched.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            DIVISION 7: FOOTER & CREDENTIALS
            ========================================================================= */}
        <footer
          style={{
            borderTop: '1px solid var(--border-default)',
            background: currentTheme === 'dark' ? 'rgba(11, 14, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            padding: '32px 32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CometChatLogo size={20} showText={false} isDark={currentTheme === 'dark'} />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>DealRoom Live</span>
            <span>•</span>
            <span>Zero to Chat Hackathon Submission</span>
            <span>•</span>
            <span>Built with @cometchat/chat-uikit-react@7</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} style={{ color: 'inherit', textDecoration: 'none' }}>
              Features
            </a>
            <a href="#login" onClick={(e) => { e.preventDefault(); scrollToLogin(); }} style={{ color: 'inherit', textDecoration: 'none' }}>
              Sign In
            </a>
            <span style={{ cursor: 'pointer' }} onClick={handleToggle}>
              Theme: {getThemeLabel(currentTheme)}
            </span>
          </div>

          <div>
            © 2026 DealRoom Live. Cryptographic Escrow & WebRTC Luxury Inspection.
          </div>
        </footer>

        {/* =========================================================================
            FLOATING PRODUCT HUNT / BADGE ACCENT (Bottom-Left like screenshot)
            ========================================================================= */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '10px',
            background: currentTheme === 'dark' ? 'rgba(20, 26, 44, 0.92)' : 'rgba(255, 255, 255, 0.94)',
            border: '1px solid var(--border-strong)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            cursor: 'pointer'
          }}
          onClick={scrollToFeatures}
        >
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ea532b',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 900
            }}
          >
            P
          </span>
          <span>Zero to Chat #1 Hackathon Entry</span>
        </div>

      </div>
    </div>
  );
}
