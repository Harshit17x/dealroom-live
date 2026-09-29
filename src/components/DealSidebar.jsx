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
  Info
} from 'lucide-react';

export default function DealSidebar({
  currentRole,
  onMakeOffer,
  onStartCall,
  activeOffer
}) {
  const [offerAmount, setOfferAmount] = useState('13800');
  const [offerNote, setOfferNote] = useState('Escrow ready. Please verify serial stamps on live video.');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount)) return;
    onMakeOffer(Number(offerAmount), offerNote);
    setShowOfferForm(false);
  };

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
          src={CURRENT_ITEM.images[0]}
          alt={CURRENT_ITEM.title}
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
        <div style={{ fontSize: '0.74rem', color: 'var(--cc-purple)', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Geneva Luxury Vault
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 8px 0', lineHeight: 1.35, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
          {CURRENT_ITEM.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            ${CURRENT_ITEM.price.toLocaleString()}
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
          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{CURRENT_ITEM.reference}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
          <span style={{ color: 'var(--cc-emerald)', fontWeight: 700 }}>{CURRENT_ITEM.condition}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Serial Stamp:</span>
          <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{CURRENT_ITEM.serial}</span>
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
            background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--cc-purple-glow)',
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
                onChange={(e) => setOfferAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 24px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '7px',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              />
            </div>

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
                background: 'var(--cc-purple)',
                color: '#fff',
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

      {/* CometChat Security Guarantee */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px',
          background: 'var(--cc-purple-light)',
          border: '1px solid rgba(104, 81, 214, 0.25)',
          borderRadius: '10px',
          fontSize: '0.74rem',
          color: 'var(--text-sub)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--cc-purple)', marginBottom: '3px' }}>
          <Sparkles size={14} /> CometChat AI Guardrails Active
        </div>
        <div>
          Real-time profanity masking, PII protection, and WebRTC encrypted video inspection are live.
        </div>
      </div>
    </aside>
  );
}
