import React, { useState } from 'react';
import { MARKETPLACE_ITEMS } from '../services/marketplaceData';
import {
  Search,
  Bookmark,
  Video,
  MessageSquare,
  Lock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
  Bell,
  Eye,
  Activity,
  Layers,
  Award
} from 'lucide-react';

export default function DashboardHomePage({
  activeTab = 'dashboard',
  onSelectTab,
  onOpenDealRoom,
  onLaunchVideoInspection,
  onOpenEscrowVault,
  onOpenMarketplace,
  theme = 'light'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All Currencies');
  const [bookmarkedIds, setBookmarkedIds] = useState(['rolex-5513']);

  const filterPills = [
    'All',
    'Rolex',
    'Patek Philippe',
    'Audemars Piguet',
    'Omega',
    'Escrow Active',
    'Live Call',
    'Geneva Vault',
    'USDC Rails',
    'SEPA Wire'
  ];

  const isDark = theme === 'dark';

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.seller.name.toLowerCase().includes(q) ||
      item.reference.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Rolex') return item.title.includes('Rolex');
    if (activeFilter === 'Patek Philippe') return item.title.includes('Patek');
    if (activeFilter === 'Audemars Piguet') return item.title.includes('Audemars');
    if (activeFilter === 'Omega') return item.title.includes('Omega');
    if (activeFilter === 'Escrow Active') return item.currentOffer !== null;
    if (activeFilter === 'Live Call') return item.id === 'rolex-5513';
    if (activeFilter === 'Geneva Vault') return item.seller.location.includes('Geneva');
    return true;
  });

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        padding: '24px 32px 60px'
      }}
    >
      {/* 1. Top Utility Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-default)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            WebRTC Node Online · Geneva FreePort Synced
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onLaunchVideoInspection}
            className="ossium-btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Video size={13} color="#10b981" />
            <span>Launch 60fps Macro Video</span>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={14} color="#10b981" />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Tier 1 Vault Settlement</span>
          </div>
        </div>
      </div>

      {/* 2. Main Page Header (matching "Top OSS" title in Ossium.in screenshot) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              margin: '0 0 6px 0',
              color: 'var(--text-main)',
              letterSpacing: '-0.03em'
            }}
          >
            Top Watch Escrows & DealRooms
          </h1>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-sub)' }}>
            Verified luxury timepieces in multi-signature cryptographic escrow with live CometChat video inspection.
          </p>
        </div>

        {/* Dropdowns on Right (like "All Languages" / "All Popularity" in Ossium) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>All Currencies</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </div>

          <div
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span>All Vault Tiers</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* 3. Full-width Search Bar */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search active escrows, timepiece serials, caliber models, or Geneva dealers..."
          style={{
            width: '100%',
            padding: '11px 16px 11px 40px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-main)',
            fontSize: '0.86rem',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--text-main)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>

      {/* 4. Filter Tag Pills Bar (matching the horizontal tag list in Ossium) */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '26px',
          paddingBottom: '4px'
        }}
      >
        {filterPills.map((pill) => {
          const isActive = activeFilter === pill;
          return (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: isActive
                  ? '1px solid var(--text-main)'
                  : '1px solid var(--border-default)',
                background: isActive
                  ? (isDark ? '#FFFFFF' : '#100F0F')
                  : 'var(--bg-surface)',
                color: isActive
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : 'var(--text-sub)',
                fontSize: '0.78rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* 5. Main Bento Cards Grid (2-columns of watch escrow cards + 1-column tech widgets) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* Watch Escrow Cards */}
        {filteredItems.map((item) => {
          const isBookmarked = bookmarkedIds.includes(item.id);
          const hasOffer = item.currentOffer !== null;

          return (
            <div
              key={item.id}
              style={{
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                position: 'relative',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              {/* Card Header: Thumbnail + Title + Bookmark */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-default)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.02rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '-0.02em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {item.reference} · {item.seller.location}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleBookmark(item.id, e)}
                  title="Bookmark Escrow"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isBookmarked ? '#10b981' : 'var(--text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease'
                  }}
                >
                  <Bookmark size={17} fill={isBookmarked ? '#10b981' : 'none'} />
                </button>
              </div>

              {/* Subtitle / Description */}
              <p style={{ margin: 0, fontSize: '0.80rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                {item.description}
              </p>

              {/* Tag Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    color: 'var(--text-main)'
                  }}
                >
                  {item.category}
                </span>

                {item.id === 'rolex-5513' && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#10b981'
                    }}
                  >
                    ● WebRTC Call Ready
                  </span>
                )}

                {hasOffer && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(48, 128, 255, 0.12)',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#3080ff'
                    }}
                  >
                    Escrow #EV-8821
                  </span>
                )}

                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    fontSize: '0.70rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {item.condition.split('(')[0].trim()}
                </span>
              </div>

              {/* 4 Metric Readouts (matching the exact 4-metric table in Ossium cards) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {hasOffer ? 'Binding Offer' : 'Listing Price'}
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    ${hasOffer ? item.currentOffer.toLocaleString() : item.price.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Custody Vault
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.seller.location.split(',')[0]} FreePort
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Serial Registry
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>
                    {item.serial.split(' ')[0]} (Verified)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Settlement Rail
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                    USDC / Bank Wire
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <button
                  onClick={() => onOpenDealRoom(item)}
                  className="ossium-btn-primary"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageSquare size={13} />
                  <span>Enter DealRoom</span>
                  <ArrowUpRight size={13} />
                </button>

                <button
                  onClick={onLaunchVideoInspection}
                  className="ossium-btn-secondary"
                  title="Launch Live WebRTC Macro Inspection"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Video size={13} color="#10b981" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Interactive Feature Modal for Horology Services in Sidebar */}
      {['timegrapher', 'theft', 'dispute', 'logistics', 'geneva', 'provenance', 'offers', 'currency'].includes(activeTab) && (
        <div
          onClick={() => onSelectTab && onSelectTab('dashboard')}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              borderRadius: '16px',
              background: isDark ? '#0d0d0d' : '#FFFFFF',
              border: '1px dashed var(--border-strong)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              padding: '30px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => onSelectTab && onSelectTab('dashboard')}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            {activeTab === 'timegrapher' && (
              <div>
                <span className="cc-badge cc-badge-purple" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>
                  Acoustic Diagnostics
                </span>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Timegrapher Movement Amplitude
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Real-time movement microphone capture synchronized with CometChat WebRTC audio streams to analyze escapement cadence.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Rate</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>+2.1 s/d</div>
                    <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '2px' }}>COSC Chronometer Grade</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amplitude</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>285°</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Healthy Balance Arc</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Beat Error</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>0.1 ms</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Zero Pallet Friction</div>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frequency</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>19,800 A/h</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cal. 1520 Spec</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTab && onSelectTab('dashboard');
                    onLaunchVideoInspection();
                  }}
                  className="ossium-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  <Video size={14} />
                  <span>Verify Movement on Live Call</span>
                </button>
              </div>
            )}

            {activeTab === 'theft' && (
              <div>
                <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>
                  Stolen Serial API
                </span>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  The Watch Register Verification
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Automated serial blacklist audit against 850,000+ stolen luxury watches worldwide prior to escrow deposit release.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>Rolex Submariner 5513</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Serial: 8,421,904</div>
                    </div>
                    <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.66rem' }}>● Clean Record</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>Patek Philippe 5196G</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Serial: 5,910,248</div>
                    </div>
                    <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.66rem' }}>● Archive Extract OK</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>Audemars Piguet 15202ST</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Serial: K-88129</div>
                    </div>
                    <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.66rem' }}>● Clean Record</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectTab && onSelectTab('dashboard')}
                  className="ossium-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  <span>Close Registry Report</span>
                </button>
              </div>
            )}

            {activeTab === 'dispute' && (
              <div>
                <span className="cc-badge cc-badge-purple" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>
                  WebRTC Arbitration
                </span>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Neutral Video Dispute Vault
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Neutral Geneva horology arbitrator mediation room enabled with multi-party CometChat WebRTC calling.
                </p>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Arbitration Protocol:</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.76rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
                    <li>Independent horologist verifies caliber and dial plots over 60fps macro feed.</li>
                    <li>Funds held in Base L2 escrow smart contract cannot be liquidated without 2-of-3 multi-sig keys.</li>
                    <li>Dispute resolution history is sealed and cryptographically verifiable.</li>
                  </ul>
                </div>

                <button
                  onClick={() => onSelectTab && onSelectTab('dashboard')}
                  className="ossium-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  <span>Return to Cockpit</span>
                </button>
              </div>
            )}

            {['logistics', 'geneva', 'provenance', 'offers', 'currency'].includes(activeTab) && (
              <div>
                <span className="cc-badge cc-badge-emerald" style={{ fontSize: '0.68rem', marginBottom: '8px' }}>
                  Horology Custody
                </span>
                <h3 style={{ margin: '6px 0 10px 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {activeTab === 'logistics' && 'Armored Overnight Courier Dispatch'}
                  {activeTab === 'geneva' && 'Geneva FreePort Bonded Storage'}
                  {activeTab === 'provenance' && 'Immutable Provenance & Hallmark Vault'}
                  {activeTab === 'offers' && 'CometChat Smart Offer & Bidding Bubbles'}
                  {activeTab === 'currency' && 'Dual Currency USDC & SEPA Settlement'}
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.84rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                  Integrated protocol active on DealRoom Live ensuring secure, zero-chargeback timepiece trades between Geneva and collectors worldwide.
                </p>

                <button
                  onClick={() => onSelectTab && onSelectTab('dashboard')}
                  className="ossium-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  <span>Return to Cockpit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
