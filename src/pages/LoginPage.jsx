import React, { useState } from 'react';
import CometChatLogo from '../components/CometChatLogo';
import GraphPaperCanvas from '../components/GraphPaperCanvas';
import { FluidGradientText } from '@/components/fluid-gradient-text';
import { DEMO_USERS } from '../services/cometchat';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowUpRight,
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
  DollarSign,
  Activity,
  Scale,
  Check,
  ChevronDown,
  Compass
} from 'lucide-react';

const FEATURE_TABS = [
  {
    id: 'macro-video',
    title: 'Top Inspect',
    subtitle: '60fps WebRTC macro video inspection',
    tag: 'WebRTC Video',
    icon: Video,
    description: 'Inspect movement hallmarks, balance wheel oscillations, and ghost bezels in high-definition video before approving escrow funding.',
    bullets: [
      '1080p 60fps macro zoom powered by CometChat Calls SDK',
      'Anti-sniping live negotiation directly overlaid on video feed',
      'Dual-party video confirmation milestone recorded in escrow logs'
    ],
    cta: 'Try Live Video Call',
    schematic: {
      title: 'CALIBER 1520 MACRO STREAM',
      metric1: '+1.8 s/d',
      metricLabel1: 'Rate Deviation',
      metric2: '28,800 vph',
      metricLabel2: 'Frequency',
      metric3: '0.1 ms',
      metricLabel3: 'Beat Error',
      status: 'VERIFIED GENUINE',
      badge: '60 FPS 1080P'
    }
  },
  {
    id: 'smart-offers',
    title: 'Smart Offers',
    subtitle: 'Cryptographic binding negotiation in chat',
    tag: 'CometChat Bids',
    icon: Zap,
    description: 'Structured CometChat custom messages transform informal chatter into enforceable counter-offers with automated expiration windows.',
    bullets: [
      'Real-time offer counters with one-tap accept or decline in chat',
      'Automated price stepping and counter-offer thresholds',
      'Direct escrow trigger upon dealer acceptance'
    ],
    cta: 'Test Smart Offers',
    schematic: {
      title: 'BINDING OFFER: $13,800.00',
      metric1: '$13,800',
      metricLabel1: 'Offer Amount',
      metric2: '24h 00m',
      metricLabel2: 'Validity Window',
      metric3: '2.5% Escrow',
      metricLabel3: 'Vault Custody',
      status: 'OFFER PENDING SELLER ACCEPTANCE',
      badge: 'SMART MESSAGE'
    }
  },
  {
    id: 'escrow-vault',
    title: 'Escrow Vault',
    subtitle: 'Multi-sig cryptographic funds custody',
    tag: 'Safe Custody',
    icon: ShieldCheck,
    description: 'Six-figure buyer liquidity is held in insured isolation. Funds are unlocked solely upon mutual buyer and dealer authorization.',
    bullets: [
      'Bank wire, SEPA, and instant USDC settlement options',
      'Independent insured Geneva & New York physical vault nodes',
      'Zero seller chargebacks or fraudulent clawback exposure'
    ],
    cta: 'Explore Vault Security',
    schematic: {
      title: 'ESCROW CUSTODY: $13,800.00',
      metric1: '100% Insured',
      metricLabel1: 'Lloyds Underwritten',
      metric2: 'Multi-Sig',
      metricLabel2: 'Key Protocol',
      metric3: '$0 Fraud',
      metricLabel3: 'Chargeback Risk',
      status: 'FUNDS SECURED IN ESCROW',
      badge: 'GENEVA NODE'
    }
  },
  {
    id: 'uikit-v7',
    title: 'CometChat v7',
    subtitle: 'Production-grade enterprise messaging architecture',
    tag: 'UI Kit v7',
    icon: Layers,
    description: 'Built cleanly with @cometchat/chat-uikit-react@7: reflow-free columns, real-time user presence, and seamless theme synchronization.',
    bullets: [
      'CometChatProvider theme reactivity across light & dark modes',
      'CometChatErrorBoundary wrapping each modular view',
      'Reflow-free responsive containers without layout shifts'
    ],
    cta: 'View UI Kit Architecture',
    schematic: {
      title: 'COMETCHAT REACT V7 ENGINE',
      metric1: 'v7.0.0',
      metricLabel1: 'UI Kit Version',
      metric2: '< 20ms',
      metricLabel2: 'Socket Latency',
      metric3: '100% Type-Safe',
      metricLabel3: 'Component Spec',
      status: 'ALL SERVICES ONLINE',
      badge: 'SDK v7'
    }
  },
  {
    id: 'condition-audit',
    title: 'Timegrapher',
    subtitle: 'Acoustic movement diagnostic & health sync',
    tag: 'Acoustic Diagnostics',
    icon: Award,
    description: 'Sellers stream live acoustic timegrapher traces during inspection calls, proving hairspring health and amplitude consistency.',
    bullets: [
      'Acoustic amplitude and beat error real-time synchronization',
      'Historical service record matching against manufacturer specs',
      'Water resistance pressure test certificate generation'
    ],
    cta: 'View Caliber Diagnostics',
    schematic: {
      title: 'ACOUSTIC TIMEGRAPHER TRACE',
      metric1: '305°',
      metricLabel1: 'Amplitude',
      metric2: '+2 s/d',
      metricLabel2: 'Daily Rate',
      metric3: '52°',
      metricLabel3: 'Lift Angle',
      status: 'EXCELLENT HEALTH (GRADE A)',
      badge: 'CALIBER 1520'
    }
  },
  {
    id: 'dispute-room',
    title: 'Dispute Room',
    subtitle: 'Neutral Swiss horological arbitration',
    tag: 'Arbitration',
    icon: Scale,
    description: 'In the rare event of condition discrepancies, certified neutral watchmakers join a 3-way video session to audit the timepiece.',
    bullets: [
      'Certified independent master watchmaker mediation panel',
      'Binding arbitration protocol locked into escrow terms',
      'Automated refund or partial restitution disbursement'
    ],
    cta: 'Review Mediation Rules',
    schematic: {
      title: 'NEUTRAL MEDIATION VAULT',
      metric1: '0.04%',
      metricLabel1: 'Dispute Rate',
      metric2: '< 4 hours',
      metricLabel2: 'Resolution Time',
      metric3: 'Swiss Law',
      metricLabel3: 'Jurisdiction',
      status: 'ARBITRATION DOCKET CLEAR',
      badge: 'GENEVA ARBITRATION'
    }
  }
];

const MORE_FEATURES = [
  {
    title: 'Timegrapher Sync',
    sub: 'Acoustic movement amplitude & beat error monitoring',
    icon: Activity
  },
  {
    title: 'Multi-Sig Escrow',
    sub: 'Dual cryptographic buyer & seller release authorization',
    icon: ShieldCheck
  },
  {
    title: 'Serial Theft Registry',
    sub: 'Instant API check against The Watch Register stolen serials',
    icon: Search
  },
  {
    title: 'Digital Provenance',
    sub: 'Immutable ownership, service history, and hallmark records',
    icon: Award
  },
  {
    title: 'Custom Chat Types',
    sub: 'CometChat smart offer, counter-bid, and deposit bubbles',
    icon: Zap
  },
  {
    title: 'Timezone Negotiation',
    sub: 'Smart Geneva, NYC, London, and Tokyo deal schedules',
    icon: Clock
  },
  {
    title: 'Armored Logistics',
    sub: 'Automated insured overnight courier transport dispatch',
    icon: Globe
  },
  {
    title: 'Live Presence Sync',
    sub: 'Instant dealer online presence powered by CometChat presence',
    icon: User
  },
  {
    title: 'Video Dispute Vault',
    sub: 'Neutral horology arbitrator 3-way video mediation room',
    icon: Scale
  },
  {
    title: 'Dual Currency Settlement',
    sub: 'Bank wire, SEPA, and instant USDC escrow deposit rails',
    icon: DollarSign
  },
  {
    title: 'Role-Based Cockpits',
    sub: 'Tailored interfaces for VIP collectors and Geneva vault dealers',
    icon: Layers
  },
  {
    title: 'Anti-Sniping Protocol',
    sub: 'Transparent offer countdowns with 5-minute counter extensions',
    icon: Lock
  }
];

const SPONSORS = [
  { name: 'Geneva Vaults', desc: 'Insured Physical Custody', icon: ShieldCheck },
  { name: 'CometChat v7', desc: 'Chat & WebRTC Calls SDK', icon: Video },
  { name: 'Sotheby’s Escrow', desc: 'Valuation & Audit Partner', icon: Award },
  { name: 'The Watch Register', desc: 'Stolen Serial Blacklist Check', icon: Search },
  { name: '+ Your Dealership', desc: 'Apply for Certified Dealer Tier', icon: Sparkles, isAction: true }
];

export default function LoginPage({ onLogin, isInitializing, theme = 'light', onToggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Fallback local theme if onToggleTheme isn't supplied
  const [localTheme, setLocalTheme] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('dealroom_theme') : 'light';
    if (saved === 'ramx') return 'light';
    return theme || saved || 'light';
  });

  const currentTheme = onToggleTheme ? theme : localTheme;

  const handleToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = currentTheme === 'light' ? 'dark' : 'light';
      setLocalTheme(next);
      document.body.className = `theme-${next}`;
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('dealroom_theme', next);
      } catch {}
    }
  };

  const getThemeLabel = (t) => {
    return t === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setError('Please enter your CometChat UID.');
      return;
    }
    const finalPass = trimmedPass || 'demo123';

    setLoading(true);
    try {
      await onLogin({ username: trimmedUser, password: finalPass });
      setShowAuthModal(false);
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
      setShowAuthModal(false);
      onLogin({ username: demo.uid, password: 'demo123' })
        .catch((err) => setError(err?.message || 'Login failed.'))
        .finally(() => setLoading(false));
    }
  };

  const scrollToLogin = () => {
    setShowAuthModal(true);
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const activeFeature = FEATURE_TABS[activeTab] || FEATURE_TABS[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
        overflowX: 'hidden'
      }}
    >
      {/* 1. INTERACTIVE GRAPH PAPER CANVAS BACKGROUND WITH COLOR MOVEMENT */}
      <GraphPaperCanvas theme={currentTheme} />

      {/* FOREGROUND CONTENT WRAPPER */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

        {/* =========================================================================
            HEADER: OSSIUM MINIMALIST NAVIGATION BAR
            ========================================================================= */}
        <header
          style={{
            height: '64px',
            width: '100%',
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px dashed var(--border-default)',
            position: 'relative'
          }}
        >
          {/* Top border crosshairs */}
          <span className="crosshair-plus crosshair-bl">+</span>
          <span className="crosshair-plus crosshair-br">+</span>

          {/* Left: Clean Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.28rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: 'var(--text-main)'
              }}
            >
              dealroom
            </span>
          </div>

          {/* Center: Clean Nav Items */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '24px',
              fontSize: '0.84rem',
              fontWeight: 500,
              color: 'var(--text-sub)'
            }}
            className="md:flex"
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={scrollToFeatures}
            >
              <span>Platform</span>
              <ChevronDown size={12} opacity={0.6} />
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={scrollToFeatures}
            >
              <span>Escrow</span>
              <ChevronDown size={12} opacity={0.6} />
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              onClick={scrollToFeatures}
            >
              <span>Inspection</span>
              <ChevronDown size={12} opacity={0.6} />
            </div>
            <span
              style={{ cursor: 'pointer' }}
              onClick={scrollToFeatures}
            >
              Features
            </span>
            <span
              style={{ cursor: 'pointer' }}
              onClick={scrollToLogin}
            >
              Dealers
            </span>
          </nav>

          {/* Right: Theme Toggle & Sign In Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* White Dot Theme Switcher */}
            <button
              type="button"
              onClick={handleToggle}
              title={`Click white dot to toggle theme: ${currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} (Current: ${getThemeLabel(currentTheme)})`}
              aria-label="Change theme"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px 6px 10px',
                borderRadius: '999px',
                background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                border: '1px dashed var(--border-strong)',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ position: 'relative', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                  className="white-dot-glow"
                  style={{
                    position: 'relative',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 1)',
                    display: 'block'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', userSelect: 'none' }}>
                {getThemeLabel(currentTheme)}
              </span>
            </button>

            {/* Login Now Pill Button (Matching Ossium) */}
            <button
              onClick={scrollToLogin}
              className="ossium-btn-primary"
              style={{
                padding: '7px 18px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              Sign In
            </button>
          </div>
        </header>

        {/* =========================================================================
            HERO SECTION: OSSIUM HEADLINE, PILL BADGE & DUAL CTAS (Screenshot 1)
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            width: '100%',
            padding: '64px 24px 36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Top Pill Announcement Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px dashed var(--border-strong)',
              marginBottom: '28px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-sub)'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
                display: 'inline-block'
              }}
            />
            <span>CometChat UI Kit v7 & WebRTC Escrow Protocol</span>
          </div>

          {/* Hero Headline with Emerald Keyword (Iconic Ossium Style) */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.3rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: '0 0 20px 0',
              maxWidth: '920px',
              color: 'var(--text-main)'
            }}
          >
            The ultimate hub for{' '}
            <span style={{ color: '#10b981' }}>luxury timepiece</span>{' '}
            escrow.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(0.98rem, 1.8vw, 1.18rem)',
              color: 'var(--text-sub)',
              maxWidth: '720px',
              lineHeight: 1.6,
              margin: '0 0 34px 0',
              fontWeight: 400
            }}
          >
            Inspect movements via 60fps WebRTC macro video, negotiate binding smart offers in chat, and lock funds in cryptographic escrow custody.
          </p>

          {/* Dual Pill CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={scrollToLogin}
              className="ossium-btn-primary"
            >
              <span>Start Trading</span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() => handleSelectDemo('buyer', true)}
              className="ossium-btn-secondary"
            >
              <Zap size={14} color="#10b981" />
              <span>1-Click Buyer Demo</span>
            </button>
          </div>
        </section>

        {/* =========================================================================
            SPONSORS / ECOSYSTEM GRID: 5-COLUMN DASHED GRID WITH CROSSHAIRS (Screenshot 2)
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '0 24px 70px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Some of the institutions and technologies that power DealRoom
            </span>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              border: '1px dashed var(--border-default)',
              background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <span className="crosshair-plus crosshair-tl">+</span>
            <span className="crosshair-plus crosshair-tr">+</span>
            <span className="crosshair-plus crosshair-bl">+</span>
            <span className="crosshair-plus crosshair-br">+</span>

            {SPONSORS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.name}
                  style={{
                    padding: '24px 20px',
                    borderRight: idx < SPONSORS.length - 1 ? '1px dashed var(--border-default)' : 'none',
                    background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <span className="crosshair-plus crosshair-tl">+</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <Icon size={16} color={s.isAction ? '#10b981' : 'var(--text-main)'} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            FEATURE SHOWCASE: INTERACTIVE TABS & PREVIEW (Screenshots 2 & 3)
            ========================================================================= */}
        <section
          id="features-section"
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '20px 24px 70px'
          }}
        >
          {/* Centered Section Header with Badge */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '999px',
                border: '1px dashed var(--border-strong)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '16px'
              }}
            >
              <span>Features</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                margin: '0 0 10px 0',
                color: 'var(--text-main)',
                letterSpacing: '-0.03em'
              }}
            >
              What you can do in dealroom
            </h2>

            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              Main tools are on top. Click one to see what it does. More tools are listed below.
            </p>
          </div>

          {/* 6 Tabs Row inside Dashed Border */}
          <div
            className="ossium-tabs-row no-scrollbar"
            style={{
              marginBottom: '32px',
              borderTop: currentTheme === 'dark' ? '1px dashed rgba(255, 255, 255, 0.25)' : '1px dashed rgba(0, 0, 0, 0.20)',
              borderBottom: currentTheme === 'dark' ? '1px dashed rgba(255, 255, 255, 0.25)' : '1px dashed rgba(0, 0, 0, 0.20)',
              background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
              position: 'relative'
            }}
          >
            <span className="crosshair-plus crosshair-tl" style={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)', fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-tr" style={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)', fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-bl" style={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)', fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-br" style={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)', fontSize: '14px', fontWeight: 800 }}>+</span>

            {FEATURE_TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: '18px 8px',
                    border: 'none',
                    background: isActive
                      ? (currentTheme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)')
                      : (currentTheme === 'dark' ? '#090D17' : '#FFFFFF'),
                    borderRight: idx < 5
                      ? (currentTheme === 'dark' ? '1px dashed rgba(255, 255, 255, 0.25)' : '1px dashed rgba(0, 0, 0, 0.20)')
                      : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '9px',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    minWidth: 0
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive ? '#10b981' : (currentTheme === 'dark' ? '#94A3B8' : '#475569')}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
                    <div
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: isActive
                          ? (currentTheme === 'dark' ? '#FFFFFF' : '#100F0F')
                          : (currentTheme === 'dark' ? '#F1F5F9' : '#0F172A'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {tab.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive
                          ? '#10b981'
                          : (currentTheme === 'dark' ? '#94A3B8' : '#64748B'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px'
                      }}
                    >
                      {tab.tag}
                    </div>
                  </div>

                  {/* Active Underline Indicator Bar - vibrant and clear */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 16px rgba(16, 185, 129, 0.9), 0 0 6px #10b981',
                        zIndex: 5
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Panel with Crosshair Frame (Screenshot 3) */}
          <div
            style={{
              position: 'relative',
              border: '1px dashed var(--border-default)',
              borderRadius: '16px',
              padding: '36px 32px',
              background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
              boxShadow: currentTheme === 'dark' ? '0 16px 40px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '36px',
              alignItems: 'center'
            }}
          >
            <span className="crosshair-plus crosshair-tl">+</span>
            <span className="crosshair-plus crosshair-tr">+</span>
            <span className="crosshair-plus crosshair-bl">+</span>
            <span className="crosshair-plus crosshair-br">+</span>

            {/* Left Column: Description & Checkmarks */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  border: '1px dashed #10b981',
                  color: '#10b981',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  marginBottom: '18px'
                }}
              >
                <Compass size={13} />
                <span>{activeFeature.tag}</span>
              </div>

              <h3
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 12px 0',
                  color: 'var(--text-main)',
                  letterSpacing: '-0.02em'
                }}
              >
                {activeFeature.subtitle}
              </h3>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                {activeFeature.description}
              </p>

              {/* Bullet points with green checkmarks (☑) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {activeFeature.bullets.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={scrollToLogin}
                className="ossium-btn-primary"
              >
                <span>{activeFeature.cta}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Right Column: Technical Schematic Display Card */}
            <div
              style={{
                position: 'relative',
                border: '1px dashed var(--border-strong)',
                borderRadius: '12px',
                padding: '24px',
                background: currentTheme === 'dark' ? '#070A11' : '#F4F5F7'
              }}
            >
              <span className="crosshair-plus crosshair-tl">+</span>
              <span className="crosshair-plus crosshair-tr">+</span>
              <span className="crosshair-plus crosshair-bl">+</span>
              <span className="crosshair-plus crosshair-br">+</span>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {activeFeature.schematic.title}
                </span>
                <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.66rem' }}>
                  {activeFeature.schematic.badge}
                </span>
              </div>

              {/* Metric Readouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {activeFeature.schematic.metric1}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                    {activeFeature.schematic.metricLabel1}
                  </div>
                </div>

                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {activeFeature.schematic.metric2}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                    {activeFeature.schematic.metricLabel2}
                  </div>
                </div>

                <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {activeFeature.schematic.metric3}
                  </div>
                  <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                    {activeFeature.schematic.metricLabel3}
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px dashed rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem'
                }}
              >
                <span style={{ fontWeight: 700, color: '#10b981' }}>{activeFeature.schematic.status}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>COMETCHAT WEBRTC OK</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            "MORE FEATURES" 4x3 BENTO GRID WITH CROSSHAIRS (Screenshot 3)
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '0 24px 70px'
          }}
        >
          {/* Bento Box Container with Solid Dark/Light Background */}
          <div
            style={{
              position: 'relative',
              border: '1px dashed var(--border-default)',
              background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {/* Grid Label Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px dashed var(--border-default)',
                padding: '14px 20px',
                background: currentTheme === 'dark' ? '#070A11' : '#F9F9F9',
                position: 'relative'
              }}
            >
              <span className="crosshair-plus crosshair-tl">+</span>
              <span className="crosshair-plus crosshair-tr">+</span>
              <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                MORE FEATURES
              </span>
            </div>

            {/* 4-column Bento Grid */}
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF'
              }}
            >
              <span className="crosshair-plus crosshair-tl">+</span>
              <span className="crosshair-plus crosshair-tr">+</span>
              <span className="crosshair-plus crosshair-bl">+</span>
              <span className="crosshair-plus crosshair-br">+</span>

              {MORE_FEATURES.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    style={{
                      padding: '24px 20px',
                      borderRight: '1px dashed var(--border-default)',
                      borderBottom: '1px dashed var(--border-default)',
                      background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
                      position: 'relative',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = currentTheme === 'dark' ? '#111728' : '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = currentTheme === 'dark' ? '#090D17' : '#FFFFFF';
                    }}
                  >
                    <span className="crosshair-plus crosshair-tl">+</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Icon size={16} color="var(--text-main)" />
                      <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {item.title}
                      </h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                      {item.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>



        {/* =========================================================================
            PRE-FOOTER ATMOSPHERIC BANNER (Screenshot 4)
            ========================================================================= */}
        <section
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            width: '100%',
            padding: '0 24px 60px'
          }}
        >
          <div
            style={{
              position: 'relative',
              border: '1px dashed var(--border-default)',
              borderRadius: '16px',
              padding: '40px 32px',
              background: currentTheme === 'dark'
                ? 'radial-gradient(circle at 80% 50%, rgba(48, 128, 255, 0.12) 0%, #090D17 70%)'
                : 'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.08) 0%, #FFFFFF 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px'
            }}
          >
            <span className="crosshair-plus crosshair-tl">+</span>
            <span className="crosshair-plus crosshair-tr">+</span>
            <span className="crosshair-plus crosshair-bl">+</span>
            <span className="crosshair-plus crosshair-br">+</span>

            <div style={{ maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 10px 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Ready to trade luxury timepieces without risk?
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                Join verified collectors and independent Geneva dealers settling six-figure trades with CometChat video inspection and cryptographic escrow.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={scrollToLogin}
                className="ossium-btn-primary"
              >
                <span>Log In</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => handleSelectDemo('buyer', true)}
                className="ossium-btn-secondary"
              >
                <span>1-Click Demo</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SEAMLESS FLUID GRADIENT TEXT (dealroom)
            ========================================================================= */}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '20px',
            color: 'var(--text-main)',
            background: 'transparent'
          }}
        >
          <FluidGradientText text="dealroom" />
        </div>

        {/* =========================================================================
            RICH BLUEPRINT FOOTER: 6-COLUMN ARCHITECTURE (Screenshot 4)
            ========================================================================= */}
        <footer
          style={{
            borderTop: '1px dashed var(--border-default)',
            background: currentTheme === 'dark' ? 'rgba(7, 10, 17, 0.8)' : 'rgba(249, 249, 249, 0.8)',
            padding: '50px 24px 36px',
            position: 'relative'
          }}
        >
          <div
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              width: '100%',
              position: 'relative'
            }}
          >
            {/* Top row: Brand + 6 Columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '32px',
                borderBottom: '1px dashed var(--border-default)',
                paddingBottom: '40px',
                position: 'relative'
              }}
            >
              <span className="crosshair-plus crosshair-tl">+</span>
              <span className="crosshair-plus crosshair-tr">+</span>

              {/* Bio & Status Column */}
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.04em' }}>
                  dealroom
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.6, margin: '12px 0 16px 0', maxWidth: '300px' }}>
                  High-trust luxury timepiece negotiation and escrow protocol powered by CometChat UI Kit v7 and WebRTC Calls SDK.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  <span>All escrow and WebRTC nodes online</span>
                </div>
              </div>

              {/* Col 1: Product */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Product</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Marketplace</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>DealRoom Live</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Escrow Vault</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Macro Video</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Smart Offers</span>
                </div>
              </div>

              {/* Col 2: Protocol */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Protocol</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Multi-Sig Custody</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>CometChat v7</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>WebRTC Calls</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Timegrapher Sync</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Audit Trail</span>
                </div>
              </div>

              {/* Col 3: Dealers */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Dealers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToLogin}>Geneva Vault</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToLogin}>Tokyo Network</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToLogin}>KYC Verification</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToLogin}>Custody Fees</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToLogin}>Dispute Rules</span>
                </div>
              </div>

              {/* Col 4: Company */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Company</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>About DealRoom</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Security Audit</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Horology Board</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Terms of Escrow</span>
                  <span style={{ cursor: 'pointer' }} onClick={scrollToFeatures}>Privacy Policy</span>
                </div>
              </div>

              {/* Col 5: Developers */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>Developers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <span style={{ cursor: 'pointer' }}>llms.txt</span>
                  <span style={{ cursor: 'pointer' }}>CometChat UI Kit</span>
                  <span style={{ cursor: 'pointer' }}>WebRTC SDK</span>
                  <span style={{ cursor: 'pointer' }}>API Reference</span>
                  <span style={{ cursor: 'pointer' }}>Hackathon 2026</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Socials & Copyright */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '24px',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span>Follow us:</span>
                <span style={{ color: 'var(--text-sub)', cursor: 'pointer' }}>Twitter/X</span>
                <span style={{ color: 'var(--text-sub)', cursor: 'pointer' }}>LinkedIn</span>
                <span style={{ color: 'var(--text-sub)', cursor: 'pointer' }}>GitHub</span>
                <span style={{ color: 'var(--text-sub)', cursor: 'pointer' }}>Discord</span>
              </div>

              <div>
                © 2026 DealRoom. All rights reserved. Built for CometChat Zero to Chat Hackathon.
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* =========================================================================
          SIGN-IN & DEMO AUTH MODAL (Clean, Non-Intrusive Popup)
          ========================================================================= */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '20px'
          }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              borderRadius: '16px',
              border: '1px dashed var(--border-strong)',
              background: currentTheme === 'dark' ? '#090D17' : '#FFFFFF',
              padding: '30px',
              position: 'relative',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="crosshair-plus crosshair-tl" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-tr" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-bl" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>
            <span className="crosshair-plus crosshair-br" style={{ fontSize: '14px', fontWeight: 800 }}>+</span>

            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-sub)',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Sign In to DealRoom Live
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                Enter your CometChat UID credentials to access your deal cockpit:
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#ef4444',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '5px' }}>
                  CometChat UID
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your UID"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-main)',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '5px' }}>
                  Password / Auth Key
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 36px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-main)',
                      fontSize: '0.84rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isInitializing}
                className="ossium-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '6px' }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to DealRoom'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
