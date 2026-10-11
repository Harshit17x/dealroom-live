import React, { useState } from 'react';
import { CURRENT_ITEM } from '../services/cometchat';
import {
  ShieldCheck,
  Video,
  DollarSign,
  Tag,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';

export default function DealInspectionHub({
  currentRole,
  onMakeOffer,
  onStartCall,
  activeOffer,
  item = CURRENT_ITEM,
  connectionStatus = 'connected',
  initError = null
}) {
  const displayItem = item || CURRENT_ITEM;
  const [offerAmount, setOfferAmount] = useState(String(activeOffer?.amount || Math.round((displayItem.price || 14500) * 0.95)));
  const [offerNote, setOfferNote] = useState('Escrow ready. Please verify serial stamps on live video.');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerError, setOfferError] = useState(null);

  React.useEffect(() => {
    if (activeOffer?.amount) {
      setOfferAmount(String(activeOffer.amount));
    } else if (displayItem?.price) {
      setOfferAmount(String(Math.round(displayItem.price * 0.95)));
    }
  }, [activeOffer?.dealId, activeOffer?.amount, displayItem?.id, displayItem?.price]);

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    const val = Number(offerAmount);
    if (!offerAmount || isNaN(val) || !Number.isFinite(val)) {
      setOfferError('Please enter a valid numeric offer amount.');
      return;
    }
    if (val < 100) {
      setOfferError('Minimum offer amount is $100.');
      return;
    }
    if (val > 10000000) {
      setOfferError('Maximum offer cannot exceed $10,000,000.');
      return;
    }
    setOfferError(null);
    onMakeOffer(val, offerNote);
    setShowOfferForm(false);
  };

  const itemImages = displayItem.images || [displayItem.image || CURRENT_ITEM.images[0]];
  const dealerLocation = displayItem.title?.includes('Rolex') ? 'Geneva Luxury Vault' : 'Zurich Haute Horlogerie';

  return (
    <aside
      className="side-column"
      style={{
        width: '330px',
        flexShrink: 0,
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '18px',
        transition: 'background 0.2s, border-color 0.2s'
      }}
    >
      {/* Product Image & Badges */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
        <img
          src={itemImages[0]}
          alt={displayItem.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
          <span className="cc-badge cc-badge-emerald" style={{ backdropFilter: 'blur(8px)', background: 'rgba(16, 185, 129, 0.9)', color: '#fff' }}>
            <ShieldCheck size={12} /> Certified Authenticated
          </span>
        </div>
      </div>

      {/* Title & Asking Price */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {dealerLocation}
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 8px 0', lineHeight: 1.35, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
          {displayItem.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            ${(displayItem.price || 0).toLocaleString()}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Asking Price (USD)</span>
        </div>
      </div>

      {/* Item Specs Table */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '0.78rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Reference:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{displayItem.reference || 'Ref. Standard'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
          <span style={{ color: 'var(--cc-emerald)', fontWeight: 700 }}>{displayItem.condition || 'Mint'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Serial Stamp:</span>
          <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{displayItem.serial || 'Verified Serial'}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        {/* Start Video Inspection Call (CometChat Calls SDK) */}
        <button
          onClick={onStartCall}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--text-main)',
            color: 'var(--bg-surface)',
            border: '1px solid var(--text-main)',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.12)',
            transition: 'transform 0.15s'
          }}
        >
          <Video size={17} />
          <span>Launch Video Inspection</span>
        </button>

        {/* Make Offer Button (for Buyer) */}
        {currentRole === 'buyer' && (
          <button
            onClick={() => setShowOfferForm(!showOfferForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              borderRadius: '10px',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-strong)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <DollarSign size={16} color="var(--cc-emerald)" />
            <span>{showOfferForm ? 'Cancel Offer' : 'Submit DealRoom Offer'}</span>
          </button>
        )}

        {/* Offer Form Drawer */}
        {showOfferForm && (
          <form
            onSubmit={handleSubmitOffer}
            style={{
              padding: '12px',
              background: 'var(--bg-surface-elevated)',
              border: '1.5px solid var(--cc-purple)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              animation: 'slideDown 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>Your Offer (USD)</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => {
                  setOfferAmount(e.target.value);
                  if (offerError) setOfferError(null);
                }}
                min={100}
                max={10000000}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 24px',
                  background: 'var(--bg-surface)',
                  border: offerError ? '1px solid #ef4444' : '1px solid var(--border-default)',
                  borderRadius: '7px',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {offerError && (
              <div style={{ color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} />
                <span>{offerError}</span>
              </div>
            )}

            <textarea
              placeholder="Add verification note..."
              value={offerNote}
              onChange={(e) => setOfferNote(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '7px 9px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '7px',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                resize: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                padding: '9px',
                background: 'var(--text-main)',
                color: 'var(--bg-surface)',
                fontWeight: 700,
                fontSize: '0.84rem',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer'
              }}
            >
              Send Smart Offer
            </button>
          </form>
        )}
      </div>

      {/* CometChat Security Guarantee / Connection Status */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px',
          background: connectionStatus === 'auth_failed' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)',
          border: connectionStatus === 'auth_failed' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-default)',
          borderRadius: '10px',
          fontSize: '0.74rem',
          color: 'var(--text-sub)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            color: connectionStatus === 'connected'
              ? 'var(--text-main)'
              : connectionStatus === 'auth_failed'
              ? '#ef4444'
              : '#f59e0b',
            marginBottom: '3px'
          }}
        >
          {connectionStatus === 'auth_failed' ? <AlertCircle size={14} /> : <Sparkles size={14} />}
          {connectionStatus === 'connected' && 'Guardrails Planned (Demo Policy Indicator)'}
          {connectionStatus === 'initializing' && 'Initializing CometChat…'}
          {connectionStatus === 'auth_failed' && 'Connection Inactive (Auth Failed)'}
          {connectionStatus === 'offline_demo' && 'Guardrails Planned (Demo Policy Indicator)'}
        </div>
        <div>
          {connectionStatus === 'connected' && 'CometChat Content Moderation & Rules Engine require dashboard configuration. Client policies run as demonstration indicators.'}
          {connectionStatus === 'initializing' && 'Connecting to CometChat messaging and WebRTC media relays…'}
          {connectionStatus === 'auth_failed' && (initError ? `Authentication failed: ${initError}. WebRTC & real-time messaging are offline.` : 'CometChat authentication failed. Remote calling & messaging offline.')}
          {connectionStatus === 'offline_demo' && 'Local sandbox active. Production moderation requires CometChat Dashboard Rules Engine setup.'}
        </div>
      </div>
    </aside>
  );
}
