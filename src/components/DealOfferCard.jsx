import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Video,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';

export default function DealOfferCard({
  offer,
  isSender,
  onAccept,
  onCounter,
  onDecline,
  onRequestVideo
}) {
  const [counterInput, setCounterInput] = useState('');
  const [showCounterBox, setShowCounterBox] = useState(false);

  const { dealId, amount, itemTitle, status = 'pending', counterAmount, note } = offer;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6851D6', '#3399FF', '#10B981', '#F59E0B']
    });
  };

  const handleAcceptClick = () => {
    triggerConfetti();
    if (onAccept) onAccept(dealId, amount);
  };

  const handleCounterSubmit = (e) => {
    e.preventDefault();
    if (!counterInput || isNaN(counterInput)) return;
    if (onCounter) onCounter(dealId, Number(counterInput));
    setShowCounterBox(false);
    setCounterInput('');
  };

  return (
    <div
      style={{
        margin: '10px 0',
        padding: '16px',
        borderRadius: '14px',
        background:
          status === 'accepted'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(104, 81, 214, 0.08) 100%)'
            : 'var(--bg-surface)',
        border:
          status === 'accepted'
            ? '1.5px solid rgba(16, 185, 129, 0.45)'
            : '1.5px solid rgba(104, 81, 214, 0.35)',
        boxShadow:
          status === 'accepted'
            ? '0 6px 24px rgba(16, 185, 129, 0.15)'
            : '0 4px 20px rgba(104, 81, 214, 0.08)',
        maxWidth: '380px',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header with CometChat Styled Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'var(--cc-purple-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cc-purple)'
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--cc-purple)'
            }}
          >
            CometChat Smart Offer
          </span>
        </div>

        {/* Status Indicator */}
        {status === 'pending' && (
          <span className="cc-badge cc-badge-purple">
            <Clock size={11} /> Pending Review
          </span>
        )}
        {status === 'accepted' && (
          <span className="cc-badge cc-badge-emerald">
            <CheckCircle2 size={11} /> Escrow Funded
          </span>
        )}
        {status === 'countered' && (
          <span className="cc-badge cc-badge-blue">
            <ArrowUpRight size={11} /> Countered
          </span>
        )}
        {status === 'declined' && (
          <span className="cc-badge cc-badge-rose">
            <XCircle size={11} /> Declined
          </span>
        )}
      </div>

      {/* Target Item Title */}
      <div
        style={{
          fontSize: '0.86rem',
          color: 'var(--text-main)',
          marginBottom: '10px',
          fontWeight: 600,
          lineHeight: 1.3
        }}
      >
        {itemTitle}
      </div>

      {/* Pricing Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          padding: '10px 14px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          marginBottom: '12px'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offered:</span>
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: status === 'accepted' ? 'var(--cc-emerald)' : 'var(--cc-purple)'
          }}
        >
          ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        {counterAmount && (
          <span style={{ fontSize: '0.78rem', color: 'var(--cc-blue)', marginLeft: 'auto', fontWeight: 600 }}>
            Counter: ${Number(counterAmount).toLocaleString()}
          </span>
        )}
      </div>

      {note && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontStyle: 'italic', marginBottom: '12px' }}>
          "{note}"
        </div>
      )}

      {/* Interactive Action Controls */}
      {status === 'pending' && (
        <div>
          {!isSender ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAcceptClick}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'var(--cc-emerald)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  <CheckCircle2 size={15} /> Accept Deal
                </button>
                <button
                  onClick={() => setShowCounterBox(!showCounterBox)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-strong)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Counter
                </button>
                <button
                  onClick={() => onDecline && onDecline(dealId)}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'var(--cc-rose-light)',
                    color: 'var(--cc-rose)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={15} />
                </button>
              </div>

              {/* Counter Input Popover */}
              {showCounterBox && (
                <form onSubmit={handleCounterSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="number"
                    placeholder="Enter counter amount ($)"
                    value={counterInput}
                    onChange={(e) => setCounterInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--cc-purple)',
                      borderRadius: '7px',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '7px 12px',
                      background: 'var(--cc-purple)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--cc-purple)" />
              <span>Offer sent to seller. Waiting for response...</span>
            </div>
          )}
        </div>
      )}

      {/* Escrow Locked State */}
      {status === 'accepted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cc-emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>Funds in Escrow. Video inspection unlocks payout.</span>
          </div>

          <button
            onClick={onRequestVideo}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, var(--cc-purple) 0%, var(--cc-blue) 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--cc-purple-glow)'
            }}
          >
            <Video size={16} /> Launch Live Video Inspection
          </button>
        </div>
      )}
    </div>
  );
}
