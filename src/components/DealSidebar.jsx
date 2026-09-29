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
  const [offerNote, setOfferNote] = useState('Payment ready in escrow. Please show serial on video.');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount)) return;
    onMakeOffer(Number(offerAmount), offerNote);
    setShowOfferForm(false);
  };

  return (
    <aside
      style={{
        width: '340px',
        flexShrink: 0,
        height: '100%',
        background: '#0a0e18',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '20px'
      }}
    >
      {/* Product Image & Badges */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
        <img
          src={CURRENT_ITEM.images[0]}
          alt={CURRENT_ITEM.title}
          style={{ width: '100%', height: '190px', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '6px'
          }}
        >
          <span className="badge badge-emerald" style={{ backdropFilter: 'blur(8px)', background: 'rgba(6, 78, 59, 0.85)' }}>
            <ShieldCheck size={12} /> Authenticated
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#e2e8f0'
          }}
        >
          1/2 Photos
        </div>
      </div>

      {/* Title & Asking Price */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Vintage Luxury Watch
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '4px 0 8px 0', lineHeight: 1.35, color: '#f8fafc' }}>
          {CURRENT_ITEM.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
            ${CURRENT_ITEM.price.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Asking Price (USD)</span>
        </div>
      </div>

      {/* Item Specs Table */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Reference:</span>
          <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{CURRENT_ITEM.reference}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Condition:</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>{CURRENT_ITEM.condition}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Serial:</span>
          <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{CURRENT_ITEM.serial}</span>
        </div>
      </div>

      {/* Quick Action Center */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {/* Live Video Inspection Button (CometChat Calls SDK) */}
        <button
          onClick={onStartCall}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            transition: 'transform 0.15s'
          }}
        >
          <Video size={18} />
          <span>Start Video Inspection</span>
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
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <DollarSign size={16} color="#34d399" />
            <span>{showOfferForm ? 'Cancel Offer' : 'Make an Offer'}</span>
          </button>
        )}

        {/* Offer Form Drawer */}
        {showOfferForm && (
          <form
            onSubmit={handleSubmitOffer}
            style={{
              padding: '14px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              animation: 'slideDown 0.2s ease-out'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>Your Offer Amount (USD)</div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }}>$</span>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 24px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontWeight: 700,
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
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                resize: 'none'
              }}
            />

            <button
              type="submit"
              style={{
                padding: '9px',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Submit Smart Offer Card
            </button>
          </form>
        )}
      </div>

      {/* Escrow & Trust Info */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          fontSize: '0.75rem',
          color: '#cbd5e1'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>
          <Sparkles size={14} /> CometChat AI Guardrails Active
        </div>
        <div>
          Real-time profanity filtering, PII shielding, and video encryption are active for this DealRoom session.
        </div>
      </div>
    </aside>
  );
}
